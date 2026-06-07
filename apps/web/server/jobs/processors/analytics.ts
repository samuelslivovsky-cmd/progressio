import type { Job } from "bullmq";
import { prisma, Role } from "@progressio/db";
import { startOfDay } from "date-fns";
import pLimit from "p-limit";
import * as analytics from "@/lib/analytics";
import type { NightlyAnalyticsPayload } from "../queue";

// Process clients in bounded-concurrency batches so a large client base does
// not exhaust the DB connection pool. Tunables:
const BATCH_SIZE = 200; // cursor page size for the CLIENT scan
const CONCURRENCY = 5; // max in-flight clients per batch

/**
 * Nightly analytics processor.
 *
 * For every CLIENT-role profile:
 *  - compute adherence / drop-off metrics (REUSES @/lib/analytics — the exact
 *    same functions the tRPC analytics router calls)
 *  - upsert one AnalyticsSnapshot row for the tick date
 *  - (re)generate alerts via analytics.generateAlerts
 *
 * The target date is derived from `job.data.firedAt` (NOT `new Date()`) so a
 * retried/delayed job writes the snapshot for the day the tick fired — this is
 * what makes the BullMQ retry policy safe (combined with the upsert below).
 * Clients are scanned by cursor in batches and processed with bounded
 * concurrency; each client has its own try/catch so one failure never aborts
 * the batch.
 */
export async function processNightlyAnalytics(
  job: Job<NightlyAnalyticsPayload>,
): Promise<{ processed: number; failed: number }> {
  const today = startOfDay(new Date(job.data.firedAt));

  console.log(
    `[analytics] job ${job.id} firedAt=${job.data.firedAt} — starting batched scan`,
  );

  const limit = pLimit(CONCURRENCY);
  let processed = 0;
  let failed = 0;
  let cursor: string | undefined;

  for (;;) {
    const batch = await prisma.profile.findMany({
      where: { role: Role.CLIENT },
      select: { id: true },
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    if (batch.length === 0) break;

    await Promise.all(
      batch.map(({ id: clientId }) =>
        limit(async () => {
          try {
            await processClient(clientId, today);
            processed++;
          } catch (err) {
            failed++;
            console.error(`[analytics] client ${clientId} failed:`, err);
          }
        }),
      ),
    );

    cursor = batch[batch.length - 1]!.id;
    if (batch.length < BATCH_SIZE) break;
  }

  console.log(`[analytics] job ${job.id} done — processed=${processed} failed=${failed}`);
  return { processed, failed };
}

async function processClient(clientId: string, date: Date): Promise<void> {
  const [trainingAdherence, calorieAdherence, dropOffScore] = await Promise.all([
    analytics.getWorkoutAdherence(prisma, clientId, 14),
    analytics.getMealAdherence(prisma, clientId, 14),
    analytics.getDropOffScore(prisma, clientId),
  ]);

  // Composite adherence (mirrors how the dashboard blends the two).
  const adherenceScore = Math.round((trainingAdherence + calorieAdherence) / 2);

  const data = { adherenceScore, calorieAdherence, trainingAdherence, dropOffScore };

  // One snapshot per client per day, via the (clientId, date) unique index —
  // idempotent on retries/re-runs.
  await prisma.analyticsSnapshot.upsert({
    where: { clientId_date: { clientId, date } },
    update: data,
    create: { clientId, date, ...data },
  });

  // Regenerate alerts (no-op for clients without a trainer link).
  await analytics.generateAlerts(prisma, clientId);
}
