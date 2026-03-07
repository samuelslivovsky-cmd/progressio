"use client";

import { useState } from "react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Utensils, Plus, Trash2 } from "lucide-react";
import { AddFoodLogItemDialog } from "./add-food-log-item-dialog";

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Raňajky",
  lunch: "Obed",
  dinner: "Večera",
  snack: "Presnívka",
};

const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack"] as const;

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

function itemCalories(item: FoodLogItem): number {
  const mult = item.amount / (item.food.servingSize || 100);
  return item.food.calories * mult;
}

export function FoodLogView() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [addOpen, setAddOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: log, isLoading } = trpc.foodLog.byDate.useQuery({ date });
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
      <div className="flex flex-wrap items-center gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-muted-foreground">Dátum</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="flex h-9 w-[180px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Pridať jedlo
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Záznam stravy — {format(new Date(date), "d. M. yyyy")}</CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            Spolu: {Math.round(totalCal)} kcal
          </span>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Žiadne jedlá v tento deň</p>
              <p className="text-sm mt-1">Klikni na „Pridať jedlo“ a zaznamenaj stravu.</p>
              <Button className="mt-4" variant="outline" onClick={() => setAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Pridať jedlo
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {byMeal.map(({ mealType, label, items: mealItems }) => {
                if (mealItems.length === 0) return null;
                const mealCal = mealItems.reduce((s, i) => s + itemCalories(i), 0);
                return (
                  <div key={mealType}>
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                      {label} — {Math.round(mealCal)} kcal
                    </h3>
                    <ul className="space-y-2">
                      {mealItems.map((item) => {
                        const cal = Math.round(itemCalories(item));
                        return (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-4 py-2 border-b border-border/50 last:border-0"
                          >
                            <div>
                              <span className="font-medium">{item.food.name}</span>
                              <span className="text-muted-foreground text-sm ml-2">
                                {item.amount} {item.food.unit} · {cal} kcal
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => removeItem.mutate({ itemId: item.id })}
                              disabled={removeItem.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddFoodLogItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        date={date}
        onSuccess={handleAddSuccess}
      />
    </div>
  );
}
