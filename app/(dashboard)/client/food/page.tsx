"use client";

import { FoodLogView } from "@/components/client/food-log-view";

export default function ClientFoodPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Strava</h1>
      <p className="text-muted-foreground">
        Zaznamenávaj si jedlá podľa dní. Tvoj tréner uvidí tvoj záznam stravy.
      </p>
      <FoodLogView />
    </div>
  );
}
