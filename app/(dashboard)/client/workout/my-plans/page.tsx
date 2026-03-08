"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusCircle, Dumbbell, Pencil } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export default function ClientMyPlansPage() {
  const { data: plans = [], isLoading } = trpc.clientTrainingPlan.list.useQuery();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Moje tréningové plány"
        backHref="/client/workout"
        description="Vytvor si vlastný plán a loguj tréningy podľa neho."
      />

      {isLoading ? (
        <EmptyState title="Načítavam plány…" />
      ) : (
        <div className="space-y-4">
          <Link
            href="/client/workout/my-plans/new"
            className={cn(buttonVariants(), "inline-flex items-center gap-2")}
          >
            <PlusCircle className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Vytvoriť nový plán</span>
          </Link>
          {plans.length === 0 ? (
            <EmptyState
              icon={<Dumbbell className="h-12 w-12" />}
              title="Zatiaľ nemáš vlastný plán"
              description="Vytvor prvý a pridaj dni s cvičeniami."
            >
              <Link
                href="/client/workout/my-plans/new"
                className={cn(buttonVariants(), "inline-flex")}
              >
                Vytvoriť plán
              </Link>
            </EmptyState>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {plans.map((plan) => {
                const totalExercises = plan.days.reduce(
                  (sum: number, d: { exercises: unknown[] }) => sum + d.exercises.length,
                  0
                );
                const activeDays = plan.days.filter(
                  (d) => !d.isRestDay && d.exercises.length > 0
                ).length;
                return (
                  <Card key={plan.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                      <Link
                        href={`/client/workout/my-plans/${plan.id}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {plan.days.length} dní · {activeDays} tréningových · {totalExercises}{" "}
                        cvičení
                      </p>
                      <Link
                        href={`/client/workout/my-plans/${plan.id}`}
                        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-3 inline-flex")}
                      >
                        Upraviť plán
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
