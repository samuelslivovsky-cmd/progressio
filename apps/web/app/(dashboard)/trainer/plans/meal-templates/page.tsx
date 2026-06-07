import { requireTrainer } from "@/lib/auth-helpers";
import { MealTemplatesList } from "@/components/trainer/meal-templates-list";
import { PageHeader } from "@/components/shared/page-header";

export default async function MealTemplatesPage() {
  await requireTrainer();

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
