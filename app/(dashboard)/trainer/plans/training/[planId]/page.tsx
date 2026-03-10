import { requireTrainer } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TrainingPlanHeader } from "@/components/trainer/training-plan-header";
import { TrainingPlanDetailClient } from "@/components/trainer/training-plan-detail-client";

export default async function TrainingPlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const { profile } = await requireTrainer();

  const [trainingPlan, clients] = await Promise.all([
    prisma.trainingPlan.findFirst({
      where: { id: planId, trainerId: profile.id },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            exercises: {
              orderBy: { order: "asc" },
              include: { exercise: true },
            },
          },
        },
        _count: { select: { assignments: true } },
      },
    }),
    prisma.profile.findMany({
      where: { trainerRelation: { trainerId: profile.id } },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!trainingPlan) notFound();

  return (
    <div className="space-y-6">
      <TrainingPlanDetailClient
        trainingPlan={trainingPlan}
        assignmentCount={trainingPlan._count.assignments}
        clients={clients}
      />
    </div>
  );
}
