import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth/config";
// Import the verify fn from the edge-safe jose-only module ONLY. Middleware
// runs on the Edge runtime and must not pull in node:crypto / ioredis / prisma.
import { verifyAccessToken } from "@/lib/auth/jwt";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isPublicPath(pathname: string): boolean {
  // Public pages (reachable while logged out).
  if (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname === "/api/health"
  ) {
    return true;
  }

  // Auth endpoints must always be reachable (login/refresh while logged out).
  if (pathname.startsWith("/api/auth/")) {
    return true;
  }

  // PWA assets.
  if (
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/icon-192") ||
    pathname.startsWith("/icon-512")
  ) {
    return true;
  }

  return false;
}

/**
 * CSRF defense-in-depth: for state-changing requests to the API surface, require
 * an Origin header that matches our own origin (or the configured public URL).
 * Returns a 403 response to block, or null to allow.
 */
function checkOrigin(request: NextRequest): NextResponse | null {
  const { pathname } = request.nextUrl;
  const isSensitive =
    pathname.startsWith("/api/trpc") || pathname.startsWith("/api/auth/");
  if (!isSensitive) return null;
  if (!MUTATING_METHODS.has(request.method)) return null;

  const origin = request.headers.get("origin");
  const allowed = new Set(
    [process.env.NEXT_PUBLIC_APP_URL, request.nextUrl.origin].filter(Boolean),
  );

  // Mutating requests to sensitive paths MUST carry a trusted Origin.
  if (!origin || !allowed.has(origin)) {
    return new NextResponse(JSON.stringify({ error: "Forbidden." }), {
      status: 403,
      headers: { "content-type": "application/json" },
    });
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // CSRF origin allow-list runs first for sensitive mutating requests, even on
  // otherwise-public auth/trpc endpoints.
  const originBlock = checkOrigin(request);
  if (originBlock) return originBlock;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const user = token ? await verifyAccessToken(token) : null;

  if (!user) {
    // Document navigation (GET text/html) without a valid access token: try a
    // silent refresh first. The refresh cookie is path-scoped to
    // /api/auth/refresh, so it WILL be sent there. The refresh GET handler
    // rotates and bounces back here with ?_authretry=1 to avoid loops.
    const accept = request.headers.get("accept") ?? "";
    const isDocNav =
      request.method === "GET" && accept.includes("text/html");
    const alreadyRetried = request.nextUrl.searchParams.has("_authretry");

    if (isDocNav && !alreadyRetried) {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("next", pathname + search);
      return NextResponse.redirect(refreshUrl);
    }

    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on app routes AND on the sensitive API surface (/api/trpc, /api/auth)
    // so the CSRF origin check applies there. Static assets + framework
    // internals are excluded.
    "/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.webmanifest|icon-192|icon-512|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
