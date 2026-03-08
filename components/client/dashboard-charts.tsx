"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Scale, Ruler, Utensils, Dumbbell, ChevronRight } from "lucide-react";
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

interface ClientDashboardChartsProps {
  lastWeight: { weight: number; unit: string; loggedAt: string } | null;
  lastMeasurement: { waist: number | null; loggedAt: string } | null;
  todayCalories: number;
  todayFoodCount: number;
  todayWorkout: { name: string | null; itemsCount: number } | null;
  weightLogs: WeightLogForChart[];
  last7DaysCalories: DayCalories[];
}

export function ClientDashboardCharts({
  lastWeight,
  lastMeasurement,
  todayCalories,
  todayFoodCount,
  todayWorkout,
  weightLogs,
  last7DaysCalories,
}: ClientDashboardChartsProps) {
  const weightChartData = weightLogs
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .map((log) => ({
      date: format(new Date(log.loggedAt), "d.M."),
      weight: log.weight,
    }));

  return (
    <div className="space-y-6">
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
              {lastWeight ? format(new Date(lastWeight.loggedAt), "d. M. yyyy") : "Žiadny záznam"}
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
              {lastMeasurement ? format(new Date(lastMeasurement.loggedAt), "d. M. yyyy") : "Žiadny záznam"}
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
              {todayCalories > 0 ? `${Math.round(todayCalories)} kcal` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayFoodCount} jedál zaznamenaných
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
              {todayWorkout ? `${todayWorkout.itemsCount} cv.` : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              {todayWorkout?.name ?? "Žiadny tréning"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grafy */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Váha — posledných 14 dní</CardTitle>
            <Link
              href="/client/progress/weight"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}
            >
              Detail <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {weightChartData.length === 0 ? (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                Žiadne záznamy váhy
              </div>
            ) : (
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightChartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <YAxis domain={["auto", "auto"]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={36} tickFormatter={(v) => `${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        fontSize: "12px",
                        color: "var(--card-foreground)",
                      }}
                      formatter={(value: number | undefined) => [value != null ? `${value} kg` : "—", "Váha"]}
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Kalórie — posledných 7 dní</CardTitle>
            <Link
              href="/client/food"
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}
            >
              Strava <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {last7DaysCalories.every((d) => d.calories === 0) ? (
              <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">
                Žiadne záznamy stravy
              </div>
            ) : (
              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={last7DaysCalories} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={40} tickFormatter={(v) => `${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        fontSize: "12px",
                        color: "var(--card-foreground)",
                      }}
                      formatter={(value: number | undefined) => [value != null ? `${value} kcal` : "—", "Kalórie"]}
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="calories" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
