import { requireClient } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { format, startOfDay, subDays } from "date-fns";
import { ClientDashboardCharts } from "@/components/client/dashboard-charts";

export default async function ClientDashboardPage() {
  const { profile } = await requireClient();

  const today = new Date();
  const todayStart = startOfDay(today);
  const sevenDaysAgo = startOfDay(subDays(today, 6));
  const thirtyDaysAgo = startOfDay(subDays(today, 29));

  const [
    lastWeight,
    lastMeasurement,
    todayFoodLog,
    todayWorkout,
    weightLogsLast14,
    weightLogsLast30,
    foodLogsLast7Days,
    foodLogsLast30Days,
    workoutLogsLast30Days,
  ] = await Promise.all([
    prisma.weightLog.findFirst({
      where: { profileId: profile.id },
      orderBy: { loggedAt: "desc" },
    }),
    prisma.measurement.findFirst({
      where: { profileId: profile.id },
      orderBy: { loggedAt: "desc" },
    }),
    prisma.foodLog.findMany({
      where: { profileId: profile.id, date: todayStart },
      include: { items: { include: { food: true } } },
    }),
    prisma.workoutLog.findFirst({
      where: { profileId: profile.id, date: todayStart },
      include: { items: { include: { exercise: true, sets: true } } },
    }),
    prisma.weightLog.findMany({
      where: { profileId: profile.id },
      orderBy: { loggedAt: "desc" },
      take: 14,
    }),
    prisma.weightLog.findMany({
      where: { profileId: profile.id, loggedAt: { gte: thirtyDaysAgo } },
      orderBy: { loggedAt: "asc" },
    }),
    prisma.foodLog.findMany({
      where: {
        profileId: profile.id,
        date: { gte: sevenDaysAgo },
      },
      include: { items: { include: { food: true } } },
    }),
    prisma.foodLog.findMany({
      where: {
        profileId: profile.id,
        date: { gte: thirtyDaysAgo },
      },
      select: { date: true },
    }),
    prisma.workoutLog.findMany({
      where: {
        profileId: profile.id,
        date: { gte: thirtyDaysAgo },
      },
      select: { date: true },
    }),
  ]);

  const datesWithActivity = new Set<string>();
  foodLogsLast30Days.forEach((f: { date: Date }) => datesWithActivity.add(format(f.date, "yyyy-MM-dd")));
  workoutLogsLast30Days.forEach((w: { date: Date }) => datesWithActivity.add(format(w.date, "yyyy-MM-dd")));
  let streakDays = 0;
  for (let d = 0; d < 365; d++) {
    const day = subDays(today, d);
    if (datesWithActivity.has(format(day, "yyyy-MM-dd"))) streakDays++;
    else break;
  }

  const weightLogsForChart = weightLogsLast30
    .map((w: { weight: number; unit: string; loggedAt: Date }) => ({
      weight: w.weight,
      unit: w.unit,
      loggedAt: w.loggedAt.toISOString(),
    }))
    .sort((a: { loggedAt: string }, b: { loggedAt: string }) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
  const weightDelta =
    weightLogsForChart.length >= 2
      ? Math.round((weightLogsForChart[weightLogsForChart.length - 1]!.weight - weightLogsForChart[0]!.weight) * 10) / 10
      : null;

  const todayFoodLogSingle = todayFoodLog?.[0];
  type FoodLogItemWithFood = { food: { calories: number; servingSize?: number } | null; amount: number };
  const totalCalories =
    todayFoodLogSingle?.items.reduce(
      (sum: number, item: FoodLogItemWithFood) => sum + (item.food ? (item.food.calories * item.amount) / (item.food.servingSize || 100) : 0),
      0
    ) ?? 0;

  const last7DaysCalories = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const log = foodLogsLast7Days.find(
      (f: { date: Date }) => format(f.date, "yyyy-MM-dd") === dateStr
    );
    const calories = log?.items.reduce(
      (s: number, item: FoodLogItemWithFood) => s + (item.food ? (item.food.calories * item.amount) / (item.food.servingSize || 100) : 0),
      0
    ) ?? 0;
    return {
      date: dateStr,
      label: format(d, "EEE d.M."),
      calories: Math.round(calories),
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dobrý deň, {profile.name}</h1>
        <p className="text-muted-foreground">{format(today, "EEEE, d. MMMM yyyy")}</p>
      </div>

      <ClientDashboardCharts
        lastWeight={
          lastWeight
            ? {
                weight: lastWeight.weight,
                unit: lastWeight.unit,
                loggedAt: lastWeight.loggedAt.toISOString(),
              }
            : null
        }
        lastMeasurement={
          lastMeasurement
            ? {
                waist: lastMeasurement.waist,
                loggedAt: lastMeasurement.loggedAt.toISOString(),
              }
            : null
        }
        todayCalories={totalCalories}
        todayFoodCount={todayFoodLogSingle?.items.length ?? 0}
        todayWorkout={
          todayWorkout
            ? {
                name: todayWorkout.name,
                itemsCount: todayWorkout.items.length,
                items: todayWorkout.items.map(
                  (item: { exercise: { name: string }; sets: unknown[] }) => ({
                    exerciseName: item.exercise.name,
                    doneSets: item.sets.length,
                    totalSets: Math.max(item.sets.length, 4),
                  })
                ),
              }
            : null
        }
        streakDays={streakDays}
        weightLogs={weightLogsLast14.map((w: { weight: number; unit: string; loggedAt: Date }) => ({
          weight: w.weight,
          unit: w.unit,
          loggedAt: w.loggedAt.toISOString(),
        }))}
        weightLogs30={weightLogsForChart}
        weightDelta={weightDelta}
        last7DaysCalories={last7DaysCalories}
        calorieTarget={2200}
      />
    </div>
  );
}
