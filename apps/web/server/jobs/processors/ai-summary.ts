import type { Job } from "bullmq";
import { prisma, Role } from "@progressio/db";
import { startOfDay, startOfWeek, subDays } from "date-fns";
import pLimit from "p-limit";
import * as analytics from "@/lib/analytics";
import { toNum } from "@/lib/utils";
import type { WeeklySummariesPayload } from "../queue";

type Dec = { toNumber(): number } | number;
type FoodItemRow = {
  amount: Dec;
  food: { calories: Dec; servingSize: Dec } | null;
};

// Bounded-concurrency batched scan tunables (see analytics processor).
const BATCH_SIZE = 200;
const CONCURRENCY = 5;

/**
 * Weekly AI summary processor.
 *
 * For every CLIENT-role profile, build the last-7-days highlights from real
 * logged data (REUSES @/lib/analytics for adherence) and write one
 * WeeklySummary row for the ISO week the tick fired in.
 *
 * The week is derived from `job.data.firedAt` (NOT `new Date()`) so a
 * retried/delayed job summarises the correct week; combined with the
 * (clientId, weekStart) upsert below this makes the BullMQ retry policy safe.
 * Clients are scanned by cursor in batches and processed with bounded
 * concurrency; each client has its own try/catch.
 *
 * The natural-language `content` is currently a deterministic placeholder.
 *   TODO(ai): replace the placeholder with a real Claude API call
 *   (claude-sonnet-4-6) using lib/ai/client-context.ts (see CLAUDE.md
 *   "Klient AI Tier" §1). The highlights computed here are real and should be
 *   fed into the prompt context. We intentionally do NOT invent fake numbers:
 *   every value in `highlights` below is derived from the DB.
 */
export async function processWeeklySummaries(
  job: Job<WeeklySummariesPayload>,
): Promise<{ processed: number; failed: number }> {
  const firedAt = startOfDay(new Date(job.data.firedAt));
  // ISO week start (Monday) for the week we are summarising.
  const weekStart = startOfWeek(firedAt, { weekStartsOn: 1 });
  const from = subDays(firedAt, 7);

  console.log(
    `[ai-summary] job ${job.id} firedAt=${job.data.firedAt} — starting batched scan`,
  );

  const limit = pLimit(CONCURRENCY);
  let processed = 0;
  let failed = 0;
  let cursor: string | undefined;

  for (;;) {
    const batch = await prisma.profile.findMany({
      where: { role: Role.CLIENT },
      select: { id: true, name: true },
      orderBy: { id: "asc" },
      take: BATCH_SIZE,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
    if (batch.length === 0) break;

    await Promise.all(
      batch.map((client) =>
        limit(async () => {
          try {
            await processClient(client.id, client.name, weekStart, from);
            processed++;
          } catch (err) {
            failed++;
            console.error(`[ai-summary] client ${client.id} failed:`, err);
          }
        }),
      ),
    );

    cursor = batch[batch.length - 1]!.id;
    if (batch.length < BATCH_SIZE) break;
  }

  console.log(`[ai-summary] job ${job.id} done — processed=${processed} failed=${failed}`);
  return { processed, failed };
}

async function processClient(
  clientId: string,
  name: string,
  weekStart: Date,
  from: Date,
): Promise<void> {
  const [trainingAdherence, mealAdherence, foodItems, weights, workoutsCompleted] =
    await Promise.all([
      analytics.getWorkoutAdherence(prisma, clientId, 7),
      analytics.getMealAdherence(prisma, clientId, 7),
      // FoodLog has no kcal column; calories are derived from each linked
      // Food (per servingSize) scaled by the logged amount.
      prisma.foodLogItem.findMany({
        where: { foodLog: { profileId: clientId, date: { gte: from } } },
        select: {
          amount: true,
          food: { select: { calories: true, servingSize: true } },
        },
      }),
      prisma.weightLog.findMany({
        where: { profileId: clientId, loggedAt: { gte: from } },
        orderBy: { loggedAt: "asc" },
        select: { weight: true },
      }),
      prisma.workoutLog.count({
        where: { profileId: clientId, date: { gte: from } },
      }),
    ]);

  const totalKcal = foodItems.reduce((sum: number, item: FoodItemRow) => {
    const servingSize = item.food ? toNum(item.food.servingSize) : 0;
    if (!item.food || servingSize <= 0) return sum;
    return sum + (toNum(item.food.calories) * toNum(item.amount)) / servingSize;
  }, 0);
  const avgKcal = foodItems.length > 0 ? Math.round(totalKcal / 7) : 0;

  const firstWeight = weights[0] ? toNum(weights[0].weight) : null;
  const lastWeight = weights.length > 0 ? toNum(weights[weights.length - 1]!.weight) : null;
  const weightDelta =
    firstWeight != null && lastWeight != null
      ? Math.round((lastWeight - firstWeight) * 10) / 10
      : null;

  const adherence = Math.round((trainingAdherence + mealAdherence) / 2);

  const highlights = { adherence, avgKcal, weightDelta, workoutsCompleted };

  // TODO(ai): generate this via Claude (claude-sonnet-4-6). Placeholder
  // markdown built from the real highlights so the row is valid + useful.
  const content = [
    `# Týždenné zhrnutie — ${name}`,
    "",
    `- Adherencia: **${adherence}%** (tréning ${trainingAdherence}%, strava ${mealAdherence}%)`,
    `- Priemerný denný príjem: **${avgKcal} kcal**`,
    `- Dokončené tréningy: **${workoutsCompleted}**`,
    weightDelta != null
      ? `- Zmena váhy: **${weightDelta >= 0 ? "+" : ""}${weightDelta} kg**`
      : `- Zmena váhy: nedostatok záznamov`,
    "",
    "_AI text generation pending — placeholder generated from logged data._",
  ].join("\n");

  // One summary per client per week, via the (clientId, weekStart) unique
  // index — idempotent on retries/re-runs.
  await prisma.weeklySummary.upsert({
    where: { clientId_weekStart: { clientId, weekStart } },
    update: { content, highlights },
    create: { clientId, weekStart, content, highlights },
  });
}
