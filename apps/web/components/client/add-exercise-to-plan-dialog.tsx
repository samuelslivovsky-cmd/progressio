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
import { Search } from "lucide-react";
import { toast } from "sonner";
import { capitalizeWords } from "@/lib/utils";

type ExerciseOption = {
  id: string;
  name: string;
  equipment: string | null;
  muscleGroups: string[];
  videoUrl: string | null;
};

interface AddExerciseToPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientTrainingPlanDayId: string;
  onSuccess: () => void;
}

export function AddExerciseToPlanDialog({
  open,
  onOpenChange,
  clientTrainingPlanDayId,
  onSuccess,
}: AddExerciseToPlanDialogProps) {
  const [query, setQuery] = useState("");
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState("10");
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const { data: exercises = [], isLoading } = trpc.clientTrainingPlan.searchExercises.useQuery(
    { q: query, limit: 12 },
    { enabled: open }
  );

  const addMutation = trpc.clientTrainingPlan.addExerciseToDay.useMutation({
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
      setSelectedExerciseId(null);
      setQuery("");
    },
    onError: (e) => toast.error(e.message),
  });

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedExerciseId(null);
      setSets(3);
      setReps("10");
    }
  }, [open]);

  function handleAdd() {
    if (!selectedExerciseId) return;
    addMutation.mutate({
      clientTrainingPlanDayId,
      exerciseId: selectedExerciseId,
      sets,
      reps: reps.trim() || "10",
    });
  }

  const selected = exercises.find((e) => e.id === selectedExerciseId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Pridať cvičenie</DialogTitle>
          <DialogDescription>
            Vyhľadaj cvičenie a nastav počet sérií a opakovaní.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="space-y-2">
            <Label>Vyhľadať</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="názov cvičenia…"
                className="pl-8"
              />
            </div>
          </div>
          <div className="border rounded-lg overflow-auto max-h-48 min-h-32">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Načítavam…
              </div>
            ) : exercises.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {query.trim() ? "Žiadne cvičenia" : "Zadaj názov pre vyhľadanie"}
              </div>
            ) : (
              <ul className="divide-y">
                {(exercises as ExerciseOption[]).map((ex) => (
                  <li key={ex.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedExerciseId(ex.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/50 ${
                        selectedExerciseId === ex.id ? "bg-primary/10" : ""
                      }`}
                    >
                      {ex.videoUrl ? (
                        <img
                          src={ex.videoUrl}
                          alt=""
                          className="h-10 w-10 rounded object-cover shrink-0 bg-muted"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded shrink-0 bg-muted flex items-center justify-center text-muted-foreground text-xs">
                          —
                        </div>
                      )}
                      <span className="min-w-0 flex-1 text-left">
                        <span className="font-medium">{capitalizeWords(ex.name)}</span>
                        {ex.equipment && (
                          <span className="text-muted-foreground ml-1">· {capitalizeWords(ex.equipment)}</span>
                        )}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selected && (
            <div className="space-y-3">
              {(selected as ExerciseOption).videoUrl && (
                <div className="rounded-lg overflow-hidden border bg-muted/30">
                  <img
                    src={(selected as ExerciseOption).videoUrl!}
                    alt={capitalizeWords(selected.name)}
                    className="w-full aspect-video object-contain"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Série</Label>
                <Input
                  type="number"
                  min={1}
                  max={10}
                  value={sets}
                  onChange={(e) => setSets(Number(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-1">
                <Label>Opakovania (napr. 10 alebo 8-12)</Label>
                <Input
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="10"
                />
              </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zrušiť
          </Button>
          <Button
            onClick={handleAdd}
            disabled={!selectedExerciseId || addMutation.isPending}
          >
            {addMutation.isPending ? "Pridávam…" : "Pridať"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
