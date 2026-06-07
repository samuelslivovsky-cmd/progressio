import { signAccessToken } from "@/lib/auth/tokens";
import { rotateRefresh } from "@/lib/auth/token-store";
import {
  setAuthCookies,
  clearAuthCookies,
  readRefreshCookie,
} from "@/lib/auth/cookies";
import {
  requestMeta,
  withRedisFailClosed,
  SERVICE_UNAVAILABLE,
  serviceUnavailableResponse,
} from "../_shared";
import { rateLimitByIp, tooManyResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Programmatic refresh (called by client fetch). Rotates the refresh token and
 * sets new cookies, returning JSON. 401 on failure.
 */
export async function POST(req: Request) {
  // Rate limit by IP: 30 / 60s.
  const ipLimit = await rateLimitByIp(req, {
    scope: "refresh",
    limit: 30,
    windowSec: 60,
  });
  if (!ipLimit.ok) return tooManyResponse(ipLimit.resetSec);

  const raw = await readRefreshCookie();
  if (!raw) {
    await clearAuthCookies();
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const meta = requestMeta(req);
  const rotated = await withRedisFailClosed(() =>
    rotateRefresh(raw, { userAgent: meta.userAgent, ip: meta.ip }),
  );
  if (rotated === SERVICE_UNAVAILABLE) return serviceUnavailableResponse();
  if (!rotated) {
    await clearAuthCookies();
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const access = await signAccessToken(rotated.user);
  await setAuthCookies(access, rotated.raw);

  return Response.json({ ok: true });
}

/** Validate a `next` redirect target: must be a same-origin absolute path. */
function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/";
}

/**
 * Navigation refresh (browser document request). The middleware bounces an
 * expired/missing access token here on a document GET. The refresh cookie is
 * path-scoped to /api/auth/refresh, so it IS sent on this request. We rotate it,
 * set fresh cookies, and 303-redirect back to the originally requested page.
 *
 * On failure we clear cookies and 303 to /login. Success appends `?_authretry=1`
 * so the middleware does not bounce here again in a loop if the new cookie is
 * somehow still not honored.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const next = safeNext(url.searchParams.get("next"));

  // Rate limit by IP: 30 / 60s (shared budget with POST).
  const ipLimit = await rateLimitByIp(req, {
    scope: "refresh",
    limit: 30,
    windowSec: 60,
  });
  if (!ipLimit.ok) return tooManyResponse(ipLimit.resetSec);

  const raw = await readRefreshCookie();
  if (!raw) {
    await clearAuthCookies();
    return Response.redirect(new URL("/login", url), 303);
  }

  const meta = requestMeta(req);
  const rotated = await withRedisFailClosed(() =>
    rotateRefresh(raw, { userAgent: meta.userAgent, ip: meta.ip }),
  );
  if (rotated === SERVICE_UNAVAILABLE) return serviceUnavailableResponse();
  if (!rotated) {
    await clearAuthCookies();
    return Response.redirect(new URL("/login", url), 303);
  }

  const access = await signAccessToken(rotated.user);
  await setAuthCookies(access, rotated.raw);

  // Append _authretry=1 so middleware won't re-bounce on a flapping cookie.
  const dest = new URL(next, url);
  dest.searchParams.set("_authretry", "1");
  return Response.redirect(dest, 303);
}
