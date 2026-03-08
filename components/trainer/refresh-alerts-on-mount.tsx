"use client";

import { useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc/client";

/** Pri načítaní trainer dashboardu spustí generovanie alertov pre všetkých klientov (iba raz za session). */
export function RefreshAlertsOnMount() {
  const ran = useRef(false);
  const mutation = trpc.analytics.generateAlertsForAllClients.useMutation();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    mutation.mutate();
  }, []);

  return null;
}
