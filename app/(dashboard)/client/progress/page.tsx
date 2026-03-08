"use client";

import Link from "next/link";
import { format, subDays } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Scale, Ruler, ChevronRight, Flame, UtensilsCrossed, Dumbbell } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ClientProgressOverviewPage() {
  const { data: profile, isLoading: profileLoading } = trpc.profile.me.useQuery();
  const { data: weightLogs = [], isLoading: weightLoading } = trpc.weight.list.useQuery({ limit: 30 });
  const { data: measurements = [], isLoading: measurementsLoading } = trpc.measurement.list.useQuery({ limit: 14 });
  const { data: progressOverview, isLoading: overviewLoading } = trpc.analytics.getMyProgressOverview.useQuery();
  const isLoading = profileLoading || weightLoading || measurementsLoading || overviewLoading;

  const weightChartData = weightLogs
    .slice()
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .slice(-14)
    .map((log) => ({
      date: format(new Date(log.loggedAt), "d.M."),
      weight: log.weight,
    }));

  const lastWeight = weightLogs[0];
  const lastMeasurement = measurements[0];
  const goalWeight = profile?.goalWeight;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Pokrok</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Načítavam…
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Pokrok</h1>
      <p className="text-muted-foreground">
        Prehľad váhy, meraní a adherence. Pre detaily použij odkazy nižšie.
      </p>

      {/* Streak + adherence 7 days */}
      {(progressOverview?.streak !== undefined || progressOverview?.foodDays) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Streak a adherencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressOverview && progressOverview.streak >= 0 && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Streak</p>
                <p className="text-lg font-semibold">
                  {progressOverview.streak === 0
                    ? "Dnes ešte žiadny log"
                    : `${progressOverview.streak} ${progressOverview.streak === 1 ? "deň" : progressOverview.streak < 5 ? "dni" : "dní"} v rade s logom`}
                </p>
              </div>
            )}
            {progressOverview?.foodDays && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <UtensilsCrossed className="h-3.5 w-3.5" />
                  Adherencia stravy (7 dní)
                </p>
                <div className="flex gap-1.5 items-center">
                  {[...progressOverview.foodDays].reverse().map((logged, i) => {
                    const dayIndex = 6 - i;
                    const date = subDays(new Date(), dayIndex);
                    return (
                      <div
                        key={i}
                        title={`${format(date, "d.M.")} ${logged ? "zalogované" : "bez záznamu"}`}
                        className={`h-8 w-8 rounded-full border-2 shrink-0 ${
                          logged
                            ? "bg-primary border-primary"
                            : "bg-muted/50 border-muted-foreground/30"
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Plný kruh = deň s logom stravy
                </p>
              </div>
            )}
            {progressOverview?.workoutDays && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Dumbbell className="h-3.5 w-3.5" />
                  Adherencia tréningu (7 dní)
                </p>
                <div className="flex gap-1.5 items-center">
                  {[...progressOverview.workoutDays].reverse().map((logged, i) => {
                    const dayIndex = 6 - i;
                    const date = subDays(new Date(), dayIndex);
                    return (
                      <div
                        key={i}
                        title={`${format(date, "d.M.")} ${logged ? "tréning" : "bez tréningu"}`}
                        className={`h-8 w-8 rounded-full border-2 shrink-0 ${
                          logged
                            ? "bg-primary border-primary"
                            : "bg-muted/50 border-muted-foreground/30"
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Plný kruh = deň s tréningom
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Mini weight chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Scale className="h-4 w-4" />
              Váha
            </CardTitle>
            <Link
              href="/client/progress/weight"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}
            >
              Detail <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {weightChartData.length === 0 ? (
              <div className="h-[140px] flex items-center justify-center text-muted-foreground text-sm">
                Žiadne záznamy. Pridaj váhu v detaile.
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold mb-2">
                  {lastWeight
                    ? `${lastWeight.weight} ${lastWeight.unit === "LBS" ? "lbs" : "kg"}`
                    : "—"}
                </div>
                <div className="h-[140px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} hide />
                      <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10 }} width={32} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          fontSize: "12px",
                          color: "var(--card-foreground)",
                        }}
                        formatter={(v: number | undefined) => [v != null ? `${v} kg` : "—", "Váha"]}
                      />
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Mini measurements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Merania
            </CardTitle>
            <Link
              href="/client/progress/measurements"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}
            >
              Detail <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {lastMeasurement ? (
              <div className="space-y-1 text-sm">
                {lastMeasurement.waist != null && (
                  <p>
                    Pás: <strong>{lastMeasurement.waist} cm</strong>
                  </p>
                )}
                {lastMeasurement.hips != null && (
                  <p>
                    Boky: <strong>{lastMeasurement.hips} cm</strong>
                  </p>
                )}
                {lastMeasurement.chest != null && (
                  <p>
                    Hrudník: <strong>{lastMeasurement.chest} cm</strong>
                  </p>
                )}
                <p className="text-xs text-muted-foreground pt-1">
                  {format(new Date(lastMeasurement.loggedAt), "d. M. yyyy")}
                </p>
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Žiadne merania. Pridaj v detaile.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CTA cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Váha a trend</h3>
                <p className="text-sm text-muted-foreground">
                  Graf, pridávanie váhy, predikcia cieľa
                </p>
                <Link
                  href="/client/progress/weight"
                  className={cn(buttonVariants({ size: "sm" }), "mt-2 inline-flex")}
                >
                  Otvoriť váhu
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <Ruler className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Merania</h3>
                <p className="text-sm text-muted-foreground">
                  Pás, boky, hrudník, história
                </p>
                <Link
                  href="/client/progress/measurements"
                  className={cn(buttonVariants({ size: "sm" }), "mt-2 inline-flex")}
                >
                  Otvoriť merania
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
