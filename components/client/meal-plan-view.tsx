"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import { format } from "date-fns";

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
  fiber?: number;
  servingSize: number;
  unit: string;
};
type MealItem = { id: string; amount: number; food: Food };
type Meal = { id: string; name: string; items: MealItem[] };
type MealPlanDay = { id: string; dayNumber: number; meals: Meal[] };
type MealPlan = {
  id: string;
  name: string;
  description: string | null;
  calorieTargetPerDay: number | null;
  days: MealPlanDay[];
};

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

interface MealPlanViewProps {
  mealPlan: MealPlan;
  assignmentStartDate?: Date | string;
  note?: string | null;
}

export function MealPlanView({
  mealPlan,
  assignmentStartDate,
  note,
}: MealPlanViewProps) {
  const [activeDay, setActiveDay] = useState(mealPlan.days[0]?.dayNumber ?? 1);
  const currentDay = mealPlan.days.find((d) => d.dayNumber === activeDay);

  if (mealPlan.days.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Plán je zatiaľ prázdny</p>
          <p className="text-sm mt-1">Tréner ti sem pridá jedlá.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{mealPlan.name}</h2>
        {mealPlan.description && (
          <p className="text-sm text-muted-foreground">{mealPlan.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          {mealPlan.calorieTargetPerDay != null && (
            <span>Cieľ: {mealPlan.calorieTargetPerDay} kcal / deň</span>
          )}
          {assignmentStartDate && (
            <span>
              Platný od {format(new Date(assignmentStartDate), "d. M. yyyy")}
            </span>
          )}
        </div>
        {note && (
          <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3 mt-2">
            {note}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
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
            <Button
              key={day.id}
              variant={activeDay === day.dayNumber ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveDay(day.dayNumber)}
            >
              Deň {day.dayNumber} ({Math.round(dayTotals.calories)} kcal)
            </Button>
          );
        })}
      </div>

      {currentDay && (
          <Card className="mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Deň {currentDay.dayNumber}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {(() => {
                    const t = currentDay.meals.reduce(
                      (acc: MacroTotals, m: Meal) => {
                        const x = mealTotals(m.items);
                        return {
                          calories: acc.calories + x.calories,
                          protein: acc.protein + x.protein,
                          carbs: acc.carbs + x.carbs,
                          fat: acc.fat + x.fat,
                        };
                      },
                      { calories: 0, protein: 0, carbs: 0, fat: 0 }
                    );
                    return `${Math.round(t.calories)} kcal · B: ${Math.round(t.protein)}g S: ${Math.round(t.carbs)}g T: ${Math.round(t.fat)}g`;
                  })()}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentDay.meals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  V tento deň nie sú zadané žiadne jedlá.
                </p>
              ) : (
                currentDay.meals.map((meal) => {
                  const t = mealTotals(meal.items);
                  return (
                    <div
                      key={meal.id}
                      className="border rounded-lg p-3 space-y-2 bg-muted/30"
                    >
                      <p className="text-sm font-medium text-muted-foreground">
                        {formatMealName(meal.name)} — {Math.round(t.calories)} kcal
                        <span className="ml-2 text-xs">
                          B: {Math.round(t.protein)}g S: {Math.round(t.carbs)}g T:{" "}
                          {Math.round(t.fat)}g
                        </span>
                      </p>
                      <ul className="text-sm space-y-1">
                        {meal.items.map((item) => {
                          const mult =
                            item.amount / (item.food.servingSize || 100);
                          const cal = Math.round(item.food.calories * mult);
                          return (
                            <li
                              key={item.id}
                              className="flex justify-between items-center"
                            >
                              <span>
                                {item.food.name} · {item.amount}{" "}
                                {item.food.unit}
                              </span>
                              <span className="text-muted-foreground">
                                {cal} kcal
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
        )}
    </div>
  );
}
