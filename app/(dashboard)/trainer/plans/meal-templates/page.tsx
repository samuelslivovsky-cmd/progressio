import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MealTemplatesList } from "@/components/trainer/meal-templates-list";
import { ArrowLeft } from "lucide-react";

export default async function MealTemplatesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
  if (!profile || profile.role !== "TRAINER") redirect("/client");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/trainer/plans/meal"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Zoznam jedál</h1>
          <p className="text-muted-foreground">
            Uložené kompletná jedlá, ktoré môžeš rýchlo pridať do jedálničkov
          </p>
        </div>
      </div>
      <MealTemplatesList />
    </div>
  );
}
