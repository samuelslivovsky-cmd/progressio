import { Queue } from "bullmq";
import { createBullConnection } from "./connection";

// ─── Queue names ─────────────────────────────────────────────────────
export const ANALYTICS_QUEUE_NAME = "analytics";
export const AI_SUMMARY_QUEUE_NAME = "ai-summaries";

// ─── Job names ───────────────────────────────────────────────────────
/** Nightly tick: compute an AnalyticsSnapshot for every CLIENT. */
export const JOB_NIGHTLY_ANALYTICS = "nightly-analytics" as const;
/** Weekly tick: generate a WeeklySummary for every CLIENT. */
export const JOB_WEEKLY_SUMMARIES = "weekly-summaries" as const;

// ─── Payload types ───────────────────────────────────────────────────
/** Tick payloads carry the wall-clock time the tick fired (for logging/idempotency). */
export type NightlyAnalyticsPayload = { firedAt: string };
export type WeeklySummariesPayload = { firedAt: string };

export type AnalyticsJobName = typeof JOB_NIGHTLY_ANALYTICS;
export type AiSummaryJobName = typeof JOB_WEEKLY_SUMMARIES;

// ─── Queues ──────────────────────────────────────────────────────────
// Each Queue gets its own BullMQ connection (do NOT share the app singleton).
export const analyticsQueue = new Queue<NightlyAnalyticsPayload, void, AnalyticsJobName>(
  ANALYTICS_QUEUE_NAME,
  { connection: createBullConnection() },
);

export const aiSummaryQueue = new Queue<WeeklySummariesPayload, void, AiSummaryJobName>(
  AI_SUMMARY_QUEUE_NAME,
  { connection: createBullConnection() },
);

// ─── Enqueue helpers ─────────────────────────────────────────────────
/** Enqueue a one-off nightly analytics tick (e.g. for manual/admin triggers). */
export function enqueueNightlyAnalytics() {
  return analyticsQueue.add(JOB_NIGHTLY_ANALYTICS, { firedAt: new Date().toISOString() });
}

/** Enqueue a one-off weekly summaries tick. */
export function enqueueWeeklySummaries() {
  return aiSummaryQueue.add(JOB_WEEKLY_SUMMARIES, { firedAt: new Date().toISOString() });
}
