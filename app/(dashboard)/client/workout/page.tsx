"use client";

import { WorkoutView } from "@/components/client/workout-view";
import { PageHeader } from "@/components/shared/page-header";

export default function ClientWorkoutPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Tréning"
        description="Začni tréning podľa plánu od trénera. Zapisuj série, opakovania a váhu. Po dokončení sa záznam uloží."
      />
      <WorkoutView />
    </div>
  );
}
