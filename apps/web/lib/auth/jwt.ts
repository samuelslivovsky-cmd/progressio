import { SignJWT, jwtVerify } from "jose";
import { ACCESS_TOKEN_TTL, type AuthUser } from "./config";

// Edge-safe JWT helpers. This module imports ONLY `jose` (+ config) so it can be
// used from Next.js middleware (Edge runtime). The access token is a stateless
// HS256 JWT, verified by signature only — no Redis/DB lookup — so the same
// verify path runs in both Edge middleware and Node route handlers.

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_ACCESS_SECRET for access-token signing.");
  }
  return new TextEncoder().encode(secret);
}

/** Sign a short-lived access JWT for the given user. */
export async function signAccessToken(user: AuthUser): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({ profileId: user.profileId, role: user.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.userId)
    .setJti(crypto.randomUUID())
    .setIssuedAt(now)
    .setExpirationTime(now + ACCESS_TOKEN_TTL)
    .sign(getAccessSecret());
}

/**
 * Verify an access JWT. Returns the AuthUser on success, or null if the token
 * is missing, malformed, expired, or has an invalid signature.
 */
export async function verifyAccessToken(jwt: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(jwt, getAccessSecret(), {
      algorithms: ["HS256"],
    });
    const userId = payload.sub;
    const profileId = payload.profileId;
    const role = payload.role;
    if (
      typeof userId !== "string" ||
      typeof profileId !== "string" ||
      typeof role !== "string"
    ) {
      return null;
    }
    return { userId, profileId, role };
  } catch {
    return null;
  }
}
