"use client";

import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronRight, Scale, Dumbbell, Utensils } from "lucide-react";
import type { Profile, WeightLog, Measurement, TrainingPlanAssignment, MealPlanAssignment, TrainingPlan, MealPlan } from "@prisma/client";

type ClientWithData = Profile & {
  weightLogs: WeightLog[];
  measurements: Measurement[];
  assignedTrainingPlan: (TrainingPlanAssignment & { trainingPlan: TrainingPlan })[];
  assignedMealPlan: (MealPlanAssignment & { mealPlan: MealPlan })[];
};

interface ClientsTableProps {
  clients: ClientWithData[];
}

export function ClientsTable({ clients }: ClientsTableProps) {
  const [search, setSearch] = useState("");

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Hľadaj klienta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {clients.length === 0
              ? "Zatiaľ nemáš žiadnych klientov. Pridaj prvého kliknutím na tlačidlo vyššie."
              : "Žiadni klienti nevyhovujú hľadaniu."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((client) => {
            const lastWeight = client.weightLogs[0];
            const activePlan = client.assignedTrainingPlan[0];
            const activeMeal = client.assignedMealPlan[0];

            return (
              <Link key={client.id} href={`/trainer/clients/${client.id}`}>
                <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                      {client.name[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{client.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{client.email}</p>
                    </div>

                    <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                      {lastWeight && (
                        <div className="flex items-center gap-1.5">
                          <Scale className="h-3.5 w-3.5" />
                          <span>{lastWeight.weight} {lastWeight.unit.toLowerCase()}</span>
                          <span className="text-xs">({format(lastWeight.loggedAt, "d.M.")})</span>
                        </div>
                      )}

                      {activePlan && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Dumbbell className="h-3 w-3" />
                          {activePlan.trainingPlan.name}
                        </Badge>
                      )}

                      {activeMeal && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Utensils className="h-3 w-3" />
                          {activeMeal.mealPlan.name}
                        </Badge>
                      )}
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
