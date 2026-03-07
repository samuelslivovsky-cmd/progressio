"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, ClipboardList, Calendar, Users } from "lucide-react";
import type { MealPlan } from "@prisma/client";

type MealPlanWithCounts = MealPlan & {
  _count: { days: number; assignments: number };
};

interface MealPlansListProps {
  mealPlans: MealPlanWithCounts[];
}

const SEARCH_DEBOUNCE_MS = 200;

export function MealPlansList({ mealPlans }: MealPlansListProps) {
  const [searchInput, setSearchInput] = useState("");
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setSearchFilter(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const filtered = useMemo(
    () =>
      mealPlans.filter(
        (p) =>
          p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
          (p.description?.toLowerCase().includes(searchFilter.toLowerCase()) ?? false)
      ),
    [mealPlans, searchFilter]
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Hľadaj jedálniček..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {mealPlans.length === 0
              ? "Zatiaľ nemáš žiadne jedálničky. Vytvor prvý kliknutím na tlačidlo vyššie."
              : "Žiadny jedálniček nevyhovuje hľadaniu."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((plan) => (
            <Link key={plan.id} href={`/trainer/plans/meal/${plan.id}`}>
              <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <ClipboardList className="h-5 w-5" />
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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
