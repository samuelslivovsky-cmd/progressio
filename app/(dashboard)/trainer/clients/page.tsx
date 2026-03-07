import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ClientsTable } from "@/components/trainer/clients-table";
import { AddClientDialog } from "@/components/trainer/add-client-dialog";

export default async function ClientsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.role !== "TRAINER") redirect("/client");

  const clients = await prisma.profile.findMany({
    where: { trainerRelation: { trainerId: profile.id } },
    include: {
      weightLogs: { orderBy: { loggedAt: "desc" }, take: 1 },
      measurements: { orderBy: { loggedAt: "desc" }, take: 1 },
      assignedTrainingPlan: { include: { trainingPlan: true }, orderBy: { startDate: "desc" }, take: 1 },
      assignedMealPlan: { include: { mealPlan: true }, orderBy: { startDate: "desc" }, take: 1 },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Klienti</h1>
          <p className="text-muted-foreground">Spravuj svojich klientov</p>
        </div>
        <AddClientDialog />
      </div>

      <ClientsTable clients={clients} />
    </div>
  );
}
