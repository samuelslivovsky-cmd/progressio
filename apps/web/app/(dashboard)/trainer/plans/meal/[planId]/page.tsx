import { requireTrainer } from "@/lib/auth-helpers";
import { prisma } from "@progressio/db";
import { notFound } from "next/navigation";
import { MealPlanEditor } from "@/components/trainer/meal-plan-editor";
import { serializeMealItem } from "@/lib/serializers";

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

  const serializedPlan = {
    ...mealPlan,
    days: mealPlan.days.map((day) => ({
      ...day,
      meals: day.meals.map((meal) => ({
        ...meal,
        items: meal.items.map(serializeMealItem),
      })),
    })),
  };

  return (
    <MealPlanEditor
      mealPlan={serializedPlan}
      assignmentCount={mealPlan._count.assignments}
      clients={clients}
    />
  );
}
