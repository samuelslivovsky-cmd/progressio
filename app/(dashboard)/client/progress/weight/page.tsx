"use client";

import { useState, useMemo } from "react";
import { format, addDays, differenceInDays } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scale, Plus, TrendingDown, TrendingUp, Target } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { toast } from "sonner";

const LBS_TO_KG = 0.45359237;

/** Jednoduchá lineárna regresia: vráti slope (kg/deň) a intercept */
function linearRegression(
  points: { x: number; y: number }[]
): { slope: number; intercept: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

export default function ClientWeightPage() {
  const [range, setRange] = useState<"30" | "90">("30");
  const [addOpen, setAddOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [logDate, setLogDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [unit, setUnit] = useState<"KG" | "LBS">("KG");

  const utils = trpc.useUtils();
  const { data: profile } = trpc.profile.me.useQuery();
  const { data: weightLogs = [], isLoading } = trpc.weight.list.useQuery({
    limit: range === "30" ? 30 : 90,
  });
  const addWeight = trpc.weight.add.useMutation({
    onSuccess: () => {
      toast.success("Váha pridaná");
      setAddOpen(false);
      setWeight("");
      setLogDate(format(new Date(), "yyyy-MM-dd"));
      utils.weight.list.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const chartData = useMemo(() => {
    const sorted = [...weightLogs].sort(
      (a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
    );
    return sorted.map((log: { loggedAt: Date | string; weight: number; unit: string }) => {
      const weightKg = log.unit === "LBS" ? log.weight * LBS_TO_KG : log.weight;
      return {
        date: format(new Date(log.loggedAt), "d.M."),
        fullDate: log.loggedAt,
        weight: weightKg,
        raw: weightKg,
        unit: log.unit,
      };
    });
  }, [weightLogs]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return { slope: 0, intercept: chartData[0]?.raw ?? 0 };
    const firstDate = new Date(chartData[0]!.fullDate);
    const points = chartData.map((d: { fullDate: Date | string; raw: number }) => ({
      x: differenceInDays(new Date(d.fullDate), firstDate),
      y: d.raw,
    }));
    return linearRegression(points);
  }, [chartData]);

  const goalWeight = profile?.goalWeight ?? null;
  const currentWeight = chartData.length > 0 ? chartData[chartData.length - 1]!.raw : null;
  const startWeight = chartData.length > 0 ? chartData[0]!.raw : null;
  const trendKgPerWeek = trend.slope * 7;
  const weeksToGoal = (() => {
    if (goalWeight == null || currentWeight == null || trendKgPerWeek === 0) return null;
    if (goalWeight < currentWeight && trendKgPerWeek < 0)
      return (currentWeight - goalWeight) / -trendKgPerWeek;
    if (goalWeight > currentWeight && trendKgPerWeek > 0)
      return (goalWeight - currentWeight) / trendKgPerWeek;
    return null;
  })();
  const goalDate =
    weeksToGoal != null && weeksToGoal > 0
      ? format(addDays(new Date(), Math.round(weeksToGoal * 7)), "d. M. yyyy")
      : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const w = parseFloat(weight.replace(",", "."));
    if (Number.isNaN(w) || w <= 0) {
      toast.error("Zadaj platnú váhu");
      return;
    }
    addWeight.mutate({
      weight: w,
      unit,
      loggedAt: new Date(logDate + "T12:00:00"),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Váha" />
        <EmptyState title="Načítavam…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="Váha" />
        <div className="flex items-center gap-2">
          <Button
            variant={range === "30" ? "default" : "outline"}
            size="sm"
            onClick={() => setRange("30")}
          >
            30 dní
          </Button>
          <Button
            variant={range === "90" ? "default" : "outline"}
            size="sm"
            onClick={() => setRange("90")}
          >
            90 dní
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Pridať váhu
          </Button>
        </div>
      </div>

      {/* Mini štatistiky */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {startWeight != null && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Štart (obdobie)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {startWeight} <span className="text-sm font-normal text-muted-foreground">kg</span>
              </span>
            </CardContent>
          </Card>
        )}
        {currentWeight != null && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Aktuálna
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {currentWeight}{" "}
                <span className="text-sm font-normal text-muted-foreground">kg</span>
              </span>
            </CardContent>
          </Card>
        )}
        {goalWeight != null && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Target className="h-3.5 w-3.5" /> Cieľ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {goalWeight}{" "}
                <span className="text-sm font-normal text-muted-foreground">kg</span>
              </span>
              {currentWeight != null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Zostatok: {goalWeight > currentWeight ? "+" : ""}
                  {(goalWeight - currentWeight).toFixed(1)} kg
                </p>
              )}
            </CardContent>
          </Card>
        )}
        {trendKgPerWeek !== 0 && chartData.length >= 2 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                {trendKgPerWeek > 0 ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}{" "}
                Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-2xl font-bold">
                {trendKgPerWeek > 0 ? "+" : ""}
                {trendKgPerWeek.toFixed(2)}{" "}
                <span className="text-sm font-normal text-muted-foreground">kg/týždeň</span>
              </span>
              {goalDate != null && (
                <p className="text-xs text-muted-foreground mt-1">
                  Odhad cieľa: {goalDate}
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Graf */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Priebeh váhy</CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <EmptyState
              wrapInCard={false}
              icon={<Scale className="h-12 w-12" />}
              title="Žiadne záznamy váhy"
              description="Pridaj prvý záznam a uvidíš tu graf."
            >
              <Button onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Pridať váhu
              </Button>
            </EmptyState>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/50" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                  />
                  <YAxis
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    stroke="var(--border)"
                    tickFormatter={(v) => `${v} kg`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius)",
                      color: "var(--card-foreground)",
                    }}
                    formatter={(value: number | undefined) => [value != null ? `${value} kg` : "—", "Váha"]}
                    labelFormatter={(label) => label}
                  />
                  {goalWeight != null && (
                    <ReferenceLine
                      y={goalWeight}
                      stroke="var(--primary)"
                      strokeDasharray="4 4"
                      strokeOpacity={0.8}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="raw"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={{ fill: "var(--chart-1)", r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Váha"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog / form na pridanie váhy */}
      {addOpen && (
        <Card className="border-primary/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Pridať váhu</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight">Váha (kg)</Label>
                  <Input
                    id="weight"
                    type="text"
                    inputMode="decimal"
                    placeholder="72.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logDate">Dátum</Label>
                  <Input
                    id="logDate"
                    type="date"
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={addWeight.isPending}>
                  {addWeight.isPending ? "Ukladám…" : "Uložiť"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setAddOpen(false);
                    setWeight("");
                  }}
                >
                  Zrušiť
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
