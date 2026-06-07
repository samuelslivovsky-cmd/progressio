"use client";

import { trpc } from "@/lib/trpc/client";
import { MealPlanView } from "@/components/client/meal-plan-view";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Utensils } from "lucide-react";

export default function ClientMealPlanPage() {
  const { data: assignments = [], isLoading } = trpc.mealPlan.myAssigned.useQuery();

  const current = assignments[0];
  const mealPlan = current?.mealPlan;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Môj jedálniček" />
        <EmptyState title="Načítavam…" />
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="space-y-6">
        <PageHeader title="Môj jedálniček" />
        <EmptyState
          icon={<Utensils className="h-12 w-12" />}
          title="Nemáš priradený jedálniček"
          description="Tréner ti môže priradiť plán v tvojom profile. Obráť sa na neho."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Môj jedálniček" />
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
