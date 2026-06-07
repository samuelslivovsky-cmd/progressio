import Redis, { type RedisOptions } from "ioredis";

// Dedicated ioredis connection factory for BullMQ.
//
// BullMQ requires `maxRetriesPerRequest: null` on its connection (blocking
// commands like BRPOPLPUSH would otherwise be aborted). We therefore do NOT
// reuse the app's `@/lib/redis` singleton (which uses maxRetriesPerRequest: 3).
// Queues, Workers and QueueSchedulers each get their own connection via this
// factory, mirroring the singleton's "fail fast if REDIS_URL is missing".

const BULLMQ_REDIS_OPTIONS: RedisOptions = {
  // Required by BullMQ for blocking commands.
  maxRetriesPerRequest: null,
};

/** Create a fresh ioredis connection configured for BullMQ. */
export function createBullConnection(): Redis {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("Missing REDIS_URL for BullMQ connection.");
  }
  return new Redis(url, BULLMQ_REDIS_OPTIONS);
}
