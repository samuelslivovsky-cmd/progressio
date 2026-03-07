import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Scale, Ruler, ArrowLeft, TrendingDown, TrendingUp, Utensils } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClientPlanAssignCards } from "@/components/trainer/client-plan-assign-cards";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.role !== "TRAINER") redirect("/client");

  const client = await prisma.profile.findFirst({
    where: { id: clientId, trainerRelation: { trainerId: profile.id } },
    include: {
      weightLogs: { orderBy: { loggedAt: "desc" }, take: 10 },
      measurements: { orderBy: { loggedAt: "desc" }, take: 5 },
      assignedMealPlan: { include: { mealPlan: true }, orderBy: { startDate: "desc" }, take: 1 },
      assignedTrainingPlan: { include: { trainingPlan: true }, orderBy: { startDate: "desc" }, take: 1 },
    },
  });

  if (!client) notFound();

  const lastWeight = client.weightLogs[0];
  const prevWeight = client.weightLogs[1];
  const weightDiff = lastWeight && prevWeight ? lastWeight.weight - prevWeight.weight : null;

  const lastMeasurement = client.measurements[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/trainer/clients">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {client.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
            <p className="text-muted-foreground text-sm">{client.email}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Posledná váha</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastWeight ? `${lastWeight.weight} ${lastWeight.unit.toLowerCase()}` : "—"}
            </div>
            {weightDiff !== null && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${weightDiff < 0 ? "text-green-600" : "text-red-500"}`}>
                {weightDiff < 0 ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} kg oproti predchádzajúcemu
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {lastWeight ? format(lastWeight.loggedAt, "d. M. yyyy") : "Žiadny záznam"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Obvod pásu</CardTitle>
            <Ruler className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastMeasurement?.waist ? `${lastMeasurement.waist} cm` : "—"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lastMeasurement ? format(lastMeasurement.loggedAt, "d. M. yyyy") : "Žiadny záznam"}
            </p>
          </CardContent>
        </Card>

        <ClientPlanAssignCards
          clientId={client.id}
          assignedMealPlan={client.assignedMealPlan[0] ?? null}
          assignedTrainingPlan={client.assignedTrainingPlan[0] ?? null}
        />

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Strava klienta</CardTitle>
            <Utensils className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Záznam jedál, ktoré klient zadal v sekcii Strava.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/trainer/clients/${client.id}/food`}>
                Otvoriť záznam stravy
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">História váhy</CardTitle>
          </CardHeader>
          <CardContent>
            {client.weightLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground">Žiadne záznamy</p>
            ) : (
              <div className="space-y-2">
                {client.weightLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{format(log.loggedAt, "d. M. yyyy")}</span>
                    <span className="font-medium">{log.weight} {log.unit.toLowerCase()}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Posledné merania</CardTitle>
          </CardHeader>
          <CardContent>
            {!lastMeasurement ? (
              <p className="text-sm text-muted-foreground">Žiadne záznamy</p>
            ) : (
              <div className="space-y-2">
                {[
                  { label: "Hrudník", value: lastMeasurement.chest },
                  { label: "Pás", value: lastMeasurement.waist },
                  { label: "Boky", value: lastMeasurement.hips },
                  { label: "Stehno", value: lastMeasurement.thigh },
                  { label: "Rameno", value: lastMeasurement.arm },
                  { label: "Lýtko", value: lastMeasurement.calf },
                ].filter((m) => m.value).map((m) => (
                  <div key={m.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium">{m.value} {lastMeasurement.unit.toLowerCase()}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-1">
                  {format(lastMeasurement.loggedAt, "d. M. yyyy")}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
