import { readAccessCookie } from "./cookies";
import { verifyAccessToken } from "./tokens";
import type { AuthUser } from "./config";

/**
 * Resolve the current authenticated user from the access-token cookie.
 * Returns null if there is no cookie or the token is invalid/expired.
 *
 * REVOCATION MODEL (accepted trade-off): the access token is verified by
 * SIGNATURE + EXPIRY ONLY — there is no per-request Redis/DB check. This is
 * deliberate: it keeps verification stateless so the exact same `jwt.ts` path
 * runs in Edge middleware (which cannot touch ioredis/prisma). The cost is a
 * revocation window of up to the access-token TTL (<= 15 min): a token that was
 * valid when minted stays accepted until it expires. Immediate revocation is
 * achieved on the refresh side — rotating/revoking the refresh-token family
 * (logout, logout-all, reuse-detection) prevents new access tokens from being
 * issued, so within one TTL the session is fully dead.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await readAccessCookie();
  if (!token) return null;
  return verifyAccessToken(token);
}
