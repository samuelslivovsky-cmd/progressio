"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, Dumbbell, Calendar, Users, UserPlus } from "lucide-react";
import type { TrainingPlan } from "@prisma/client";
import { AssignTrainingPlanDialog } from "./assign-training-plan-dialog";

type TrainingPlanWithCounts = TrainingPlan & {
  _count: { days: number; assignments: number };
};

interface TrainingPlansListProps {
  trainingPlans: TrainingPlanWithCounts[];
}

export function TrainingPlansList({ trainingPlans }: TrainingPlansListProps) {
  const [search, setSearch] = useState("");
  const [assignPlanId, setAssignPlanId] = useState<string | null>(null);
  const [assignPlanName, setAssignPlanName] = useState("");

  const filtered = trainingPlans.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Hľadaj tréningový plán..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {trainingPlans.length === 0
              ? "Zatiaľ nemáš žiadne tréningové plány. Vytvor prvý kliknutím na tlačidlo vyššie."
              : "Žiadny tréningový plán nevyhovuje hľadaniu."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((plan) => (
            <Card
              key={plan.id}
              className="hover:bg-muted/40 transition-colors"
            >
              <CardContent className="flex items-center gap-4 py-4">
                <Link
                  href={`/trainer/plans/training/${plan.id}`}
                  className="flex flex-1 items-center gap-4 min-w-0"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Dumbbell className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{plan.name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {plan.description || "Bez popisu"}
                    </p>
                  </div>

                  <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{plan._count.days} dní</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      <span>{plan._count.assignments} priradení</span>
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setAssignPlanId(plan.id);
                    setAssignPlanName(plan.name);
                  }}
                  className="shrink-0"
                >
                  <UserPlus className="h-4 w-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Priradiť</span>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {assignPlanId && (
        <AssignTrainingPlanDialog
          open={true}
          onOpenChange={(open) => {
            if (!open) {
              setAssignPlanId(null);
              setAssignPlanName("");
            }
          }}
          trainingPlanId={assignPlanId}
          planName={assignPlanName}
        />
      )}
    </div>
  );
}
