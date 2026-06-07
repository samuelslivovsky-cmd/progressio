import { signAccessToken } from "@/lib/auth/tokens";
import { rotateRefresh } from "@/lib/auth/token-store";
import { setAuthCookies, clearAuthCookies, readRefreshCookie } from "@/lib/auth/cookies";
import { requestMeta } from "../_shared";
import { rateLimitByIp, tooManyResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

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
  const result = await rotateRefresh(raw, {
    userAgent: meta.userAgent,
    ip: meta.ip,
  });
  if (!result) {
    await clearAuthCookies();
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const access = await signAccessToken(result.user);
  await setAuthCookies(access, result.raw);

  return Response.json({ ok: true });
}
