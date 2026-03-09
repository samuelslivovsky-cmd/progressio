"use client";

import { useState } from "react";
import { format } from "date-fns";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Scale, Ruler, Utensils, Dumbbell, TrendingDown, TrendingUp } from "lucide-react";
import { ClientPlanAssignCards } from "@/components/trainer/client-plan-assign-cards";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type TabId = "prehlad" | "vaha" | "strava" | "trening" | "plany";

type Assignment = {
  id: string;
  startDate: Date;
  endDate: Date | null;
  note: string | null;
  mealPlan?: { id: string; name: string };
  trainingPlan?: { id: string; name: string };
};

interface ClientDetailTabsProps {
  clientId: string;
  clientName: string;
  clientEmail: string;
  lastWeight: { weight: number; unit: string; loggedAt: Date } | null;
  prevWeight: { weight: number } | null;
  lastMeasurement: { waist: number | null; chest: number | null; hips: number | null; loggedAt: Date } | null;
  assignedMealPlan: Assignment | null;
  assignedTrainingPlan: Assignment | null;
}

export function ClientDetailTabs({
  clientId,
  clientName,
  lastWeight,
  prevWeight,
  lastMeasurement,
  assignedMealPlan,
  assignedTrainingPlan,
}: ClientDetailTabsProps) {
  const [tab, setTab] = useState<TabId>("prehlad");

  const { data: weightLogs = [] } = trpc.weight.listForClient.useQuery(
    { clientId, limit: 30 },
    { enabled: tab === "vaha" }
  );
  const { data: measurements = [] } = trpc.measurement.listForClient.useQuery(
    { clientId, limit: 20 },
    { enabled: tab === "vaha" }
  );
  const { data: foodLogs = [] } = trpc.foodLog.listForClient.useQuery(
    { clientId, limit: 30 },
    { enabled: tab === "strava" }
  );
  const { data: workoutLogs = [] } = trpc.workoutLog.listForClient.useQuery(
    { clientId, limit: 30 },
    { enabled: tab === "trening" }
  );

  const weightDiff = lastWeight && prevWeight ? lastWeight.weight - prevWeight.weight : null;
  const weightChartData = [...weightLogs]
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .map((log: { loggedAt: Date | string; weight: number }) => ({ date: format(new Date(log.loggedAt), "d.M."), weight: log.weight }));

  const measurementChartData = [...measurements]
    .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime())
    .map((m: { loggedAt: Date | string; waist?: number | null; hips?: number | null; chest?: number | null }) => ({
      date: format(new Date(m.loggedAt), "d.M."),
      waist: m.waist ?? undefined,
      hips: m.hips ?? undefined,
      chest: m.chest ?? undefined,
    }));

  const tabs: { id: TabId; label: string }[] = [
    { id: "prehlad", label: "Prehľad" },
    { id: "vaha", label: "Váha & merania" },
    { id: "strava", label: "Strava" },
    { id: "trening", label: "Tréning" },
    { id: "plany", label: "Plány" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1 border-b border-border pb-2">
        {tabs.map((t) => (
          <Button
            key={t.id}
            variant={tab === t.id ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </Button>
        ))}
      </div>

      {tab === "prehlad" && (
        <div className="space-y-4">
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
                {weightDiff !== null && (
                  <div className={`flex items-center gap-1 text-xs mt-1 ${weightDiff < 0 ? "text-green-600" : "text-red-500"}`}>
                    {weightDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} kg
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
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
                <p className="text-xs text-muted-foreground mt-1">
                  {lastMeasurement ? format(lastMeasurement.loggedAt, "d. M. yyyy") : "Žiadny záznam"}
                </p>
              </CardContent>
            </Card>
            <ClientPlanAssignCards
              clientId={clientId}
              assignedMealPlan={assignedMealPlan}
              assignedTrainingPlan={assignedTrainingPlan}
            />
          </div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Strava klienta</CardTitle>
              <Utensils className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Záznam jedál podľa dní.</p>
              <Link
                href={`/trainer/clients/${clientId}/food`}
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
              >
                Otvoriť záznam stravy
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "vaha" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Priebeh váhy</CardTitle>
            </CardHeader>
            <CardContent>
              {weightChartData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8">Žiadne záznamy váhy</p>
              ) : (
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weightChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `${v} kg`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          color: "var(--card-foreground)",
                        }}
                        formatter={(v: number | undefined) => [v != null ? `${v} kg` : "—", "Váha"]}
                      />
                      <Line type="monotone" dataKey="weight" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Merania (pás, boky, hrudník)</CardTitle>
            </CardHeader>
            <CardContent>
              {measurementChartData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8">Žiadne merania</p>
              ) : (
                <div className="h-[260px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={measurementChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius)",
                          color: "var(--card-foreground)",
                        }}
                      />
                      <Line type="monotone" dataKey="waist" name="Pás" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="hips" name="Boky" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="chest" name="Hrudník" stroke="var(--chart-3)" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {tab === "strava" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Posledné záznamy stravy (read-only)</p>
            <Link
              href={`/trainer/clients/${clientId}/food`}
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex")}
            >
              Kalendárový prehľad
            </Link>
          </div>
          {foodLogs.length === 0 ? (
            <EmptyState title="Žiadne záznamy stravy" />
          ) : (
            <div className="space-y-2">
              {foodLogs.map((log: { id: string; date: Date | string; items: { food: { calories: number; servingSize?: number } | null; amount: number }[] }) => {
                const totalCal = log.items.reduce(
                  (s: number, i: { food: { calories: number; servingSize?: number } | null; amount: number }) =>
                    s + (i.food ? (i.food.calories * i.amount) / Math.max(1, i.food.servingSize ?? 100) : 0),
                  0
                );
                return (
                  <Card key={log.id}>
                    <CardContent className="py-3 flex items-center justify-between">
                      <span className="font-medium">{format(new Date(log.date), "d. M. yyyy (EEEE)")}</span>
                      <span className="text-muted-foreground">{log.items.length} jedál · {Math.round(totalCal)} kcal</span>
                      <Link
                        href={`/trainer/clients/${clientId}/food?date=${format(new Date(log.date), "yyyy-MM-dd")}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}
                      >
                        Detail
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "trening" && (
        <div className="space-y-4">
          {workoutLogs.length === 0 ? (
            <EmptyState title="Žiadne záznamy tréningov" />
          ) : (
            <div className="space-y-2">
              {workoutLogs.map((log: { id: string; date: Date | string; name?: string | null; items: { id: string; exercise: { name: string } }[]; durationMin?: number | null }) => (
                <Card key={log.id}>
                  <CardContent className="py-3 flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="font-medium">{format(new Date(log.date), "d. M. yyyy (EEEE)")}</span>
                      {log.name && <span className="text-muted-foreground ml-2">— {log.name}</span>}
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {log.items.length} cv. {log.durationMin != null && `· ${log.durationMin} min`}
                    </span>
                    <ul className="w-full text-sm text-muted-foreground list-disc list-inside">
                      {log.items.slice(0, 5).map((item: { id: string; exercise: { name: string } }) => (
                        <li key={item.id}>{item.exercise.name}</li>
                      ))}
                      {log.items.length > 5 && <li>+{log.items.length - 5} ďalších</li>}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "plany" && (
        <div className="space-y-4">
          <ClientPlanAssignCards
            clientId={clientId}
            assignedMealPlan={assignedMealPlan}
            assignedTrainingPlan={assignedTrainingPlan}
          />
        </div>
      )}
    </div>
  );
}
