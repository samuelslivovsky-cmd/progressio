// Central auth configuration: token TTLs, cookie naming, and shared types.
//
// Cookie naming is env-aware. In production we use the `__Host-` prefix +
// Secure (browser-enforced: requires Secure, Path=/, no Domain) for the
// access cookie. The refresh cookie is scoped to a sub-path so it CANNOT use
// the `__Host-` prefix (that prefix mandates Path=/). In dev we drop the
// prefix and Secure so plain http://localhost works.

const isProd = process.env.NODE_ENV === "production";

function readTtl(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Access token lifetime in seconds (default 15 min). */
export const ACCESS_TOKEN_TTL = readTtl("ACCESS_TOKEN_TTL", 900);

/** Refresh token lifetime in seconds (default 7 days). */
export const REFRESH_TOKEN_TTL = readTtl("REFRESH_TOKEN_TTL", 604800);

/** Whether cookies should be marked Secure (and use the __Host- prefix). */
export const COOKIE_SECURE = isProd;

/**
 * Access-token cookie name. May carry the `__Host-` prefix in prod because it
 * lives at Path=/.
 */
export const ACCESS_COOKIE_NAME = isProd
  ? "__Host-progressio_access"
  : "progressio_access";

/**
 * Refresh-token cookie name. Scoped to /api/auth/refresh, so it must NOT use
 * the `__Host-` prefix (the prefix requires Path=/).
 */
export const REFRESH_COOKIE_NAME = "progressio_refresh";

/** Path the refresh cookie is scoped to (only sent to the refresh endpoint). */
export const REFRESH_COOKIE_PATH = "/api/auth/refresh";

/** Minimal authenticated principal carried in the access JWT. */
export type AuthUser = {
  userId: string;
  profileId: string;
  role: string;
};
