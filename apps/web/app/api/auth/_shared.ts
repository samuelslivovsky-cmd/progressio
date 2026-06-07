// Shared helpers for the auth route handlers.

import { getClientIp } from "@/lib/auth/ip";

/** Extract client metadata (User-Agent + trusted client IP) from a request. */
export function requestMeta(req: Request): {
  userAgent: string | null;
  ip: string | null;
} {
  const userAgent = req.headers.get("user-agent");
  const ip = getClientIp(req.headers);
  return { userAgent: userAgent ?? null, ip };
}

/** A 503 Response for when a backing service (Redis) is unavailable. */
export function serviceUnavailableResponse(): Response {
  return Response.json(
    { error: "Služba je dočasne nedostupná." },
    { status: 503 },
  );
}

/**
 * Run a security-critical Redis-backed step (token issuance/rotation, etc.).
 * On a Redis/connection failure we MUST fail closed — never silently fall back.
 * Returns the operation's value, or `SERVICE_UNAVAILABLE` if it threw.
 */
export const SERVICE_UNAVAILABLE = Symbol("service-unavailable");

export async function withRedisFailClosed<T>(
  op: () => Promise<T>,
): Promise<T | typeof SERVICE_UNAVAILABLE> {
  try {
    return await op();
  } catch (err) {
    console.error("[auth] redis-backed operation failed (fail-closed)", err);
    return SERVICE_UNAVAILABLE;
  }
}
