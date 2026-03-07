import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MealPlansList } from "@/components/trainer/meal-plans-list";
import { AddMealPlanDialog } from "@/components/trainer/add-meal-plan-dialog";

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
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jedálničky</h1>
          <p className="text-muted-foreground">Vytváraj a spravuj stravovacie plány pre klientov</p>
        </div>
        <AddMealPlanDialog />
      </div>

      <MealPlansList mealPlans={mealPlans} />
    </div>
  );
}
