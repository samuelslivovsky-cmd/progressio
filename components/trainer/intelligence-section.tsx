"use client";

import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, Users } from "lucide-react";
import type { AlertType } from "@prisma/client";

const SEVERITY_STYLE: Record<string, string> = {
  high: "border-l-4 border-l-red-500 bg-red-500/5",
  medium: "border-l-4 border-l-amber-500 bg-amber-500/5",
  low: "border-l-4 border-l-green-500 bg-green-500/5",
};

const TYPE_LABEL: Record<AlertType, string> = {
  INACTIVE: "Neaktivita",
  PLATEAU: "Plateau",
  LOW_ADHERENCE: "Nízka adherencia",
  SKIPPED_EXERCISE: "Vynechané cvičenie",
  DROP_OFF_RISK: "Riziko odpadnutia",
  GOAL_REACHED: "Cieľ dosiahnutý",
  MILESTONE: "Míľnik",
};

export function IntelligenceSection() {
  const utils = trpc.useUtils();
  const { data: alerts = [] } = trpc.analytics.getAlerts.useQuery({
    unresolvedOnly: true,
    limit: 20,
  });
  const { data: ranking = [] } = trpc.analytics.getDropOffRanking.useQuery({
    limit: 10,
  });
  const resolve = trpc.analytics.resolveAlert.useMutation({
    onSuccess: () => utils.analytics.getAlerts.invalidate(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Inteligencia</h2>
        <p className="text-sm text-muted-foreground">
          Prioritná fronta a nevyriešené alerty podľa správania klientov
        </p>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Prioritná fronta (riziko odpadnutia)
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Klienti zoradení podľa drop-off skóre — kto potrebuje pozornosť
          </p>
        </CardHeader>
        <CardContent>
          {ranking.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Žiadni klienti alebo chýbajú dáta.</p>
          ) : (
            <div className="space-y-2">
              {ranking.map((r, i) => (
                <div
                  key={r.clientId}
                  className={`flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                    r.dropOffScore >= 61
                      ? "bg-red-500/10"
                      : r.dropOffScore >= 31
                        ? "bg-amber-500/10"
                        : "bg-muted/50"
                  }`}
                >
                  <span className="font-medium">{i + 1}. {r.clientName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">skóre {r.dropOffScore}</span>
                    <Link
                      href={`/trainer/clients/${r.clientId}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}
                    >
                      Detail
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Alerty
          </CardTitle>
          <p className="text-sm text-muted-foreground font-normal">
            Nevyriešené — označte ako vyriešené alebo prejdite na detail klienta
          </p>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Žiadne nevyriešené alerty.</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-lg p-3 text-sm ${SEVERITY_STYLE[alert.severity] ?? "bg-muted/50"}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium">{alert.client?.name ?? "Klient"}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {TYPE_LABEL[alert.type]}
                      </p>
                      <p className="mt-1">{alert.message}</p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <Link
                        href={`/trainer/clients/${alert.clientId}`}
                        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "inline-flex")}
                      >
                        Detail
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => resolve.mutate({ alertId: alert.id })}
                        disabled={resolve.isPending}
                      >
                        Vyriešiť
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
