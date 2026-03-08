import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MealPlansList } from "@/components/trainer/meal-plans-list";
import { AddMealPlanDialog } from "@/components/trainer/add-meal-plan-dialog";
import { PageHeader } from "@/components/shared/page-header";

export default async function MealPlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.role !== "TRAINER") redirect("/client");

  const mealPlans = await prisma.mealPlan.findMany({
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
        title="Jedálničky"
        description="Vytváraj a spravuj stravovacie plány pre klientov"
      >
        <AddMealPlanDialog />
      </PageHeader>

      <MealPlansList mealPlans={mealPlans} />
    </div>
  );
}
