import { readAccessCookie } from "./cookies";
import { verifyAccessToken } from "./tokens";
import type { AuthUser } from "./config";

/**
 * Resolve the current authenticated user from the access-token cookie.
 * Returns null if there is no cookie or the token is invalid/expired.
 * Verification is signature-only (no Redis lookup) — refresh handles state.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await readAccessCookie();
  if (!token) return null;
  return verifyAccessToken(token);
}
