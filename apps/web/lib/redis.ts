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
  return new Redis(url, {
    // Fail fast instead of buffering commands forever if Redis is down.
    maxRetriesPerRequest: 3,
    lazyConnect: false,
  });
}

export const redis = globalForRedis.redis ?? createRedisClient();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
