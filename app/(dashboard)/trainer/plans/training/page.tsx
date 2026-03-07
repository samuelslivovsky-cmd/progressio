import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TrainingPlansList } from "@/components/trainer/training-plans-list";
import { AddTrainingPlanDialog } from "@/components/trainer/add-training-plan-dialog";

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
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tréningové plány</h1>
          <p className="text-muted-foreground">
            Vytváraj a spravuj tréningové plány pre klientov
          </p>
        </div>
        <AddTrainingPlanDialog />
      </div>

      <TrainingPlansList trainingPlans={trainingPlans} />
    </div>
  );
}
