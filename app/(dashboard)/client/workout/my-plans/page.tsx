"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, PlusCircle, Dumbbell, Pencil } from "lucide-react";

export default function ClientMyPlansPage() {
  const { data: plans = [], isLoading } = trpc.clientTrainingPlan.list.useQuery();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/client/workout"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Moje tréningové plány</h1>
          <p className="text-muted-foreground text-sm">
            Vytvor si vlastný plán a loguj tréningy podľa neho.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Načítavam plány…
          </CardContent>
        </Card>
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
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Zatiaľ nemáš vlastný plán</p>
                <p className="text-sm mt-1">Vytvor prvý a pridaj dni s cvičeniami.</p>
                <Link
                  href="/client/workout/my-plans/new"
                  className={cn(buttonVariants(), "mt-4 inline-flex")}
                >
                  Vytvoriť plán
                </Link>
              </CardContent>
            </Card>
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
