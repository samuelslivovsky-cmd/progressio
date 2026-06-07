import type { Job } from "bullmq";
import { prisma, Role } from "@progressio/db";
import { startOfDay, startOfWeek, subDays } from "date-fns";
import * as analytics from "@/lib/analytics";
import type { WeeklySummariesPayload } from "../queue";

type FoodItemRow = {
  amount: number;
  food: { calories: number; servingSize: number } | null;
};

/**
 * Weekly AI summary processor.
 *
 * For every CLIENT-role profile, build the last-7-days highlights from real
 * logged data (REUSES @/lib/analytics for adherence) and write one
 * WeeklySummary row for the current ISO week.
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
  // ISO week start (Monday) for the week we are summarising.
  const weekStart = startOfWeek(startOfDay(new Date()), { weekStartsOn: 1 });
  const from = subDays(startOfDay(new Date()), 7);

  const clients = await prisma.profile.findMany({
    where: { role: Role.CLIENT },
    select: { id: true, name: true },
  });

  console.log(
    `[ai-summary] job ${job.id} firedAt=${job.data.firedAt} — processing ${clients.length} clients`,
  );

  let processed = 0;
  let failed = 0;

  for (const { id: clientId, name } of clients) {
    try {
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
        if (!item.food || item.food.servingSize <= 0) return sum;
        return sum + (item.food.calories * item.amount) / item.food.servingSize;
      }, 0);
      const avgKcal = foodItems.length > 0 ? Math.round(totalKcal / 7) : 0;

      const firstWeight = weights[0]?.weight ?? null;
      const lastWeight = weights.length > 0 ? weights[weights.length - 1]!.weight : null;
      const weightDelta =
        firstWeight != null && lastWeight != null
          ? Math.round((lastWeight - firstWeight) * 10) / 10
          : null;

      const adherence = Math.round((trainingAdherence + mealAdherence) / 2);

      const highlights = {
        adherence,
        avgKcal,
        weightDelta,
        workoutsCompleted,
      };

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

      // One summary per client per week (no DB unique constraint → manual upsert).
      const existing = await prisma.weeklySummary.findFirst({
        where: { clientId, weekStart },
        select: { id: true },
      });
      if (existing) {
        await prisma.weeklySummary.update({
          where: { id: existing.id },
          data: { content, highlights },
        });
      } else {
        await prisma.weeklySummary.create({
          data: { clientId, weekStart, content, highlights },
        });
      }

      processed++;
    } catch (err) {
      failed++;
      console.error(`[ai-summary] client ${clientId} failed:`, err);
    }
  }

  console.log(`[ai-summary] job ${job.id} done — processed=${processed} failed=${failed}`);
  return { processed, failed };
}
