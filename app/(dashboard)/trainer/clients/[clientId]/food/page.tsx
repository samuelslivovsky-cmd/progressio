import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ClientFoodLogView } from "@/components/trainer/client-food-log-view";

export default async function ClientFoodPage({
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
  });

  if (!client) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Strava klienta</h1>
      <ClientFoodLogView clientId={client.id} clientName={client.name} />
    </div>
  );
}
