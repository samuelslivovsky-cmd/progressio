import { requireTrainer } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MealPlanEditor } from "@/components/trainer/meal-plan-editor";

export default async function MealPlanDetailPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;
  const { profile } = await requireTrainer();

  const [mealPlan, clients] = await Promise.all([
    prisma.mealPlan.findFirst({
      where: { id: planId, trainerId: profile.id },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            meals: {
              include: {
                items: { include: { food: true } },
              },
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

  if (!mealPlan) notFound();

  return (
    <MealPlanEditor
      mealPlan={mealPlan}
      assignmentCount={mealPlan._count.assignments}
      clients={clients}
    />
  );
}
