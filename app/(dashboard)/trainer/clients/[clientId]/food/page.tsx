import { requireTrainer } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ClientFoodLogView } from "@/components/trainer/client-food-log-view";

export default async function ClientFoodPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const { profile } = await requireTrainer();

  const client = await prisma.profile.findFirst({
    where: { id: clientId, trainerRelation: { trainerId: profile.id } },
  });

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Strava klienta</h1>
      <ClientFoodLogView clientId={client.id} clientName={client.name} />
    </div>
  );
}
