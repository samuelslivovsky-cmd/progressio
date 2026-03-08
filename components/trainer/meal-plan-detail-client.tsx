"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Utensils, Plus, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddMealItemDialog } from "./add-meal-item-dialog";

type DeleteConfirm = "day" | "meal" | "item" | null;

const MEAL_TYPES = [
  { value: "breakfast" as const, label: "Raňajky" },
  { value: "desiata" as const, label: "Desiata" },
  { value: "lunch" as const, label: "Obed" },
  { value: "olovrant" as const, label: "Olovrant" },
  { value: "dinner" as const, label: "Večera" },
];

const MEAL_LABELS: Record<string, string> = {
  breakfast: "Raňajky",
  desiata: "Desiata",
  lunch: "Obed",
  olovrant: "Olovrant",
  dinner: "Večera",
};

type Food = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: number;
  unit: string;
};
type MealItem = { id: string; amount: number; food: Food };
type Meal = { id: string; name: string; items: MealItem[] };
type MealPlanDay = { id: string; dayNumber: number; meals: Meal[] };
type MealPlanDetail = {
  id: string;
  name: string;
  description: string | null;
  days: MealPlanDay[];
};

interface MealPlanDetailClientProps {
  mealPlan: MealPlanDetail;
}

function formatMealName(name: string) {
  return MEAL_LABELS[name.toLowerCase()] ?? name;
}

type MacroTotals = { calories: number; protein: number; carbs: number; fat: number };

function mealTotals(items: MealItem[]) {
  return items.reduce(
    (acc: MacroTotals, it: MealItem) => {
      const mult = it.amount / (it.food.servingSize || 100);
      return {
        calories: acc.calories + it.food.calories * mult,
        protein: acc.protein + it.food.protein * mult,
        carbs: acc.carbs + it.food.carbs * mult,
        fat: acc.fat + it.food.fat * mult,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function MealPlanDetailClient({ mealPlan }: MealPlanDetailClientProps) {
  const router = useRouter();
  const [addItemMealId, setAddItemMealId] = useState<string | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ type: DeleteConfirm; dayId?: string; mealId?: string; itemId?: string } | null>(null);

  const addDay = trpc.mealPlan.addDay.useMutation({
    onSuccess: () => router.refresh(),
    onError: (err) => toast.error(err.message),
  });

  const addMeal = trpc.mealPlan.addMeal.useMutation({
    onSuccess: () => router.refresh(),
    onError: (err) => toast.error(err.message),
  });

  const deleteDay = trpc.mealPlan.deleteDay.useMutation({
    onSuccess: () => {
      router.refresh();
      setDeleteConfirm(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMeal = trpc.mealPlan.deleteMeal.useMutation({
    onSuccess: () => {
      router.refresh();
      setDeleteConfirm(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMealItem = trpc.mealPlan.deleteMealItem.useMutation({
    onSuccess: () => {
      router.refresh();
      setDeleteConfirm(null);
    },
    onError: (err) => toast.error(err.message),
  });

  const addMealItem = trpc.mealPlan.addMealItem.useMutation({
    onSuccess: () => router.refresh(),
    onError: (err) => toast.error(err.message),
  });

  function handleDeleteDay(dayId: string) {
    setDeleteConfirm({ type: "day", dayId });
  }

  function handleDeleteMeal(mealId: string) {
    setDeleteConfirm({ type: "meal", mealId });
  }

  function handleDeleteItem(itemId: string) {
    setDeleteConfirm({ type: "item", itemId });
  }

  function onConfirmDelete() {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "day" && deleteConfirm.dayId) deleteDay.mutate({ dayId: deleteConfirm.dayId });
    else if (deleteConfirm.type === "meal" && deleteConfirm.mealId) deleteMeal.mutate({ mealId: deleteConfirm.mealId });
    else if (deleteConfirm.type === "item" && deleteConfirm.itemId) deleteMealItem.mutate({ itemId: deleteConfirm.itemId });
  }

  const emptyState = (
    <Card>
      <CardContent className="py-12 text-center text-muted-foreground">
        <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="font-medium">Žiadne dni v pláne</p>
        <p className="text-sm mt-1">Pridaj prvý deň kliknutím na tlačidlo nižšie.</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button
          onClick={() => addDay.mutate({ mealPlanId: mealPlan.id })}
          disabled={addDay.isPending}
        >
          <Plus className="h-4 w-4" />
          Pridať deň
        </Button>
      </div>

      {mealPlan.days.length === 0 ? (
        emptyState
      ) : (
        <>
          {mealPlan.days.map((day) => {
            const dayTotals = day.meals.reduce(
              (acc: MacroTotals, m: Meal) => {
                const t = mealTotals(m.items);
                return {
                  calories: acc.calories + t.calories,
                  protein: acc.protein + t.protein,
                  carbs: acc.carbs + t.carbs,
                  fat: acc.fat + t.fat,
                };
              },
              { calories: 0, protein: 0, carbs: 0, fat: 0 }
            );

            return (
              <Card key={day.id}>
                <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                  <CardTitle className="text-lg flex items-center gap-2 flex-wrap">
                    <span>Deň {day.dayNumber}</span>
                    <span className="text-sm font-normal text-muted-foreground">
                      {Math.round(dayTotals.calories)} kcal · B: {Math.round(dayTotals.protein)}g S:{" "}
                      {Math.round(dayTotals.carbs)}g T: {Math.round(dayTotals.fat)}g
                    </span>
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "inline-flex items-center gap-1.5")}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Pridať jedlo
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {MEAL_TYPES.map(({ value, label }) => (
                          <DropdownMenuItem
                            key={value}
                            onClick={() => addMeal.mutate({ mealPlanDayId: day.id, name: value })}
                          >
                            {label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => handleDeleteDay(day.id)}
                      disabled={deleteDay.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {day.meals.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Žiadne jedlá. Pridaj jedlo cez „Pridať jedlo“.</p>
                  ) : (
                    day.meals.map((meal) => {
                      const t = mealTotals(meal.items);
                      return (
                        <div
                          key={meal.id}
                          className="border rounded-lg p-3 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              {formatMealName(meal.name)} — {Math.round(t.calories)} kcal
                            </p>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAddItemMealId(meal.id)}
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Položka
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDeleteMeal(meal.id)}
                                disabled={deleteMeal.isPending}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                          <ul className="text-sm space-y-1">
                            {meal.items.map((item) => {
                              const mult = item.amount / (item.food.servingSize || 100);
                              const cal = Math.round(item.food.calories * mult);
                              return (
                                <li
                                  key={item.id}
                                  className="flex justify-between items-center group"
                                >
                                  <span>
                                    {item.food.name} · {item.amount} {item.food.unit}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <span className="text-muted-foreground">{cal} kcal</span>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                                      onClick={() => handleDeleteItem(item.id)}
                                      disabled={deleteMealItem.isPending}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            );
          })}
        </>
      )}

      <AddMealItemDialog
        open={addItemMealId !== null}
        onOpenChange={(open) => !open && setAddItemMealId(null)}
        onAdd={(item) => {
          if (addItemMealId) {
            addMealItem.mutate({ mealId: addItemMealId, foodId: item.foodId, amount: item.amount });
            setAddItemMealId(null);
          }
        }}
      />

      {deleteConfirm && (
        <ConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteConfirm(null)}
          title={
            deleteConfirm.type === "day"
              ? "Zmazať deň?"
              : deleteConfirm.type === "meal"
                ? "Zmazať jedlo?"
                : "Odstrániť položku?"
          }
          description={
            deleteConfirm.type === "day"
              ? "Naozaj zmazať tento deň a všetky jeho jedlá?"
              : deleteConfirm.type === "meal"
                ? "Naozaj zmazať toto jedlo?"
                : "Naozaj odstrániť túto položku z jedla?"
          }
          confirmLabel="Zmazať"
          variant="destructive"
          onConfirm={onConfirmDelete}
          loading={deleteDay.isPending || deleteMeal.isPending || deleteMealItem.isPending}
        />
      )}
    </div>
  );
}
