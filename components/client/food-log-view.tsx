"use client";

import { useState } from "react";
import { format, addDays, subDays } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Utensils, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { AddFoodLogItemDialog } from "./add-food-log-item-dialog";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Raňajky",
  desiata: "Desiata",
  lunch: "Obed",
  olovrant: "Olovrant",
  dinner: "Večera",
};

const MEAL_ORDER = ["breakfast", "desiata", "lunch", "olovrant", "dinner"] as const;

type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingSize: number;
  unit: string;
};

type FoodLogItem = {
  id: string;
  amount: number;
  mealType: string;
  food: Food;
};

type FoodLogWithItems = {
  id: string;
  date: Date;
  items: FoodLogItem[];
} | null;

function itemMultiplier(item: FoodLogItem): number {
  return item.amount / (item.food.servingSize || 100);
}

function itemCalories(item: FoodLogItem): number {
  return item.food.calories * itemMultiplier(item);
}

function itemProtein(item: FoodLogItem): number {
  return item.food.protein * itemMultiplier(item);
}

function itemCarbs(item: FoodLogItem): number {
  return item.food.carbs * itemMultiplier(item);
}

function itemFat(item: FoodLogItem): number {
  return item.food.fat * itemMultiplier(item);
}

function itemFiber(item: FoodLogItem): number {
  return (item.food.fiber ?? 0) * itemMultiplier(item);
}

export function FoodLogView() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [addOpen, setAddOpen] = useState(false);
  const [addDefaultMealType, setAddDefaultMealType] = useState<
    "breakfast" | "desiata" | "lunch" | "olovrant" | "dinner" | undefined
  >(undefined);

  const utils = trpc.useUtils();
  const { data: log, isLoading } = trpc.foodLog.byDate.useQuery({ date });
  const { data: assignments = [] } = trpc.mealPlan.myAssigned.useQuery();
  const removeItem = trpc.foodLog.removeItem.useMutation({
    onSuccess: () => {
      utils.foodLog.byDate.invalidate({ date });
    },
    onError: (e) => toast.error(e.message),
  });

  const items = (log as FoodLogWithItems)?.items ?? [];
  const byMeal = MEAL_ORDER.map((mealType) => ({
    mealType,
    label: MEAL_LABELS[mealType] ?? mealType,
    items: items.filter((i) => i.mealType === mealType),
  }));
  const totalCal = items.reduce((sum, i) => sum + itemCalories(i), 0);
  const totalProtein = items.reduce((sum, i) => sum + itemProtein(i), 0);
  const totalCarbs = items.reduce((sum, i) => sum + itemCarbs(i), 0);
  const totalFat = items.reduce((sum, i) => sum + itemFat(i), 0);
  const totalFiber = items.reduce((sum, i) => sum + itemFiber(i), 0);

  // Kalórie z makier (P/C 4 kcal/g, vláknina ~2 kcal/g, T 9 kcal/g) pre koláčový graf
  const proteinCal = totalProtein * 4;
  const carbsCal = totalCarbs * 4;
  const fiberCal = totalFiber * 2;
  const fatCal = totalFat * 9;
  const MACRO_COLORS = {
    Bielkoviny: "var(--chart-1)",
    Sacharidy: "var(--chart-2)",
    Vláknina: "var(--chart-3)",
    Tuky: "var(--chart-4)",
  } as const;
  const macroChartData = [
    { name: "Bielkoviny", value: Math.round(proteinCal), grams: totalProtein, fill: MACRO_COLORS.Bielkoviny },
    { name: "Sacharidy", value: Math.round(carbsCal), grams: totalCarbs, fill: MACRO_COLORS.Sacharidy },
    { name: "Vláknina", value: Math.round(fiberCal), grams: totalFiber, fill: MACRO_COLORS.Vláknina },
    { name: "Tuky", value: Math.round(fatCal), grams: totalFat, fill: MACRO_COLORS.Tuky },
  ].filter((d) => d.value > 0);

  const currentAssignment = assignments[0];
  const calorieTarget = currentAssignment?.mealPlan?.calorieTargetPerDay ?? null;
  const dateObj = new Date(date + "T12:00:00");

  function goPrevDay() {
    setDate(format(subDays(dateObj, 1), "yyyy-MM-dd"));
  }
  function goNextDay() {
    setDate(format(addDays(dateObj, 1), "yyyy-MM-dd"));
  }

  function handleAddSuccess() {
    utils.foodLog.byDate.invalidate({ date });
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Načítavam…
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Dátum</label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={goPrevDay}
              aria-label="Predchádzajúci deň"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            />
            <Button
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={goNextDay}
              aria-label="Nasledujúci deň"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button
            className="h-9 shrink-0"
            onClick={() => {
              setAddDefaultMealType(undefined);
              setAddOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Pridať jedlo
          </Button>
        </div>
      </div>

      {/* Súhrn dňa + progress */}
      <Card>
        <CardHeader className="space-y-3 pb-2">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">
              Záznam stravy — {format(dateObj, "d. M. yyyy")}
            </CardTitle>
            <span className="text-sm font-medium text-muted-foreground">
              Spolu: {Math.round(totalCal)} kcal
              {totalProtein > 0 || totalCarbs > 0 || totalFat > 0
                ? ` · P ${Math.round(totalProtein)} · C ${Math.round(totalCarbs)} · T ${Math.round(totalFat)}`
                : ""}
            </span>
          </div>
          {calorieTarget != null && calorieTarget > 0 && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Kalórie</span>
                <span>
                  {Math.round(totalCal)} / {calorieTarget} kcal
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${Math.min(100, (totalCal / calorieTarget) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {macroChartData.length > 0 && (
            <div className="relative rounded-xl bg-card border border-border/40 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none rounded-xl" />
              <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider pt-3 pb-1 text-center">
                Podiel kalórií z makier
              </p>
              <div className="w-full px-2" style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
                    <Pie
                      data={macroChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="55%"
                      outerRadius="78%"
                      paddingAngle={3}
                      cornerRadius={6}
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth={1}
                      labelLine={false}
                      label={false}
                    >
                      {macroChartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius)",
                        fontSize: "12px",
                        color: "var(--card-foreground)",
                      }}
                      itemStyle={{ color: "var(--card-foreground)" }}
                      labelStyle={{ color: "var(--card-foreground)" }}
                      formatter={(value: number | undefined, _name, props) => [
                        `${value != null ? value : "—"} kcal · ${(props.payload as { grams?: number }).grams?.toFixed(0) ?? "—"} g`,
                        props.payload?.name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 px-2 pb-3 pt-0 text-[11px] text-muted-foreground">
                {macroChartData.map((entry) => (
                  <span key={entry.name} className="flex items-center gap-1.5">
                    <span
                      className="size-2 rounded-sm shrink-0"
                      style={{ backgroundColor: entry.fill }}
                    />
                    {entry.name} {entry.grams.toFixed(0)} g
                  </span>
                ))}
              </div>
            </div>
          )}
          <Button
            className="w-full sm:w-auto"
            onClick={() => {
              setAddDefaultMealType(undefined);
              setAddOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Pridať jedlo
          </Button>
        </CardContent>
      </Card>

      {/* Samostatné karty pre každú časť dňa */}
      <div className="grid gap-4 sm:grid-cols-2">
        {byMeal.map(({ mealType, label, items: mealItems }) => {
          const mealCal = mealItems.reduce((s, i) => s + itemCalories(i), 0);
          const mealP = mealItems.reduce((s, i) => s + itemProtein(i), 0);
          const mealC = mealItems.reduce((s, i) => s + itemCarbs(i), 0);
          const mealF = mealItems.reduce((s, i) => s + itemFat(i), 0);
          return (
            <Card key={mealType}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span>{label}</span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {mealCal > 0 ? (
                      <>
                        {Math.round(mealCal)} kcal
                        {(mealP > 0 || mealC > 0 || mealF > 0) && (
                          <> · P {Math.round(mealP)} · C {Math.round(mealC)} · T {Math.round(mealF)}</>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {mealItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2">Žiadne jedlá</p>
                ) : (
                  <ul className="space-y-2">
                    {mealItems.map((item) => {
                      const cal = Math.round(itemCalories(item));
                      return (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0"
                        >
                          <div className="min-w-0">
                            <span className="font-medium">{item.food.name}</span>
                            <span className="text-muted-foreground text-sm ml-2">
                              {item.amount} {item.food.unit} · {cal} kcal
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem.mutate({ itemId: item.id })}
                            disabled={removeItem.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      );
                    })}
                  </ul>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => {
                    setAddDefaultMealType(mealType);
                    setAddOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Pridať do {label.toLowerCase()}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AddFoodLogItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        date={date}
        onSuccess={handleAddSuccess}
        defaultMealType={addDefaultMealType}
      />
    </div>
  );
}
