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
import { Search, Dumbbell, ChevronRight, Plus } from "lucide-react";
import { cn, capitalizeWords } from "@/lib/utils";

type OurExercise = {
  id: string;
  name: string;
  description: string | null;
  muscleGroups: string[];
  equipment: string | null;
  videoUrl: string | null;
  externalId: string | null;
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
  const [selected, setSelected] = useState<OurExercise | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sets, setSets] = useState("3");
  const [reps, setReps] = useState("10");
  const [restSeconds, setRestSeconds] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Vlastný cvik – formulár
  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customMuscleGroups, setCustomMuscleGroups] = useState("");
  const [customEquipment, setCustomEquipment] = useState("");
  const [customVideoUrl, setCustomVideoUrl] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: ourResults = [], isFetching } = trpc.trainingPlan.searchOurExercises.useQuery(
    { q: debouncedSearch, limit: 12 },
    { enabled: open },
  );

  const createCustom = trpc.trainingPlan.createCustomExercise.useMutation({
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
      await addToDay.mutateAsync({
        trainingPlanDayId,
        exerciseId: selected.id,
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

  async function handleCreateCustom(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = customName.trim();
    if (!name) return;
    try {
      const muscleGroups = customMuscleGroups
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const exercise = await createCustom.mutateAsync({
        name,
        description: customDescription.trim() || undefined,
        muscleGroups,
        equipment: customEquipment.trim() || undefined,
        videoUrl: customVideoUrl.trim() || undefined,
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
    setShowCreateForm(false);
    setCustomName("");
    setCustomDescription("");
    setCustomMuscleGroups("");
    setCustomEquipment("");
    setCustomVideoUrl("");
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetForm();
    onOpenChange(open);
  }

  const displayName = selected?.name ?? "";
  const displayMuscles = selected?.muscleGroups ?? [];
  const displayImage = selected?.videoUrl ?? undefined;

  const step = showCreateForm ? "create" : selected ? "params" : "search";
  const isPending = addToDay.isPending || createCustom.isPending;

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
              ? "Vyhľadaj cvik v našej databáze alebo pridaj vlastný."
              : step === "create"
                ? "Pridaj nový cvik so slovenským názvom a popisom."
                : `Nastav počet sérií a opakovaní pre ${displayName ? capitalizeWords(displayName) : ""}.`}
          </DialogDescription>
        </DialogHeader>

        {step === "search" ? (
          <div className="space-y-4 flex-1 min-h-0 flex flex-col">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Názov cviku, sval, vybavenie..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-11 rounded-xl bg-muted/40 border-0 focus-visible:ring-2 focus-visible:ring-primary/20"
                autoFocus
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Vytvoriť vlastný cvik
            </Button>

            <div className="flex-1 overflow-y-auto min-h-[220px] -mx-1 px-1">
              {isFetching ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl border overflow-hidden bg-card">
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
              ) : ourResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
                    <Dumbbell className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">Žiadne výsledky</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Skús iný výraz alebo vytvor vlastný cvik
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(ourResults as OurExercise[]).map((ex) => (
                    <button
                      key={ex.id}
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
                        {ex.videoUrl ? (
                          <img
                            src={ex.videoUrl}
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
                          {ex.muscleGroups.slice(0, 2).map((m) => (
                            <Badge
                              key={m}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0 font-normal"
                            >
                              {capitalizeWords(m)}
                            </Badge>
                          ))}
                          {ex.equipment && (
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 font-normal"
                            >
                              {capitalizeWords(ex.equipment)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : step === "create" ? (
          <form onSubmit={handleCreateCustom} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="custom-name">Názov cviku *</Label>
                <Input
                  id="custom-name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="napr. Tlačenie na lavičke"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-desc">Popis (voliteľné)</Label>
                <Input
                  id="custom-desc"
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Krátky popis vykonania"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-muscles">Svalové skupiny (oddelené čiarkou)</Label>
                <Input
                  id="custom-muscles"
                  value={customMuscleGroups}
                  onChange={(e) => setCustomMuscleGroups(e.target.value)}
                  placeholder="napr. hrudník, triceps"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-equipment">Vybavenie (voliteľné)</Label>
                <Input
                  id="custom-equipment"
                  value={customEquipment}
                  onChange={(e) => setCustomEquipment(e.target.value)}
                  placeholder="napr. jednoručky, lavica"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-video">Odkaz na video (voliteľné)</Label>
                <Input
                  id="custom-video"
                  type="url"
                  value={customVideoUrl}
                  onChange={(e) => setCustomVideoUrl(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sets-custom">Počet sérií</Label>
                <Input
                  id="sets-custom"
                  type="number"
                  min={1}
                  value={sets}
                  onChange={(e) => setSets(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reps-custom">Opakovania</Label>
                <Input
                  id="reps-custom"
                  value={reps}
                  onChange={(e) => setReps(e.target.value)}
                  placeholder="10"
                />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                disabled={isPending}
              >
                Späť
              </Button>
              <Button type="submit" disabled={isPending || !customName.trim()}>
                {isPending ? "Pridávam..." : "Vytvoriť a pridať do dňa"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                {error}
              </div>
            )}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              {displayImage ? (
                <img
                  src={displayImage}
                  alt=""
                  className="h-14 w-14 rounded object-cover shrink-0"
                />
              ) : (
                <div className="h-14 w-14 rounded bg-muted flex items-center justify-center shrink-0">
                  <Dumbbell className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
              <div>
                <p className="font-medium">{displayName ? capitalizeWords(displayName) : ""}</p>
                <p className="text-xs text-muted-foreground">
                  {displayMuscles.map(capitalizeWords).join(", ")}
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
