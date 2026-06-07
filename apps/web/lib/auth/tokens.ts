import { createHash, randomBytes, randomUUID } from "node:crypto";

// Access-token JWT helpers live in the edge-safe `jwt.ts` module (jose-only) so
// middleware can verify tokens on the Edge runtime. They are re-exported here so
// existing Node-side importers (token-store, route handlers) keep working.
export { signAccessToken, verifyAccessToken } from "./jwt";

// Refresh token = opaque random string, validated statefully via Redis (see
// token-store.ts). These helpers use node:crypto and must NOT be imported from
// Edge code.

/**
 * Generate an opaque refresh token. `raw` (the value stored in the cookie) is
 * `${tokenId}.${secret}`. `tokenId` doubles as the RefreshSession id / jti and
 * the Redis key suffix. Only sha256(secret) is persisted server-side.
 */
export function generateRefreshToken(): {
  tokenId: string;
  secret: string;
  raw: string;
} {
  const tokenId = randomUUID();
  const secret = randomBytes(32).toString("base64url");
  return { tokenId, secret, raw: `${tokenId}.${secret}` };
}

/** SHA-256 of a string, hex-encoded. */
export function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}
