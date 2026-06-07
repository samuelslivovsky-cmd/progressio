import Redis from "ioredis";

// ioredis singleton. The global-object pattern prevents opening a new
// connection on every dev hot-reload (mirrors the Prisma client singleton).
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

function createRedisClient(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("Missing REDIS_URL for Redis connection.");
  }
  const client = new Redis(url, {
    // Fail fast instead of buffering commands forever if Redis is down.
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });
  // Without an "error" listener, ioredis emits an unhandled 'error' event that
  // crashes the Node process whenever the connection drops. Log and keep going;
  // individual commands still reject so callers can fail-soft/fail-closed.
  client.on("error", (e: Error) => console.error("[redis]", e.message));
  return client;
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
