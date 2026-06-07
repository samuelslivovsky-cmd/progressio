"use client";

import { FoodLogView } from "@/components/client/food-log-view";
import { PageHeader } from "@/components/shared/page-header";

export default function ClientFoodPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Strava"
        description="Zaznamenávaj si jedlá podľa dní. Tvoj tréner uvidí tvoj záznam stravy."
      />
      <FoodLogView />
    </div>
  );
}
