"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Dumbbell, ChevronRight } from "lucide-react";
import { cn, capitalizeWords } from "@/lib/utils";
// Shape from ExerciseDB API (searchExternalExercises returns this)
type ExerciseDBItem = {
  exerciseId: string;
  name: string;
  gifUrl?: string;
  targetMuscles?: string[];
  bodyParts?: string[];
  equipments?: string[];
  secondaryMuscles?: string[];
  instructions?: string[];
};

interface AddExerciseToDayDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainingPlanDayId: string;
}

export function AddExerciseToDayDialog({
  open,
  onOpenChange,
  trainingPlanDayId,
}: AddExerciseToDayDialogProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selected, setSelected] = useState<ExerciseDBItem | null>(null);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [restSeconds, setRestSeconds] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: results = [], isFetching } =
    trpc.trainingPlan.searchExternalExercises.useQuery(
      { q: debouncedSearch, limit: 12 },
      { enabled: open && debouncedSearch.length >= 2 },
    );

  const getOrCreate = trpc.trainingPlan.getOrCreateExerciseFromApi.useMutation({
    onError: (e) => setError(e.message),
  });
  const addToDay = trpc.trainingPlan.addExerciseToDay.useMutation({
    onError: (e) => setError(e.message),
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError(null);
    try {
      const exercise = await getOrCreate.mutateAsync({
        exerciseId: selected.exerciseId,
        name: selected.name,
        gifUrl: selected.gifUrl ?? undefined,
        targetMuscles: selected.targetMuscles ?? [],
        secondaryMuscles: selected.secondaryMuscles,
        equipments: selected.equipments,
        instructions: selected.instructions,
      });
      await addToDay.mutateAsync({
        trainingPlanDayId,
        exerciseId: exercise.id,
        sets: parseInt(sets, 10) || 1,
        reps: reps.trim() || "10",
        restSeconds: restSeconds.trim() ? parseInt(restSeconds, 10) : undefined,
      });
      onOpenChange(false);
      resetForm();
      router.refresh();
    } catch {
      // error set in onError
    }
  }

  function resetForm() {
    setSelected(null);
    setSearch("");
    setDebouncedSearch("");
    setSets("3");
    setReps("10");
    setRestSeconds("");
    setError(null);
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetForm();
    onOpenChange(open);
  }

  const step = selected ? "params" : "search";
  const isPending = getOrCreate.isPending || addToDay.isPending;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "max-h-[90vh] overflow-hidden flex flex-col",
          step === "search" ? "max-w-xl" : "max-w-lg",
        )}
      >
        <DialogHeader>
          <DialogTitle>
            {step === "search" ? "Pridať cvičenie" : "Série a opakovania"}
          </DialogTitle>
          <DialogDescription>
            {step === "search"
              ? "Vyhľadaj cvičenie podľa názvu, svalovej skupiny alebo vybavenia."
              : `Nastav počet sérií a opakovaní pre ${selected ? capitalizeWords(selected.name) : ""}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "search" ? (
          <div className="space-y-4 flex-1 min-h-0 flex flex-col">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Bench press, biceps, dumbbell..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-11 rounded-xl bg-muted/40 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                autoFocus
              />
            </div>

            <div className="flex-1 overflow-y-auto min-h-[260px] -mx-1 px-1">
              {debouncedSearch.length < 2 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Zadaj aspoň 2 znaky
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Názov cvičenia, sval alebo vybavenie
                  </p>
                </div>
              ) : isFetching ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-xl border overflow-hidden bg-card"
                    >
                      <Skeleton className="aspect-square w-full" />
                      <div className="p-3 space-y-2">
                        <Skeleton className="h-4 w-full rounded" />
                        <div className="flex gap-1 flex-wrap">
                          <Skeleton className="h-5 w-12 rounded-full" />
                          <Skeleton className="h-5 w-14 rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                    <Dumbbell className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Žiadne výsledky
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Skús iný výraz alebo iné kľúčové slovo
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.map((ex) => (
                    <button
                      key={ex.exerciseId}
                      type="button"
                      onClick={() => setSelected(ex)}
                      className={cn(
                        "group rounded-xl border bg-card overflow-hidden text-left",
                        "hover:border-primary/40 hover:shadow-md hover:shadow-primary/5",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                        "transition-all duration-200",
                      )}
                    >
                      <div className="aspect-square w-full bg-muted/30 relative overflow-hidden">
                        {ex.gifUrl ? (
                          <img
                            src={ex.gifUrl}
                            alt=""
                            className="h-full w-full object-contain object-center p-1"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Dumbbell className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <ChevronRight className="absolute bottom-2 right-2 h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                      </div>
                      <div className="p-3 space-y-2">
                        <p className="font-medium text-sm leading-tight line-clamp-2">
                          {capitalizeWords(ex.name)}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(ex.targetMuscles ?? []).slice(0, 2).map((m) => (
                            <Badge
                              key={m}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 font-normal"
                            >
                              {m}
                            </Badge>
                          ))}
                          {ex.equipments?.length ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 font-normal"
                            >
                              {ex.equipments[0]}
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              {selected?.gifUrl ? (
                <img
                  src={selected.gifUrl}
                  alt=""
                  className="h-14 w-14 rounded object-cover shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded bg-muted flex items-center justify-center shrink-0">
                  <Dumbbell className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium">{selected ? capitalizeWords(selected.name) : ""}</p>
                <p className="text-xs text-muted-foreground">
                  {(selected?.targetMuscles ?? []).join(", ")}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sets">Počet sérií</Label>
                <Input
                  id="sets"
                  type="number"
                  min={1}
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reps">Opakovania (napr. 10 alebo 8-12)</Label>
                <Input
                  id="reps"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rest">Odpočinok (s) – voliteľné</Label>
              <Input
                id="rest"
                type="number"
                min={0}
                value={restSeconds}
                onChange={(e) => setRestSeconds(e.target.value)}
                placeholder="60"
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelected(null)}
                disabled={isPending}
              >
                Späť
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Pridávam..." : "Pridať cvičenie"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
