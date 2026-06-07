import { requireTrainer } from "@/lib/auth-helpers";
import { prisma } from "@progressio/db";
import { ClientsTable } from "@/components/trainer/clients-table";
import { AddClientDialog } from "@/components/trainer/add-client-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { toNum } from "@/lib/utils";

export default async function ClientsPage() {
  const { profile } = await requireTrainer();

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

  const serializedClients = clients.map((c) => ({
    ...c,
    weightLogs: c.weightLogs.map((w) => ({ ...w, weight: toNum(w.weight) })),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Klienti"
        description="Spravuj svojich klientov"
      >
        <AddClientDialog />
      </PageHeader>

      <ClientsTable clients={serializedClients} />
    </div>
  );
}
