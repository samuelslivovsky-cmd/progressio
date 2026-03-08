import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MealTemplatesList } from "@/components/trainer/meal-templates-list";
import { PageHeader } from "@/components/shared/page-header";

export default async function MealTemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.role !== "TRAINER") redirect("/client");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Zoznam jedál"
        backHref="/trainer/plans/meal"
        description="Uložené kompletná jedlá, ktoré môžeš rýchlo pridať do jedálničkov"
      />
      <MealTemplatesList />
    </div>
  );
}
