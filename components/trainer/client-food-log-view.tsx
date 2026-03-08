"use client";

import { useState } from "react";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, ArrowLeft } from "lucide-react";
import Link from "next/link";

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

interface ClientFoodLogViewProps {
  clientId: string;
  clientName: string;
}

export function ClientFoodLogView({ clientId, clientName }: ClientFoodLogViewProps) {
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);

  const { data: log, isLoading } = trpc.foodLog.byDateForClient.useQuery(
    { clientId, date },
    { enabled: !!clientId }
  );

  const items = (log as FoodLogWithItems)?.items ?? [];
  const byMeal = MEAL_ORDER.map((mealType) => ({
    mealType,
    label: MEAL_LABELS[mealType] ?? mealType,
    items: items.filter((i) => i.mealType === mealType),
  }));
  const totalCal = items.reduce((sum, i) => sum + itemCalories(i), 0);

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
      <div className="flex items-center gap-4">
        <Link href={`/trainer/clients/${clientId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {clientName[0]?.toUpperCase() ?? "?"}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{clientName}</h1>
            <p className="text-muted-foreground text-sm">Záznam stravy — vyber deň</p>
          </div>
        </div>
      </div>

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
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">
            Záznam stravy — {format(new Date(date), "d. M. yyyy")}
          </CardTitle>
          <span className="text-sm font-medium text-muted-foreground">
            Spolu: {Math.round(totalCal)} kcal
          </span>
        </CardHeader>
        <CardContent>
          {items.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium">Klient v tento deň nezadal žiadne jedlá</p>
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
                            className="py-2 border-b border-border/50 last:border-0"
                          >
                            <span className="font-medium">{item.food.name}</span>
                            <span className="text-muted-foreground text-sm ml-2">
                              {item.amount} {item.food.unit} · {cal} kcal
                            </span>
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
    </div>
  );
}
