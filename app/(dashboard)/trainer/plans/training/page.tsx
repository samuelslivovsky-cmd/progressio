import { requireTrainer } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { TrainingPlansList } from "@/components/trainer/training-plans-list";
import { AddTrainingPlanDialog } from "@/components/trainer/add-training-plan-dialog";
import { PageHeader } from "@/components/shared/page-header";

export default async function TrainingPlansPage() {
  const { profile } = await requireTrainer();

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
