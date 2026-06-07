import { Worker } from "bullmq";
import { createBullConnection } from "./connection";
import {
  ANALYTICS_QUEUE_NAME,
  AI_SUMMARY_QUEUE_NAME,
  type NightlyAnalyticsPayload,
  type WeeklySummariesPayload,
} from "./queue";
import { processNightlyAnalytics } from "./processors/analytics";
import { processWeeklySummaries } from "./processors/ai-summary";
import { registerRepeatableJobs } from "./scheduler";

// Standalone BullMQ worker process. This is the entry the worker container runs
// (`pnpm --filter @progressio/web run worker`). It needs REDIS_URL + DATABASE_URL
// in its environment.

const analyticsWorker = new Worker<NightlyAnalyticsPayload>(
  ANALYTICS_QUEUE_NAME,
  (job) => processNightlyAnalytics(job),
  { connection: createBullConnection() },
);

const aiSummaryWorker = new Worker<WeeklySummariesPayload>(
  AI_SUMMARY_QUEUE_NAME,
  (job) => processWeeklySummaries(job),
  { connection: createBullConnection() },
);

for (const worker of [analyticsWorker, aiSummaryWorker]) {
  worker.on("completed", (job) => {
    console.log(`[worker] ${worker.name} job ${job.id} (${job.name}) completed`);
  });
  worker.on("failed", (job, err) => {
    console.error(`[worker] ${worker.name} job ${job?.id} (${job?.name}) failed:`, err);
  });
  worker.on("error", (err) => {
    console.error(`[worker] ${worker.name} error:`, err);
  });
}

// Register the repeatable (cron) jobs on startup so a freshly-started worker
// container always has the schedules in place. Idempotent via stable jobIds.
registerRepeatableJobs().catch((err) => {
  console.error("[worker] failed to register repeatable jobs:", err);
});

console.log(
  `[worker] started — listening on "${ANALYTICS_QUEUE_NAME}" and "${AI_SUMMARY_QUEUE_NAME}"`,
);

// Graceful shutdown.
async function shutdown(signal: string): Promise<void> {
  console.log(`[worker] ${signal} received — closing workers`);
  await Promise.all([analyticsWorker.close(), aiSummaryWorker.close()]);
  process.exit(0);
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
