"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function AddMealPlanDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [calorieTarget, setCalorieTarget] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createPlan = trpc.mealPlan.create.useMutation({
    onSuccess: (data) => {
      setOpen(false);
      setName("");
      setDescription("");
      setCalorieTarget("");
      setError(null);
      router.refresh();
      router.push(`/trainer/plans/meal/${data.id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const target = calorieTarget.trim() ? Number.parseInt(calorieTarget, 10) : undefined;
    if (calorieTarget.trim() && (Number.isNaN(target) || target < 1)) {
      setError("Kalorický cieľ musí byť kladné číslo");
      return;
    }
    createPlan.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      calorieTargetPerDay: target,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nový jedálniček
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nový jedálniček</DialogTitle>
          <DialogDescription>
            Vytvor nový stravovací plán. Po uložení môžeš pridať dni a jedlá.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-2">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="meal-plan-name">Názov</Label>
              <Input
                id="meal-plan-name"
                placeholder="napr. Redukčný plán 1800 kcal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-plan-desc">Popis (voliteľné)</Label>
              <Input
                id="meal-plan-desc"
                placeholder="Stručný popis plánu"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meal-plan-cal">Kalorický cieľ / deň (voliteľné)</Label>
              <Input
                id="meal-plan-cal"
                type="number"
                min={1}
                placeholder="napr. 2200"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Zobrazí sa progress bar v editore</p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Zrušiť
            </Button>
            <Button type="submit" disabled={createPlan.isPending}>
              {createPlan.isPending ? "Vytváram..." : "Vytvoriť"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
