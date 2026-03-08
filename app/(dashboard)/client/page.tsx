import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format, startOfDay, subDays } from "date-fns";
import { ClientDashboardCharts } from "@/components/client/dashboard-charts";

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.role !== "CLIENT") redirect("/trainer");

  const today = new Date();
  const todayStart = startOfDay(today);
  const sevenDaysAgo = startOfDay(subDays(today, 6));

  const [
    lastWeight,
    lastMeasurement,
    todayFoodLog,
    todayWorkout,
    weightLogsLast14,
    foodLogsLast7Days,
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
      include: { items: true },
    }),
    prisma.weightLog.findMany({
      where: { profileId: profile.id },
      orderBy: { loggedAt: "desc" },
      take: 14,
    }),
    prisma.foodLog.findMany({
      where: {
        profileId: profile.id,
        date: { gte: sevenDaysAgo },
      },
      include: { items: { include: { food: true } } },
    }),
  ]);

  const todayFoodLogSingle = todayFoodLog?.[0];
  type FoodLogItemWithFood = { food: { calories: number; servingSize?: number }; amount: number };
  const totalCalories =
    todayFoodLogSingle?.items.reduce(
      (sum: number, item: FoodLogItemWithFood) => sum + (item.food.calories * item.amount) / (item.food.servingSize || 100),
      0
    ) ?? 0;

  const last7DaysCalories = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const log = foodLogsLast7Days.find(
      (f: { date: Date }) => format(f.date, "yyyy-MM-dd") === dateStr
    );
    const calories = log?.items.reduce(
      (s: number, item: FoodLogItemWithFood) => s + (item.food.calories * item.amount) / (item.food.servingSize || 100),
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
            ? { name: todayWorkout.name, itemsCount: todayWorkout.items.length }
            : null
        }
        weightLogs={weightLogsLast14.map((w: { weight: number; unit: string; loggedAt: Date }) => ({
          weight: w.weight,
          unit: w.unit,
          loggedAt: w.loggedAt.toISOString(),
        }))}
        last7DaysCalories={last7DaysCalories}
      />
    </div>
  );
}
