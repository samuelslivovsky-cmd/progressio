"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Utensils, Dumbbell, ChevronRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";

type WeightLogForChart = { weight: number; unit: string; loggedAt: string };
type DayCalories = { date: string; label: string; calories: number };
type TodayWorkoutItem = { exerciseName: string; doneSets: number; totalSets: number };

interface ClientDashboardChartsProps {
  lastWeight: { weight: number; unit: string; loggedAt: string } | null;
  lastMeasurement: { waist: number | null; loggedAt: string } | null;
  todayCalories: number;
  todayFoodCount: number;
  todayWorkout: {
    name: string | null;
    itemsCount: number;
    items?: TodayWorkoutItem[];
  } | null;
  weightLogs: WeightLogForChart[];
  weightLogs30?: WeightLogForChart[];
  weightDelta?: number | null;
  last7DaysCalories: DayCalories[];
  streakDays?: number;
  calorieTarget?: number | null;
}

export function ClientDashboardCharts({
  lastWeight,
  lastMeasurement,
  todayCalories,
  todayFoodCount,
  todayWorkout,
  weightLogs,
  weightLogs30,
  weightDelta,
  last7DaysCalories,
  streakDays = 0,
  calorieTarget,
}: ClientDashboardChartsProps) {
  const chartData = (weightLogs30 ?? weightLogs)
    .slice()
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .map((log) => ({
      date: format(new Date(log.loggedAt), "d.M."),
      weight: log.weight,
    }));

  const caloriePct =
    calorieTarget && calorieTarget > 0
      ? Math.min(100, Math.round((todayCalories / calorieTarget) * 100))
      : null;
  const workoutDone = todayWorkout && todayWorkout.itemsCount > 0;

  const statCards = [
    {
      label: "Váha",
      value: lastWeight ? `${lastWeight.weight} ${lastWeight.unit.toLowerCase()}` : "—",
      accent: false,
      href: "/client/progress/weight",
    },
    {
      label: "Kalórie",
      value: todayCalories > 0 ? `${Math.round(todayCalories)} kcal` : "—",
      accent: false,
      href: "/client/food",
    },
    {
      label: "Séria",
      value: streakDays > 0 ? `${streakDays} dní` : "—",
      accent: streakDays > 0,
      href: undefined,
    },
    {
      label: "Tréning",
      value: workoutDone ? "Hotový ✓" : (todayWorkout?.name ? "Prebieha" : "—"),
      accent: workoutDone,
      href: "/client/workout",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Stats — mockup: 4 na PC, 2x2 na mobile */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {statCards.map(({ label, value, accent, href }) => {
          const Wrapper = href ? Link : "div";
          const wrapperProps = href ? { href, className: "block" } : {};
          return (
            <Wrapper key={label} {...wrapperProps}>
              <Card className={cn("h-full transition-colors", href && "hover:bg-muted/50")}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 md:pt-4 px-3 md:px-6">
                  <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3 md:px-6 md:pb-4">
                  <div
                    className={cn(
                      "text-lg font-bold md:text-2xl",
                      accent && "text-primary"
                    )}
                  >
                    {value}
                  </div>
                </CardContent>
              </Card>
            </Wrapper>
          );
        })}
      </div>

      {/* Váha — 30 dní (alebo 14) + delta badge */}
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
          <CardTitle className="text-sm font-medium">Váha — {weightLogs30?.length ? "30" : "14"} dní</CardTitle>
          <div className="flex items-center gap-2">
            {weightDelta != null && (
              <span
                className={cn(
                  "text-xs font-semibold rounded-full px-2 py-0.5 border",
                  weightDelta <= 0
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "bg-muted text-muted-foreground border-border"
                )}
              >
                {weightDelta <= 0 ? "↓" : "↑"} {weightDelta > 0 ? "+" : ""}
                {weightDelta} kg
              </span>
            )}
            <Link
              href="/client/progress/weight"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}
            >
              Detail <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="h-[140px] md:h-[180px] flex items-center justify-center text-muted-foreground text-sm">
              Žiadne záznamy váhy
            </div>
          ) : (
            <div className="h-[140px] md:h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    width={36}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: "12px",
                      color: "var(--card-foreground)",
                    }}
                    formatter={(value: number | undefined) =>
                      [value != null ? `${value} kg` : "—", "Váha"]
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ fill: "var(--chart-1)", r: 2.5 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dve sekcie vedľa seba na PC, pod sebou na mobile: Kalórie (kruh + cieľ) | Dnešný tréning */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Kalórie
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-start gap-4">
            {caloriePct != null && (
              <div className="relative shrink-0">
                <svg className="h-12 w-12 md:h-14 md:w-14" viewBox="0 0 52 52">
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    fill="none"
                    stroke="var(--muted)"
                    strokeWidth="5"
                  />
                  <circle
                    cx="26"
                    cy="26"
                    r="22"
                    fill="none"
                    stroke="var(--chart-1)"
                    strokeWidth="5"
                    strokeDasharray={`${(caloriePct / 100) * 2 * Math.PI * 22} ${2 * Math.PI * 22}`}
                    strokeLinecap="round"
                    transform="rotate(-90 26 26)"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                  {caloriePct}%
                </span>
              </div>
            )}
            <div>
              <div className="text-xl md:text-2xl font-bold">
                {todayCalories > 0 ? Math.round(todayCalories) : "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                {calorieTarget ? `/ ${calorieTarget} kcal` : `${todayFoodCount} jedál`}
              </div>
              <Link
                href="/client/food"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-2 inline-flex")}
              >
                Strava <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              Dnešný tréning
            </CardTitle>
          </CardHeader>
          <CardContent>
            {todayWorkout?.items && todayWorkout.items.length > 0 ? (
              <div className="space-y-3">
                {todayWorkout.items.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground truncate mr-2">
                        {item.exerciseName}
                      </span>
                      <span className="text-muted-foreground shrink-0">
                        {item.doneSets}/{item.totalSets}
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (item.doneSets / item.totalSets) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {todayWorkout?.name ? todayWorkout.name : "Žiadny tréning na dnes."}
              </p>
            )}
            <Link
              href="/client/workout"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "mt-3 inline-flex")}
            >
              Tréning <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Kalórie 7 dní — bar chart (doplňok pod mockup) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Kalórie — posledných 7 dní</CardTitle>
          <Link
            href="/client/food"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}
          >
            Detail <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </CardHeader>
        <CardContent>
          {last7DaysCalories.every((d) => d.calories === 0) ? (
            <div className="h-[140px] md:h-[180px] flex items-center justify-center text-muted-foreground text-sm">
              Žiadne záznamy stravy
            </div>
          ) : (
            <div className="h-[140px] md:h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={last7DaysCalories}
                  margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border/50"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    width={40}
                    tickFormatter={(v) => `${v}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      fontSize: "12px",
                      color: "var(--card-foreground)",
                    }}
                    formatter={(value: number | undefined) =>
                      [value != null ? `${value} kcal` : "—", "Kalórie"]
                    }
                    labelFormatter={(label) => label}
                  />
                  <Bar
                    dataKey="calories"
                    fill="var(--chart-2)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
