"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dumbbell,
  MoreVertical,
  Plus,
  Save,
  Trash2,
  UserPlus,
  Copy,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { TrainingPlanHeader } from "./training-plan-header";
import { AddExerciseToDayDialog } from "./add-exercise-to-day-dialog";
import { cn, capitalizeWords } from "@/lib/utils";

type Exercise = {
  id: string;
  name: string;
  description: string | null;
  muscleGroups: string[];
  equipment: string | null;
  videoUrl: string | null;
};

type PlanExercise = {
  id: string;
  sets: number;
  reps: string;
  restSeconds: number | null;
  note: string | null;
  order: number;
  exercise: Exercise;
};

type PlanDay = {
  id: string;
  dayNumber: number;
  name: string | null;
  isRestDay: boolean;
  exercises: PlanExercise[];
};

type LocalDay = {
  tempId: string;
  dayNumber: number;
  name: string | null;
  exercises: never[];
};

type DisplayDay = (PlanDay & { tempId?: never }) | (LocalDay & { id?: never; exercises: never[]; isRestDay?: never });

type TrainingPlanDetail = {
  id: string;
  name: string;
  description: string | null;
  days: PlanDay[];
};

function isLocalDay(d: DisplayDay): d is LocalDay {
  return "tempId" in d;
}

interface TrainingPlanDetailClientProps {
  trainingPlan: TrainingPlanDetail;
  assignmentCount: number;
  clients: { id: string; name: string; email: string }[];
}

export function TrainingPlanDetailClient({
  trainingPlan,
  assignmentCount,
  clients,
}: TrainingPlanDetailClientProps) {
  const router = useRouter();
  const [localDays, setLocalDays] = useState<LocalDay[]>([]);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(
    trainingPlan.days[0]?.id ?? null
  );
  const [addExerciseDayId, setAddExerciseDayId] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignClientId, setAssignClientId] = useState("");
  const [assignStartDate, setAssignStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [assignEndDate, setAssignEndDate] = useState("");
  const [editingDayNameId, setEditingDayNameId] = useState<string | null>(null);
  const [editingDayNameValue, setEditingDayNameValue] = useState("");
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingSets, setEditingSets] = useState("");
  const [editingReps, setEditingReps] = useState("");
  const [editingRest, setEditingRest] = useState("");
  const [exerciseDetailOpen, setExerciseDetailOpen] = useState(false);
  const [selectedPlanExercise, setSelectedPlanExercise] = useState<PlanExercise | null>(null);
  const [detailSets, setDetailSets] = useState("");
  const [detailReps, setDetailReps] = useState("");
  const [detailRest, setDetailRest] = useState("");
  const [detailNote, setDetailNote] = useState("");
  const [detailName, setDetailName] = useState("");
  const [detailDescription, setDetailDescription] = useState("");

  const addDay = trpc.trainingPlan.addDay.useMutation({
    onError: (err) => toast.error(err.message),
  });
  const deleteExercise = trpc.trainingPlan.deletePlanExercise.useMutation({
    onSuccess: () => router.refresh(),
    onError: (err) => toast.error(err.message),
  });
  const updateDay = trpc.trainingPlan.updateDay.useMutation({
    onSuccess: () => router.refresh(),
    onError: (err) => toast.error(err.message),
  });
  const updatePlanExercise = trpc.trainingPlan.updatePlanExercise.useMutation({
    onSuccess: () => {
      setEditingExerciseId(null);
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
  const updateExercise = trpc.trainingPlan.updateExercise.useMutation({
    onError: (err) => toast.error(err.message),
  });
  const assignPlan = trpc.trainingPlan.assign.useMutation({
    onSuccess: () => {
      setAssignOpen(false);
      setAssignClientId("");
      setAssignEndDate("");
      router.refresh();
    },
    onError: (err) => toast.error(err.message),
  });
  const copyDay = trpc.trainingPlan.copyDay.useMutation({
    onSuccess: () => router.refresh(),
    onError: (err) => toast.error(err.message),
  });
  const reorderExercises = trpc.trainingPlan.reorderExercises.useMutation({
    onSuccess: () => router.refresh(),
    onError: (err) => toast.error(err.message),
  });

  const displayDays: DisplayDay[] = useMemo(() => {
    const merged: DisplayDay[] = [...trainingPlan.days, ...localDays];
    merged.sort((a, b) => a.dayNumber - b.dayNumber);
    return merged;
  }, [trainingPlan.days, localDays]);

  const selectedDay = useMemo(
    () => displayDays.find((d) => (isLocalDay(d) ? d.tempId === selectedDayId : d.id === selectedDayId)),
    [displayDays, selectedDayId]
  );

  const hasUnsavedChanges = localDays.length > 0;

  // Súhrn dňa: počet cvičení + zoznam svalových skupín
  const daySummary = useMemo(() => {
    if (!selectedDay || isLocalDay(selectedDay)) return { count: 0, muscles: [] as string[] };
    const muscles = new Set<string>();
    selectedDay.exercises.forEach((pe) => pe.exercise.muscleGroups.forEach((m) => muscles.add(m)));
    return { count: selectedDay.exercises.length, muscles: Array.from(muscles) };
  }, [selectedDay]);

  function handleAddDay() {
    const maxDay = Math.max(
      0,
      ...trainingPlan.days.map((d) => d.dayNumber),
      ...localDays.map((d) => d.dayNumber)
    );
    const newDay: LocalDay = {
      tempId: `temp-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      dayNumber: maxDay + 1,
      name: null,
      exercises: [],
    };
    setLocalDays((prev) => [...prev, newDay]);
    setSelectedDayId(newDay.tempId);
  }

  async function handleSave() {
    if (localDays.length === 0) return;
    try {
      for (let i = 0; i < localDays.length; i++) {
        await addDay.mutateAsync({ trainingPlanId: trainingPlan.id });
      }
      setLocalDays([]);
      setSelectedDayId(trainingPlan.days[0]?.id ?? null);
      router.refresh();
    } catch {
      // error in onError
    }
  }

  function startEditDayName(day: DisplayDay) {
    if (isLocalDay(day)) return;
    setEditingDayNameId(day.id);
    setEditingDayNameValue(day.name ?? "");
  }

  function saveDayName() {
    if (!editingDayNameId) return;
    updateDay.mutate({ id: editingDayNameId, name: editingDayNameValue.trim() || null });
    setEditingDayNameId(null);
  }

  function startEditExercise(pe: PlanExercise) {
    setEditingExerciseId(pe.id);
    setEditingSets(String(pe.sets));
    setEditingReps(pe.reps);
    setEditingRest(pe.restSeconds != null ? String(pe.restSeconds) : "");
  }

  function saveExercise() {
    if (!editingExerciseId) return;
    const sets = parseInt(editingSets, 10);
    updatePlanExercise.mutate({
      id: editingExerciseId,
      sets: Number.isNaN(sets) ? undefined : sets,
      reps: editingReps.trim() || undefined,
      restSeconds: editingRest.trim() === "" ? null : parseInt(editingRest, 10) ?? null,
    });
  }

  function openExerciseDetail(pe: PlanExercise) {
    setSelectedPlanExercise(pe);
    setDetailSets(String(pe.sets));
    setDetailReps(pe.reps);
    setDetailRest(pe.restSeconds != null ? String(pe.restSeconds) : "");
    setDetailNote(pe.note ?? "");
    setDetailName(pe.exercise.name);
    setDetailDescription(pe.exercise.description ?? "");
    setExerciseDetailOpen(true);
  }

  async function saveExerciseDetail() {
    if (!selectedPlanExercise) return;
    const exerciseChanged =
      detailName.trim() !== selectedPlanExercise.exercise.name ||
      detailDescription !== (selectedPlanExercise.exercise.description ?? "");
    if (exerciseChanged) {
      try {
        await updateExercise.mutateAsync({
          id: selectedPlanExercise.exercise.id,
          name: detailName.trim() || undefined,
          description: detailDescription.trim() || null,
        });
      } catch {
        return;
      }
    }
    const sets = parseInt(detailSets, 10);
    updatePlanExercise.mutate(
      {
        id: selectedPlanExercise.id,
        sets: Number.isNaN(sets) ? undefined : sets,
        reps: detailReps.trim() || undefined,
        restSeconds: detailRest.trim() === "" ? null : parseInt(detailRest, 10) ?? null,
        note: detailNote.trim() || null,
      },
      {
        onSuccess: () => {
          setExerciseDetailOpen(false);
          setSelectedPlanExercise(null);
          router.refresh();
        },
      }
    );
  }

  const selectedPlanDay = selectedDay && !isLocalDay(selectedDay) ? selectedDay : null;

  return (
    <div className="space-y-6">
      <TrainingPlanHeader
        id={trainingPlan.id}
        name={trainingPlan.name}
        description={trainingPlan.description}
        assignmentCount={assignmentCount}
        extraActions={
          <Button size="sm" onClick={() => setAssignOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Priradiť →
          </Button>
        }
      />

      {/* Day tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-2">
        {displayDays.map((day) => (
          <Button
            key={isLocalDay(day) ? day.tempId : day.id}
            variant={selectedDayId === (isLocalDay(day) ? day.tempId : day.id) ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSelectedDayId(isLocalDay(day) ? day.tempId : day.id)}
          >
            {day.name || `Deň ${day.dayNumber}`}
            {isLocalDay(day) && (
              <span className="ml-1 text-xs text-muted-foreground">(neul.)</span>
            )}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={handleAddDay}>
          <Plus className="h-4 w-4" />
          Pridať deň
        </Button>
        {hasUnsavedChanges && (
          <Button size="sm" onClick={handleSave} disabled={addDay.isPending}>
            <Save className="h-4 w-4" />
            Uložiť ({localDays.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Hlavný obsah: vybraný deň */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedDay ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Žiadne dni. Pridaj deň tlačidlom vyššie.</p>
              </CardContent>
            </Card>
          ) : selectedPlanDay?.isRestDay ? (
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-base">
                  {editingDayNameId === selectedPlanDay.id ? (
                    <Input
                      value={editingDayNameValue}
                      onChange={(e) => setEditingDayNameValue(e.target.value)}
                      onBlur={saveDayName}
                      onKeyDown={(e) => e.key === "Enter" && saveDayName()}
                      className="h-8 w-48"
                      autoFocus
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:underline"
                      onClick={() => startEditDayName(selectedPlanDay)}
                    >
                      {selectedPlanDay.name || `Deň ${selectedPlanDay.dayNumber}`}
                    </span>
                  )}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => updateDay.mutate({ id: selectedPlanDay.id, isRestDay: false })}
                  >
                    Zrušiť odpočinok
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          copyDay.mutate({
                            trainingPlanId: trainingPlan.id,
                            sourceDayId: selectedPlanDay.id,
                          })
                        }
                        disabled={copyDay.isPending}
                      >
                        <Copy className="h-4 w-4" />
                        Kopírovať deň
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Odpočinok — žiadne cvičenia.</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2 flex-wrap">
                <CardTitle className="text-base">
                  {selectedPlanDay && editingDayNameId === selectedPlanDay.id ? (
                    <Input
                      value={editingDayNameValue}
                      onChange={(e) => setEditingDayNameValue(e.target.value)}
                      onBlur={saveDayName}
                      onKeyDown={(e) => e.key === "Enter" && saveDayName()}
                      className="h-8 w-48"
                      autoFocus
                    />
                  ) : selectedDay ? (
                    <span
                      className={cn(
                        !isLocalDay(selectedDay) && "cursor-pointer hover:underline"
                      )}
                      onClick={() =>
                        !isLocalDay(selectedDay) && startEditDayName(selectedDay)
                      }
                    >
                      {selectedDay.name || `Deň ${selectedDay.dayNumber}`}
                    </span>
                  ) : null}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {selectedPlanDay && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          updateDay.mutate({ id: selectedPlanDay.id, isRestDay: true })
                        }
                      >
                        Rest deň?
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              copyDay.mutate({
                                trainingPlanId: trainingPlan.id,
                                sourceDayId: selectedPlanDay.id,
                              })
                            }
                            disabled={copyDay.isPending}
                          >
                            <Copy className="h-4 w-4" />
                            Kopírovať deň
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {!isLocalDay(selectedDay) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedDay && setAddExerciseDayId(selectedDay.id)}
                  >
                    <Plus className="h-4 w-4" />
                    Pridať cvičenie
                  </Button>
                )}
                {selectedDay?.exercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {isLocalDay(selectedDay)
                      ? "Ulož plán, potom sem pridáš cvičenia."
                      : "Žiadne cvičenia."}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {selectedDay?.exercises.map((pe, idx) => (
                      <li
                        key={pe.id}
                        className="flex items-center gap-2 py-2 border-b last:border-0 group"
                      >
                        <div className="flex flex-col shrink-0 rounded-md bg-primary/10 p-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-primary/20"
                            disabled={idx === 0 || reorderExercises.isPending}
                            onClick={() => {
                              if (!selectedPlanDay || idx === 0) return;
                              const ids = selectedPlanDay.exercises.map((e) => e.id);
                              [ids[idx - 1], ids[idx]] = [ids[idx], ids[idx - 1]];
                              reorderExercises.mutate({
                                trainingPlanDayId: selectedPlanDay.id,
                                exerciseIds: ids,
                              });
                            }}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 hover:bg-primary/20"
                            disabled={
                              idx === (selectedPlanDay?.exercises.length ?? 0) - 1 ||
                              reorderExercises.isPending
                            }
                            onClick={() => {
                              if (!selectedPlanDay || idx >= selectedPlanDay.exercises.length - 1)
                                return;
                              const ids = selectedPlanDay.exercises.map((e) => e.id);
                              [ids[idx], ids[idx + 1]] = [ids[idx + 1], ids[idx]];
                              reorderExercises.mutate({
                                trainingPlanDayId: selectedPlanDay.id,
                                exerciseIds: ids,
                              });
                            }}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </Button>
                        </div>
                        <button
                          type="button"
                          onClick={() => openExerciseDetail(pe)}
                          className="min-w-0 flex-1 text-left rounded-md hover:bg-muted/50 px-2 py-1 -mx-2 transition-colors"
                        >
                          <p className="font-medium">{capitalizeWords(pe.exercise.name)}</p>
                          {pe.exercise.muscleGroups.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              {pe.exercise.muscleGroups.map(capitalizeWords).join(", ")}
                            </p>
                          )}
                        </button>
                        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {editingExerciseId === pe.id ? (
                            <>
                              <Input
                                type="number"
                                min={1}
                                className="w-14 h-8 text-sm"
                                value={editingSets}
                                onChange={(e) => setEditingSets(e.target.value)}
                              />
                              <span className="text-muted-foreground">×</span>
                              <Input
                                className="w-16 h-8 text-sm"
                                value={editingReps}
                                onChange={(e) => setEditingReps(e.target.value)}
                              />
                              <Input
                                type="number"
                                min={0}
                                className="w-14 h-8 text-sm"
                                placeholder="s"
                                value={editingRest}
                                onChange={(e) => setEditingRest(e.target.value)}
                              />
                              <Button size="sm" onClick={saveExercise}>
                                OK
                              </Button>
                            </>
                          ) : (
                            <>
                              <span
                                className="text-sm text-muted-foreground cursor-pointer hover:underline"
                                onClick={() => startEditExercise(pe)}
                              >
                                {pe.sets}× {pe.reps}
                                {pe.restSeconds != null && ` · ${pe.restSeconds}s`}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => openExerciseDetail(pe)}>
                                    Detail a úprava
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => {
                                      if (confirm("Odstrániť cvičenie?"))
                                        deleteExercise.mutate({ id: pe.id });
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Odstrániť
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Súhrn dňa */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Súhrn dňa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {daySummary.count} {daySummary.count === 1 ? "cvičenie" : "cvičení"}
              </p>
              {daySummary.muscles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {daySummary.muscles.map((m) => (
                    <span
                      key={m}
                      className="text-xs px-2 py-0.5 rounded-md bg-muted"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {addExerciseDayId && (
        <AddExerciseToDayDialog
          open={true}
          onOpenChange={(open) => !open && setAddExerciseDayId(null)}
          trainingPlanDayId={addExerciseDayId}
        />
      )}

      {/* Detail / úprava cvičenia v dni */}
      <Sheet
        open={exerciseDetailOpen}
        onOpenChange={(open) => {
          setExerciseDetailOpen(open);
          if (!open) setSelectedPlanExercise(null);
        }}
      >
        <SheetContent side="right" className="sm:max-w-md flex flex-col">
          {selectedPlanExercise && (
            <>
              <SheetHeader>
                <SheetTitle className="sr-only">Detail cvičenia</SheetTitle>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Názov cvičenia</Label>
                  <Input
                    value={detailName}
                    onChange={(e) => setDetailName(e.target.value)}
                    placeholder="Názov cvičenia"
                    className="font-medium text-base"
                  />
                </div>
                <SheetDescription>
                  {selectedPlanExercise.exercise.muscleGroups.length > 0 && (
                    <span className="block mt-1">
                      {selectedPlanExercise.exercise.muscleGroups.map(capitalizeWords).join(", ")}
                    </span>
                  )}
                  {selectedPlanExercise.exercise.equipment && (
                    <span className="block text-muted-foreground">
                      Vybavenie: {selectedPlanExercise.exercise.equipment}
                    </span>
                  )}
                </SheetDescription>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto px-4 space-y-4 min-h-0">
                {selectedPlanExercise.exercise.videoUrl && (
                  <div className="rounded-lg overflow-hidden bg-muted/30">
                    <img
                      src={selectedPlanExercise.exercise.videoUrl}
                      alt=""
                      className="w-full max-h-48 object-contain"
                    />
                  </div>
                )}
                <div>
                  <Label className="text-sm font-medium mb-1 block">Prevedenie / popis</Label>
                  <textarea
                    value={detailDescription}
                    onChange={(e) => setDetailDescription(e.target.value)}
                    placeholder="Popis prevedenia cvičenia..."
                    rows={5}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <div className="border-t pt-4 space-y-4">
                  <h4 className="text-sm font-medium">Pre tento deň</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Počet sérií</Label>
                      <Input
                        type="number"
                        min={1}
                        value={detailSets}
                        onChange={(e) => setDetailSets(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Opakovania</Label>
                      <Input
                        value={detailReps}
                        onChange={(e) => setDetailReps(e.target.value)}
                        placeholder="10 alebo 8–12"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Odpočinok medzi sériami (s)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={detailRest}
                      onChange={(e) => setDetailRest(e.target.value)}
                      placeholder="60"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Poznámka</Label>
                    <Input
                      value={detailNote}
                      onChange={(e) => setDetailNote(e.target.value)}
                      placeholder="Voliteľná poznámka k cvičeniu"
                    />
                  </div>
                </div>
              </div>
              <SheetFooter className="flex-row gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm("Odstrániť cvičenie z tohto dňa?")) {
                      deleteExercise.mutate(
                        { id: selectedPlanExercise.id },
                        {
                          onSuccess: () => {
                            setExerciseDetailOpen(false);
                            setSelectedPlanExercise(null);
                          },
                        }
                      );
                    }
                  }}
                  disabled={deleteExercise.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                  Odstrániť
                </Button>
                <Button onClick={saveExerciseDetail} disabled={updatePlanExercise.isPending}>
                  {updatePlanExercise.isPending ? "Ukladám..." : "Uložiť zmeny"}
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Assign dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Priradiť plán klientovi</DialogTitle>
            <DialogDescription>Vyber klienta a dátum začiatku.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Klient</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={assignClientId}
                onChange={(e) => setAssignClientId(e.target.value)}
              >
                <option value="">Vyber klienta</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Dátum začiatku</Label>
              <Input
                type="date"
                value={assignStartDate}
                onChange={(e) => setAssignStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Dátum konca (voliteľné)</Label>
              <Input
                type="date"
                value={assignEndDate}
                onChange={(e) => setAssignEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>
              Zrušiť
            </Button>
            <Button
              onClick={() => {
                if (!assignClientId) {
                  toast.error("Vyber klienta");
                  return;
                }
                assignPlan.mutate({
                  trainingPlanId: trainingPlan.id,
                  clientId: assignClientId,
                  startDate: new Date(assignStartDate),
                  endDate: assignEndDate ? new Date(assignEndDate) : undefined,
                });
              }}
              disabled={assignPlan.isPending || !assignClientId}
            >
              Priradiť
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
