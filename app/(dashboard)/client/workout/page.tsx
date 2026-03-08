"use client";

import { WorkoutView } from "@/components/client/workout-view";

export default function ClientWorkoutPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Tréning</h1>
      <p className="text-muted-foreground">
        Začni tréning podľa plánu od trénera. Zapisuj série, opakovania a váhu. Po dokončení sa záznam uloží.
      </p>
      <WorkoutView />
    </div>
  );
}
