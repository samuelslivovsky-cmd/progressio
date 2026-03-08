import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { ClientDetailTabs } from "@/components/trainer/client-detail-tabs";

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
      weightLogs: { orderBy: { loggedAt: "desc" }, take: 2 },
      measurements: { orderBy: { loggedAt: "desc" }, take: 1 },
      assignedMealPlan: { include: { mealPlan: true }, orderBy: { startDate: "desc" }, take: 1 },
      assignedTrainingPlan: { include: { trainingPlan: true }, orderBy: { startDate: "desc" }, take: 1 },
    },
  });

  if (!client) notFound();

  const lastWeight = client.weightLogs[0]
    ? { weight: client.weightLogs[0].weight, unit: client.weightLogs[0].unit, loggedAt: client.weightLogs[0].loggedAt }
    : null;
  const prevWeight = client.weightLogs[1] ? { weight: client.weightLogs[1].weight } : null;
  const lastMeasurement = client.measurements[0]
    ? {
        waist: client.measurements[0].waist,
        chest: client.measurements[0].chest,
        hips: client.measurements[0].hips,
        loggedAt: client.measurements[0].loggedAt,
      }
    : null;
  const assignedMeal = client.assignedMealPlan[0];
  const assignedTraining = client.assignedTrainingPlan[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/trainer/clients"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
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

      <ClientDetailTabs
        clientId={client.id}
        clientName={client.name}
        clientEmail={client.email ?? ""}
        lastWeight={lastWeight}
        prevWeight={prevWeight}
        lastMeasurement={lastMeasurement}
        assignedMealPlan={
          assignedMeal
            ? {
                id: assignedMeal.id,
                startDate: assignedMeal.startDate,
                endDate: assignedMeal.endDate,
                note: assignedMeal.note,
                mealPlan: { id: assignedMeal.mealPlan.id, name: assignedMeal.mealPlan.name },
              }
            : null
        }
        assignedTrainingPlan={
          assignedTraining
            ? {
                id: assignedTraining.id,
                startDate: assignedTraining.startDate,
                endDate: assignedTraining.endDate,
                note: null,
                trainingPlan: { id: assignedTraining.trainingPlan.id, name: assignedTraining.trainingPlan.name },
              }
            : null
        }
      />
    </div>
  );
}
