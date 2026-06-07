import { redis } from "@/lib/redis";
import { requestMeta } from "@/app/api/auth/_shared";

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetSec: number;
}

/**
 * Redis fixed-window rate limiter.
 *
 * Atomically increments `rl:{key}`; on the first hit of a window it sets the
 * TTL to `windowSec`. Reads the remaining TTL to report `resetSec`. The whole
 * thing is one pipeline round-trip.
 */
export async function rateLimit(opts: {
  key: string;
  limit: number;
  windowSec: number;
}): Promise<RateLimitResult> {
  const { key, limit, windowSec } = opts;
  const redisKey = `rl:${key}`;

  // INCR then read TTL in a single round-trip.
  const results = await redis
    .multi()
    .incr(redisKey)
    .ttl(redisKey)
    .exec();

  // ioredis exec() returns [[err, value], ...] or null if the multi was aborted.
  const count = Number(results?.[0]?.[1] ?? 0);
  let ttl = Number(results?.[1]?.[1] ?? -1);

  // First hit of the window (or key with no expiry): (re)set the TTL.
  if (count === 1 || ttl < 0) {
    await redis.expire(redisKey, windowSec);
    ttl = windowSec;
  }

  const ok = count <= limit;
  const remaining = Math.max(0, limit - count);
  return { ok, remaining, resetSec: ttl };
}

/** A 429 Response with a Slovak message and a Retry-After header. */
export function tooManyResponse(resetSec: number): Response {
  return Response.json(
    { error: "Príliš veľa pokusov, skús neskôr." },
    {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, resetSec)) },
    },
  );
}

/**
 * Convenience: rate-limit a Request by its client IP. Returns the limiter
 * result so callers can branch on `ok` and build the 429 themselves.
 */
export async function rateLimitByIp(
  req: Request,
  opts: { scope: string; limit: number; windowSec: number },
): Promise<RateLimitResult> {
  const { ip } = requestMeta(req);
  return rateLimit({
    key: `${opts.scope}:ip:${ip ?? "unknown"}`,
    limit: opts.limit,
    windowSec: opts.windowSec,
  });
}
