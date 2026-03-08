import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format, startOfDay, subDays } from "date-fns";
import { sk } from "date-fns/locale";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, ClipboardList, Dumbbell, TrendingUp, Utensils, Activity } from "lucide-react";
import { RefreshAlertsOnMount } from "@/components/trainer/refresh-alerts-on-mount";
import { IntelligenceSection } from "@/components/trainer/intelligence-section";

export default async function TrainerDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.role !== "TRAINER") redirect("/client");

  const trainerId = profile.id;
  const clientLinks = await prisma.clientTrainer.findMany({
    where: { trainerId },
    select: { clientId: true },
  });
  const clientIds = clientLinks.map((c) => c.clientId);

  const threeDaysAgo = startOfDay(subDays(new Date(), 3));
  const twoDaysAgo = startOfDay(subDays(new Date(), 2));

  const [clientCount, mealPlanCount, trainingPlanCount, foodLogsRecent, workoutLogsRecent, activeFromFood, activeFromWorkout] =
    await Promise.all([
      prisma.clientTrainer.count({ where: { trainerId } }),
      prisma.mealPlan.count({ where: { trainerId } }),
      prisma.trainingPlan.count({ where: { trainerId } }),
      clientIds.length > 0
        ? prisma.foodLog.findMany({
            where: { profileId: { in: clientIds }, date: { gte: twoDaysAgo } },
            select: { profileId: true, date: true },
            orderBy: { date: "desc" },
          })
        : [],
      clientIds.length > 0
        ? prisma.workoutLog.findMany({
            where: { profileId: { in: clientIds }, date: { gte: twoDaysAgo } },
            select: { profileId: true, date: true },
            orderBy: { date: "desc" },
          })
        : [],
      clientIds.length > 0
        ? prisma.foodLog.findMany({
            where: { profileId: { in: clientIds }, date: { gte: threeDaysAgo } },
            select: { profileId: true },
            distinct: ["profileId"],
          })
        : [],
      clientIds.length > 0
        ? prisma.workoutLog.findMany({
            where: { profileId: { in: clientIds }, date: { gte: threeDaysAgo } },
            select: { profileId: true },
            distinct: ["profileId"],
          })
        : [],
    ]);

  const activeClientIds = new Set([
    ...activeFromFood.map((x) => x.profileId),
    ...activeFromWorkout.map((x) => x.profileId),
  ]);
  const activeCount = activeClientIds.size;

  type ActivityRow = { clientId: string; clientName: string; date: Date; type: "food" | "workout" };
  const merged = [
    ...foodLogsRecent.map((f) => ({ profileId: f.profileId, date: f.date, type: "food" as const })),
    ...workoutLogsRecent.map((w) => ({ profileId: w.profileId, date: w.date, type: "workout" as const })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const seen = new Set<string>();
  const uniqueByClient: { profileId: string; date: Date; type: "food" | "workout" }[] = [];
  for (const row of merged) {
    if (seen.has(row.profileId)) continue;
    seen.add(row.profileId);
    uniqueByClient.push(row);
  }
  const idsForNames = uniqueByClient.slice(0, 10).map((r) => r.profileId);
  const profiles = await prisma.profile.findMany({
    where: { id: { in: idsForNames } },
    select: { id: true, name: true },
  });
  const nameById = Object.fromEntries(profiles.map((p) => [p.id, p.name]));
  const lastActivityList: ActivityRow[] = uniqueByClient
    .slice(0, 10)
    .map((r) => ({ clientId: r.profileId, clientName: nameById[r.profileId] ?? "—", date: r.date, type: r.type }));

  return (
    <div className="space-y-6">
      <RefreshAlertsOnMount />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dobrý deň, {profile.name}</h1>
        <p className="text-muted-foreground">Prehľad tvojich klientov a plánov</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Klienti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Jedálničky</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mealPlanCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tréningové plány</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{trainingPlanCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktívne (3 dni)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-1">strava alebo tréning</p>
          </CardContent>
        </Card>
      </div>

      <IntelligenceSection />

      <Card>
        <CardHeader>
          <CardTitle>Posledná aktivita</CardTitle>
          <p className="text-sm text-muted-foreground font-normal">Kto logoval dnes alebo včera</p>
        </CardHeader>
        <CardContent>
          {lastActivityList.length === 0 ? (
            <p className="text-muted-foreground text-sm">Žiadna aktivita v posledných 2 dňoch.</p>
          ) : (
            <div className="space-y-3">
              {lastActivityList.map((row) => (
                <div key={row.clientId} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium shrink-0">
                      {row.clientName[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{row.clientName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {row.type === "food" ? <Utensils className="h-3 w-3" /> : <Activity className="h-3 w-3" />}
                        {format(row.date, "d. M. yyyy (EEEE)", { locale: sk })} — {row.type === "food" ? "Strava" : "Tréning"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href={`/trainer/clients/${row.clientId}`}
                    className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "shrink-0 inline-flex")}
                  >
                    Detail
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {clientCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Všetci klienti</CardTitle>
          </CardHeader>
          <CardContent>
            <Link
              href="/trainer/clients"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
            >
              Prejsť na zoznam klientov
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
