"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { capitalizeWords } from "@/lib/utils";
import { toast } from "sonner";

type PlanExercise = {
  id: string;
  sets: number;
  reps: string;
  restSeconds: number | null;
  note: string | null;
  exercise: { name: string };
};

interface EditExerciseInPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: PlanExercise | null;
  onSuccess: () => void;
}

export function EditExerciseInPlanDialog({
  open,
  onOpenChange,
  exercise,
  onSuccess,
}: EditExerciseInPlanDialogProps) {
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [restSeconds, setRestSeconds] = useState("");
  const [note, setNote] = useState("");

  const updateExercise = trpc.clientTrainingPlan.updateExercise.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      toast.success("Cvičenie upravené.");
    },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (open && exercise) {
      setSets(String(exercise.sets));
      setReps(exercise.reps);
      setRestSeconds(exercise.restSeconds != null ? String(exercise.restSeconds) : "");
      setNote(exercise.note ?? "");
    }
  }, [open, exercise?.id, exercise?.sets, exercise?.reps, exercise?.restSeconds, exercise?.note]);

  function handleSave() {
    if (!exercise) return;
    const setsNum = parseInt(sets, 10);
    if (!Number.isFinite(setsNum) || setsNum < 1) {
      toast.error("Série musia byť kladné číslo.");
      return;
    }
    if (!reps.trim()) {
      toast.error("Zadaj opakovania.");
      return;
    }
    updateExercise.mutate({
      id: exercise.id,
      sets: setsNum,
      reps: reps.trim(),
      restSeconds: restSeconds.trim() === "" ? null : parseInt(restSeconds, 10) || 0,
      note: note.trim() || null,
    });
  }

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upraviť cvičenie</DialogTitle>
          <DialogDescription>
            {capitalizeWords(exercise.exercise.name)} — zmeň série, opakovania alebo poznámku.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-2">
            <Label>Série</Label>
            <Input
              type="number"
              min={1}
              value={sets}
              onChange={(e) => setSets(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Opakovania (napr. 10 alebo 8-12)</Label>
            <Input
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              placeholder="10"
            />
          </div>
          <div className="space-y-2">
            <Label>Odpočinok (s)</Label>
            <Input
              type="number"
              min={0}
              value={restSeconds}
              onChange={(e) => setRestSeconds(e.target.value)}
              placeholder="—"
            />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Poznámka</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="—"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zrušiť
          </Button>
          <Button onClick={handleSave} disabled={updateExercise.isPending}>
            {updateExercise.isPending ? "Ukladám…" : "Uložiť"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
