"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

const DAY_COUNTS = [2, 3, 4, 5, 6] as const;

export function AddTrainingPlanDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dayCount, setDayCount] = useState<number>(3);
  const [error, setError] = useState<string | null>(null);

  const createPlan = trpc.trainingPlan.create.useMutation({
    onSuccess: (data) => {
      setOpen(false);
      setName("");
      setDescription("");
      setDayCount(3);
      setError(null);
      router.refresh();
      router.push(`/trainer/plans/training/${data.id}`);
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    createPlan.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      dayCount,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(buttonVariants(), "inline-flex items-center gap-2")}
      >
        <Plus className="h-4 w-4" />
        Nový tréningový plán
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nový tréningový plán</DialogTitle>
          <DialogDescription>
            Názov, popis a počet tréningových dní (2–6). Dni môžeš pomenovať v editore (Push, Pull, Legs…).
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
              <Label htmlFor="training-plan-name">Názov</Label>
              <Input
                id="training-plan-name"
                placeholder="napr. PPL Hypertrofia — Martin K."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="training-plan-desc">Popis / poznámka (voliteľné)</Label>
              <Input
                id="training-plan-desc"
                placeholder="Stručný popis pre klienta"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Počet tréningových dní</Label>
              <div className="flex gap-2 flex-wrap">
                {DAY_COUNTS.map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={dayCount === n ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDayCount(n)}
                  >
                    {n}
                  </Button>
                ))}
              </div>
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
