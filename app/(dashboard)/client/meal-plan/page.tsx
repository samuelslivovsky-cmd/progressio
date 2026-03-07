"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent } from "@/components/ui/card";
import { MealPlanView } from "@/components/client/meal-plan-view";
import { Utensils } from "lucide-react";

export default function ClientMealPlanPage() {
  const { data: assignments = [], isLoading } = trpc.mealPlan.myAssigned.useQuery();

  const current = assignments[0];
  const mealPlan = current?.mealPlan;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Môj jedálniček</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Načítavam…
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Môj jedálniček</h1>
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium">Nemáš priradený jedálniček</p>
            <p className="text-sm mt-1">
              Tréner ti môže priradiť plán v tvojom profile. Obráť sa na neho.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Môj jedálniček</h1>
      <MealPlanView
        mealPlan={{
          id: mealPlan.id,
          name: mealPlan.name,
          description: mealPlan.description,
          calorieTargetPerDay: mealPlan.calorieTargetPerDay,
          days: mealPlan.days,
        }}
        assignmentStartDate={current.startDate}
        note={current.note}
      />
    </div>
  );
}
