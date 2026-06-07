import type { Job } from "bullmq";
import { prisma, Role } from "@progressio/db";
import { startOfDay } from "date-fns";
import * as analytics from "@/lib/analytics";
import type { NightlyAnalyticsPayload } from "../queue";

/**
 * Nightly analytics processor.
 *
 * For every CLIENT-role profile:
 *  - compute adherence / drop-off metrics (REUSES @/lib/analytics — the exact
 *    same functions the tRPC analytics router calls)
 *  - upsert one AnalyticsSnapshot row for today
 *  - (re)generate alerts via analytics.generateAlerts
 *
 * Runs as a single job; iterates clients sequentially to keep DB load bounded.
 */
export async function processNightlyAnalytics(
  job: Job<NightlyAnalyticsPayload>,
): Promise<{ processed: number; failed: number }> {
  const today = startOfDay(new Date());
  const clients = await prisma.profile.findMany({
    where: { role: Role.CLIENT },
    select: { id: true },
  });

  console.log(
    `[analytics] job ${job.id} firedAt=${job.data.firedAt} — processing ${clients.length} clients`,
  );

  let processed = 0;
  let failed = 0;

  for (const { id: clientId } of clients) {
    try {
      const [trainingAdherence, calorieAdherence, dropOffScore] = await Promise.all([
        analytics.getWorkoutAdherence(prisma, clientId, 14),
        analytics.getMealAdherence(prisma, clientId, 14),
        analytics.getDropOffScore(prisma, clientId),
      ]);

      // Composite adherence (mirrors how the dashboard blends the two).
      const adherenceScore = Math.round((trainingAdherence + calorieAdherence) / 2);

      // One snapshot per client per day. AnalyticsSnapshot has no unique
      // constraint on (clientId, date), so emulate an upsert with a manual
      // find → update | create to avoid duplicate rows on re-runs.
      const existing = await prisma.analyticsSnapshot.findFirst({
        where: { clientId, date: today },
        select: { id: true },
      });
      const data = {
        adherenceScore,
        calorieAdherence,
        trainingAdherence,
        dropOffScore,
      };
      if (existing) {
        await prisma.analyticsSnapshot.update({ where: { id: existing.id }, data });
      } else {
        await prisma.analyticsSnapshot.create({
          data: { clientId, date: today, ...data },
        });
      }

      // Regenerate alerts (no-op for clients without a trainer link).
      await analytics.generateAlerts(prisma, clientId);

      processed++;
    } catch (err) {
      failed++;
      console.error(`[analytics] client ${clientId} failed:`, err);
    }
  }

  console.log(`[analytics] job ${job.id} done — processed=${processed} failed=${failed}`);
  return { processed, failed };
}
