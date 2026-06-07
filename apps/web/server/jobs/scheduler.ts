import {
  analyticsQueue,
  aiSummaryQueue,
  JOB_NIGHTLY_ANALYTICS,
  JOB_WEEKLY_SUMMARIES,
} from "./queue";

// ─── Cron schedules ──────────────────────────────────────────────────
// BullMQ repeatable jobs use node-cron style 5/6-field expressions in the
// server's local timezone (TZ env var). Adjust TZ in the container if needed.
//
//   NIGHTLY_ANALYTICS_CRON  "0 2 * * *"   → every day at 02:00
//   WEEKLY_SUMMARIES_CRON   "0 6 * * 1"   → every Monday at 06:00
const NIGHTLY_ANALYTICS_CRON = "0 2 * * *";
const WEEKLY_SUMMARIES_CRON = "0 6 * * 1";

// Stable jobIds so re-running the scheduler (deploys, restarts) updates the
// existing repeatable instead of creating duplicates.
const NIGHTLY_ANALYTICS_JOB_ID = "repeat:nightly-analytics";
const WEEKLY_SUMMARIES_JOB_ID = "repeat:weekly-summaries";

/**
 * Register (idempotently) the repeatable jobs for both queues.
 * Safe to call on every worker startup.
 */
export async function registerRepeatableJobs(): Promise<void> {
  await analyticsQueue.add(
    JOB_NIGHTLY_ANALYTICS,
    { firedAt: new Date().toISOString() },
    {
      jobId: NIGHTLY_ANALYTICS_JOB_ID,
      repeat: { pattern: NIGHTLY_ANALYTICS_CRON },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 100 },
    },
  );

  await aiSummaryQueue.add(
    JOB_WEEKLY_SUMMARIES,
    { firedAt: new Date().toISOString() },
    {
      jobId: WEEKLY_SUMMARIES_JOB_ID,
      repeat: { pattern: WEEKLY_SUMMARIES_CRON },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 100 },
    },
  );

  console.log(
    `[scheduler] registered repeatables — analytics "${NIGHTLY_ANALYTICS_CRON}", ai-summaries "${WEEKLY_SUMMARIES_CRON}"`,
  );
}

// Allow running this module directly to (re)register schedules:
//   tsx server/jobs/scheduler.ts
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  registerRepeatableJobs()
    .then(() => {
      console.log("[scheduler] done");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[scheduler] failed", err);
      process.exit(1);
    });
}
