import { prisma } from "@progressio/db";
import { redis } from "@/lib/redis";

// Always run on-demand so the health check reflects live DB/Redis connectivity.
export const dynamic = "force-dynamic";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms),
    ),
  ]);
}

export async function GET() {
  const [dbResult, redisResult] = await Promise.allSettled([
    withTimeout(prisma.$queryRaw`SELECT 1`, 2000),
    withTimeout(redis.ping(), 1000),
  ]);

  const dbUp = dbResult.status === "fulfilled";
  const redisUp = redisResult.status === "fulfilled";

  // DB is the hard dependency: if it's down the app is unhealthy (503). Redis
  // being down is degraded but still serviceable (200) so the deploy doesn't
  // hard-fail on a transient cache outage.
  const status = !dbUp ? "error" : redisUp ? "ok" : "degraded";
  const httpStatus = dbUp ? 200 : 503;

  return Response.json(
    {
      status,
      db: dbUp ? "up" : "down",
      redis: redisUp ? "up" : "down",
    },
    { status: httpStatus },
  );
}
