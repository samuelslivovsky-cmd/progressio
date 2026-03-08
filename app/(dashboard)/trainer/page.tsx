import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format, startOfDay, subDays } from "date-fns";
import { sk } from "date-fns/locale";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, ClipboardList, Dumbbell, TrendingUp, ChevronRight } from "lucide-react";
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
  const clientIds = clientLinks.map((c: { clientId: string }) => c.clientId);

  const threeDaysAgo = startOfDay(subDays(new Date(), 3));
  const twoDaysAgo = startOfDay(subDays(new Date(), 2));

  const [
    clientCount,
    mealPlanCount,
    trainingPlanCount,
    foodLogsRecent,
    workoutLogsRecent,
    activeFromFood,
    activeFromWorkout,
    lastFoodByClient,
    lastWorkoutByClient,
    allClientProfiles,
    featuredPlan,
  ] = await Promise.all([
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
    clientIds.length > 0
      ? prisma.foodLog.groupBy({
          by: ["profileId"],
          _max: { date: true },
          where: { profileId: { in: clientIds } },
        })
      : [],
    clientIds.length > 0
      ? prisma.workoutLog.groupBy({
          by: ["profileId"],
          _max: { date: true },
          where: { profileId: { in: clientIds } },
        })
      : [],
    clientIds.length > 0
      ? prisma.profile.findMany({
          where: { id: { in: clientIds } },
          select: { id: true, name: true },
        })
      : [],
    prisma.trainingPlan.findFirst({
      where: { trainerId },
      include: {
        _count: { select: { assignments: true } },
        days: true,
        assignments: { take: 1, orderBy: { startDate: "desc" } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const activeClientIds = new Set([
    ...activeFromFood.map((x: { profileId: string }) => x.profileId),
    ...activeFromWorkout.map((x: { profileId: string }) => x.profileId),
  ]);
  const activeCount = activeClientIds.size;

  type ClientRow = { clientId: string; clientName: string; lastActivity: Date | null; active: boolean };
  const foodMaxById: Record<string, Date> = {};
  lastFoodByClient.forEach((r: { profileId: string; _max: { date: Date | null } }) => {
    if (r._max.date) foodMaxById[r.profileId] = r._max.date;
  });
  const workoutMaxById: Record<string, Date> = {};
  lastWorkoutByClient.forEach((r: { profileId: string; _max: { date: Date | null } }) => {
    if (r._max.date) workoutMaxById[r.profileId] = r._max.date;
  });
  const clientList: ClientRow[] = allClientProfiles.map((p: { id: string; name: string }) => {
    const lastFood = foodMaxById[p.id];
    const lastWorkout = workoutMaxById[p.id];
    const lastActivity =
      !lastFood && !lastWorkout
        ? null
        : !lastFood
          ? lastWorkout!
          : !lastWorkout
            ? lastFood!
            : lastFood > lastWorkout!
              ? lastFood
              : lastWorkout!;
    return {
      clientId: p.id,
      clientName: p.name,
      lastActivity: lastActivity ?? null,
      active: lastActivity ? activeClientIds.has(p.id) : false,
    };
  });
  clientList.sort((a, b) => (b.lastActivity?.getTime() ?? 0) - (a.lastActivity?.getTime() ?? 0));

  type ActivityRow = { clientId: string; clientName: string; date: Date; type: "food" | "workout" };
  const merged = [
    ...foodLogsRecent.map((f: { profileId: string; date: Date }) => ({ profileId: f.profileId, date: f.date, type: "food" as const })),
    ...workoutLogsRecent.map((w: { profileId: string; date: Date }) => ({ profileId: w.profileId, date: w.date, type: "workout" as const })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());
  const seen = new Set<string>();
  const uniqueByClient: { profileId: string; date: Date; type: "food" | "workout" }[] = [];
  for (const row of merged) {
    if (seen.has(row.profileId)) continue;
    seen.add(row.profileId);
    uniqueByClient.push(row);
  }
  const nameById: Record<string, string> = Object.fromEntries(allClientProfiles.map((p: { id: string; name: string }) => [p.id, p.name]));
  const lastActivityList: ActivityRow[] = uniqueByClient.slice(0, 10).map((r: { profileId: string; date: Date; type: "food" | "workout" }) => ({
    clientId: r.profileId,
    clientName: nameById[r.profileId] ?? "—",
    date: r.date,
    type: r.type,
  }));

  const today = new Date();
  const featuredPlanWeeks = 4;
  const planStart = featuredPlan?.assignments?.[0]?.startDate;
  const currentWeekNum = planStart
    ? Math.min(
        featuredPlanWeeks,
        Math.max(
          1,
          Math.floor(
            (today.getTime() - new Date(planStart).getTime()) / (7 * 24 * 60 * 60 * 1000)
          ) + 1
        )
      )
    : 1;

  function agoLabel(last: Date | null): string {
    if (!last) return "—";
    const start = startOfDay(today);
    const logStart = startOfDay(last);
    const diffDays = Math.floor((start.getTime() - logStart.getTime()) / (24 * 60 * 60 * 1000));
    if (diffDays === 0) return "dnes";
    if (diffDays === 1) return "včera";
    if (diffDays < 7) return `${diffDays} dni`;
    return format(last, "d.M.");
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <RefreshAlertsOnMount />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dobrý deň, {profile.name}</h1>
        <p className="text-muted-foreground">Prehľad tvojich klientov a plánov</p>
      </div>

      {/* Stats — mockup: Klienti, Plány, Jedálničky, Aktívni (4 na PC, 2x2 na mobile) */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 md:pt-4 px-3 md:px-6">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Klienti</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-4">
            <div className="text-lg font-bold md:text-2xl">{clientCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 md:pt-4 px-3 md:px-6">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Plány</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-4">
            <div className="text-lg font-bold md:text-2xl">{trainingPlanCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 md:pt-4 px-3 md:px-6">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Jedálničky</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-4">
            <div className="text-lg font-bold md:text-2xl">{mealPlanCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 md:pt-4 px-3 md:px-6">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aktívni</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-3 pb-3 md:px-6 md:pb-4">
            <div className="text-lg font-bold md:text-2xl text-primary">{activeCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">3 dni</p>
          </CardContent>
        </Card>
      </div>

      <IntelligenceSection />

      {/* Dve stĺpce na PC: Klienti (zoznam so stavom) | Priradený plán + Živá aktivita */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Klienti</CardTitle>
            <p className="text-xs text-primary font-semibold">{clientCount} aktívnych</p>
          </CardHeader>
          <CardContent>
            {clientList.length === 0 ? (
              <p className="text-sm text-muted-foreground">Žiadni klienti.</p>
            ) : (
              <div className="space-y-2">
                {clientList.slice(0, 8).map((c) => (
                  <Link
                    key={c.clientId}
                    href={`/trainer/clients/${c.clientId}`}
                    className="flex items-center gap-2 py-1.5 rounded-md hover:bg-muted/50 -mx-1 px-1 transition-colors"
                  >
                    <div
                      className={cn(
                        "h-1.5 w-1.5 rounded-full shrink-0",
                        c.active ? "bg-primary" : "bg-muted-foreground/40"
                      )}
                    />
                    <span className="text-sm truncate flex-1">{c.clientName}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{agoLabel(c.lastActivity)}</span>
                  </Link>
                ))}
                {clientList.length > 8 && (
                  <div className="pt-2 border-t text-xs text-muted-foreground">
                    + {clientList.length - 8} ďalších
                  </div>
                )}
              </div>
            )}
            {clientCount > 0 && (
              <Link
                href="/trainer/clients"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-3 inline-flex")}
              >
                Všetci klienti <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Priradený plán</CardTitle>
            </CardHeader>
            <CardContent>
              {featuredPlan ? (
                <>
                  <div className="text-base font-bold">{featuredPlan.name}</div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {featuredPlan._count.assignments} klientov · {featuredPlanWeeks} týždne
                  </p>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4].slice(0, featuredPlanWeeks).map((w) => (
                      <div key={w} className="flex-1">
                        <div
                          className={cn(
                            "h-5 rounded-md mb-1",
                            w <= currentWeekNum ? "bg-primary" : "bg-muted"
                          )}
                        />
                        <div className="text-center text-[10px] font-medium text-muted-foreground">T{w}</div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Týždeň <span className="text-primary font-semibold">{Math.min(currentWeekNum, featuredPlanWeeks)}</span> / {featuredPlanWeeks}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Žiadny tréningový plán.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Živá aktivita</CardTitle>
            </CardHeader>
            <CardContent>
              {lastActivityList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Žiadna aktivita v posledných 2 dňoch.</p>
              ) : (
                <div className="space-y-2">
                  {lastActivityList.slice(0, 5).map((row: ActivityRow) => (
                    <Link
                      key={`${row.clientId}-${row.date.getTime()}`}
                      href={`/trainer/clients/${row.clientId}`}
                      className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div className="h-1 w-1 rounded-full bg-primary shrink-0" />
                      {row.type === "workout" ? "Tréning" : "Strava"} — {row.clientName} ({format(row.date, "d.M.")})
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
