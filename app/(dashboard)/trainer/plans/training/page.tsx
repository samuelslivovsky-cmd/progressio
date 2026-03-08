import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TrainingPlansList } from "@/components/trainer/training-plans-list";
import { AddTrainingPlanDialog } from "@/components/trainer/add-training-plan-dialog";
import { PageHeader } from "@/components/shared/page-header";

export default async function TrainingPlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.role !== "TRAINER") redirect("/client");

  const trainingPlans = await prisma.trainingPlan.findMany({
    where: { trainerId: profile.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { days: true, assignments: true } },
      assignments: {
        include: { client: { select: { id: true, name: true } } },
        orderBy: { startDate: "desc" },
      },
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tréningové plány"
        description="Vytváraj a spravuj tréningové plány pre klientov"
      >
        <AddTrainingPlanDialog />
      </PageHeader>

      <TrainingPlansList trainingPlans={trainingPlans} />
    </div>
  );
}
