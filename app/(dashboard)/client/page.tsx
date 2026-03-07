import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Ruler, Utensils, Dumbbell } from "lucide-react";
import { format } from "date-fns";

export default async function ClientDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.role !== "CLIENT") redirect("/trainer");

  const today = format(new Date(), "yyyy-MM-dd");

  const [lastWeight, lastMeasurement, todayFoodLog, todayWorkout] = await Promise.all([
    prisma.weightLog.findFirst({
      where: { profileId: profile.id },
      orderBy: { loggedAt: "desc" },
    }),
    prisma.measurement.findFirst({
      where: { profileId: profile.id },
      orderBy: { loggedAt: "desc" },
    }),
    prisma.foodLog.findFirst({
      where: { profileId: profile.id, date: new Date(today) },
      include: { items: { include: { food: true } } },
    }),
    prisma.workoutLog.findFirst({
      where: { profileId: profile.id, date: new Date(today) },
      include: { items: true },
    }),
  ]);

  const totalCalories = todayFoodLog?.items.reduce((sum, item) => {
    return sum + (item.food.calories * item.amount) / 100;
  }, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dobrý deň, {profile.name}</h1>
        <p className="text-muted-foreground">{format(new Date(), "EEEE, d. MMMM yyyy")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Posledná váha</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastWeight ? `${lastWeight.weight} ${lastWeight.unit.toLowerCase()}` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastWeight ? format(lastWeight.loggedAt, "d. M. yyyy") : "Žiadny záznam"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Obvod pásu</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastMeasurement?.waist ? `${lastMeasurement.waist} cm` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastMeasurement ? format(lastMeasurement.loggedAt, "d. M. yyyy") : "Žiadny záznam"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Kalórie dnes</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCalories > 0 ? `${Math.round(totalCalories)} kcal` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayFoodLog?.items.length ?? 0} jedál zaznamenanych
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tréning dnes</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {todayWorkout ? `${todayWorkout.items.length} cv.` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayWorkout?.name ?? "Žiadny tréning"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
