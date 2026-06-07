import { NextResponse, type NextRequest } from "next/server";
import { ACCESS_COOKIE_NAME } from "@/lib/auth/config";
// Import the verify fn from the edge-safe jose-only module ONLY. Middleware
// runs on the Edge runtime and must not pull in node:crypto / ioredis / prisma.
import { verifyAccessToken } from "@/lib/auth/jwt";

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(ACCESS_COOKIE_NAME)?.value;
  const user = token ? await verifyAccessToken(token) : null;

  if (!user) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth|sw\\.js|manifest\\.webmanifest|icon-192|icon-512|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
