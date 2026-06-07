"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { AddExerciseToPlanDialog } from "@/components/client/add-exercise-to-plan-dialog";
import { EditExerciseInPlanDialog } from "@/components/client/edit-exercise-in-plan-dialog";
import { capitalizeWords } from "@/lib/utils";
import { ArrowLeft, PlusCircle, Pencil, Trash2, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

export default function EditClientPlanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [addExerciseDayId, setAddExerciseDayId] = useState<string | null>(null);
  const [deleteDayId, setDeleteDayId] = useState<string | null>(null);
  const [deleteExerciseId, setDeleteExerciseId] = useState<string | null>(null);
  const [expandedExerciseId, setExpandedExerciseId] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  const utils = trpc.useUtils();
  const { data: plan, isLoading } = trpc.clientTrainingPlan.get.useQuery(
    { id },
    { enabled: !!id }
  );
  const updatePlan = trpc.clientTrainingPlan.update.useMutation({
    onSuccess: () => utils.clientTrainingPlan.get.invalidate({ id }),
    onError: (e) => toast.error(e.message),
  });
  const updateDay = trpc.clientTrainingPlan.updateDay.useMutation({
    onSuccess: () => utils.clientTrainingPlan.get.invalidate({ id }),
    onError: (e) => toast.error(e.message),
  });
  const addDay = trpc.clientTrainingPlan.addDay.useMutation({
    onSuccess: () => utils.clientTrainingPlan.get.invalidate({ id }),
    onError: (e) => toast.error(e.message),
  });
  const deleteDay = trpc.clientTrainingPlan.deleteDay.useMutation({
    onSuccess: () => {
      utils.clientTrainingPlan.get.invalidate({ id });
      setDeleteDayId(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteExercise = trpc.clientTrainingPlan.deleteExercise.useMutation({
    onSuccess: () => {
      utils.clientTrainingPlan.get.invalidate({ id });
      setDeleteExerciseId(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const [editingName, setEditingName] = useState(false);
  const [planName, setPlanName] = useState("");
  const [editingDayId, setEditingDayId] = useState<string | null>(null);
  const [dayName, setDayName] = useState("");

  useEffect(() => {
    if (plan) setPlanName(plan.name);
  }, [plan?.id, plan?.name]);

  if (isLoading || !plan) {
    return (
      <div className="space-y-6">
        <PageHeader title="Plán" backHref="/client/workout/my-plans" />
        <EmptyState title="Načítavam plán…" />
      </div>
    );
  }

  const currentPlanName = editingName ? planName : plan.name;
  const editingExercise =
    editingExerciseId != null
      ? plan.days
          .flatMap((d) => d.exercises)
          .find((e) => e.id === editingExerciseId) ?? null
      : null;

  function handleSavePlanName() {
    if (!plan) return;
    const trimmed = planName.trim();
    if (trimmed && trimmed !== plan.name) {
      updatePlan.mutate({ id: plan.id, name: trimmed });
    }
    setEditingName(false);
  }

  function handleSaveDayName(dayId: string) {
    if (!plan) return;
    const day = plan.days.find((d) => d.id === dayId);
    if (!day) return;
    const trimmed = dayName.trim();
    if (trimmed !== (day.name ?? "")) {
      updateDay.mutate({ id: dayId, name: trimmed || null });
    }
    setEditingDayId(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/client/workout/my-plans">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          {editingName ? (
            <div className="flex items-center gap-2">
              <Input
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                onBlur={handleSavePlanName}
                onKeyDown={(e) => e.key === "Enter" && handleSavePlanName()}
                className="text-2xl font-bold h-10 max-w-md"
                autoFocus
              />
              <Button size="sm" onClick={handleSavePlanName}>
                Uložiť
              </Button>
            </div>
          ) : (
            <h1
              className="text-2xl font-bold tracking-tight cursor-pointer hover:opacity-80 flex items-center gap-2"
              onClick={() => setEditingName(true)}
            >
              {currentPlanName}
              <Pencil className="h-4 w-4" />
            </h1>
          )}
          <p className="text-muted-foreground text-sm mt-0.5">
            Pridaj dni a cvičenia. Plán potom použiješ na stránke Tréning.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {plan.days.map((day) => (
          <Card key={day.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 min-w-0">
                  {editingDayId === day.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={dayName}
                        onChange={(e) => setDayName(e.target.value)}
                        onBlur={() => handleSaveDayName(day.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveDayName(day.id);
                        }}
                        className="max-w-[200px]"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => handleSaveDayName(day.id)}>
                        OK
                      </Button>
                    </div>
                  ) : (
                    <CardTitle
                      className="text-base cursor-pointer hover:opacity-80 flex items-center gap-1"
                      onClick={() => {
                        setEditingDayId(day.id);
                        setDayName(day.name ?? `Deň ${day.dayNumber}`);
                      }}
                    >
                      {day.name ? capitalizeWords(day.name) : `Deň ${day.dayNumber}`}
                      <Pencil className="h-3.5 w-3.5" />
                    </CardTitle>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAddExerciseDayId(day.id)}
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Pridať cvičenie
                  </Button>
                  {plan.days.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteDayId(day.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {day.exercises.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Žiadne cvičenia. Klikni „Pridať cvičenie“ a vyber z databázy.
                </p>
              ) : (
                <ul className="space-y-1">
                  {day.exercises.map((ex) => {
                    const isExpanded = expandedExerciseId === ex.id;
                    return (
                      <li
                        key={ex.id}
                        className="border-b border-border/50 last:border-0"
                      >
                        <div className="flex items-center justify-between gap-2 py-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedExerciseId(isExpanded ? null : ex.id)
                            }
                            className="flex-1 text-left text-sm min-w-0 flex items-center gap-2"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 shrink-0" />
                            )}
                            <span className="font-medium truncate">
                              {capitalizeWords(ex.exercise.name)}
                            </span>
                            <span className="text-muted-foreground shrink-0">
                              — {ex.sets} × {ex.reps}
                              {ex.restSeconds != null && ex.restSeconds > 0 && ` · ${ex.restSeconds}s`}
                            </span>
                          </button>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingExerciseId(ex.id);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteExerciseId(ex.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="pl-6 pb-3 space-y-2 text-sm">
                            {(ex.exercise as { videoUrl?: string | null }).videoUrl && (
                              <div className="rounded-lg overflow-hidden border bg-muted/30 max-w-xs">
                                <img
                                  src={(ex.exercise as { videoUrl: string }).videoUrl}
                                  alt={capitalizeWords(ex.exercise.name)}
                                  className="w-full aspect-video object-contain"
                                />
                              </div>
                            )}
                            {(ex.exercise as { description?: string | null }).description && (
                              <div className="rounded-md bg-muted/50 p-2 text-muted-foreground">
                                <p className="font-medium text-foreground mb-1">Prevedenie</p>
                                <p className="whitespace-pre-wrap">
                                  {(ex.exercise as { description?: string | null }).description}
                                </p>
                              </div>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="mt-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingExerciseId(ex.id);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Upraviť série / opakovania
                            </Button>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}

        <Button
          variant="outline"
          onClick={() => addDay.mutate({ clientTrainingPlanId: plan.id })}
          disabled={addDay.isPending}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Pridať deň
        </Button>
      </div>

      <AddExerciseToPlanDialog
        open={addExerciseDayId !== null}
        onOpenChange={(open) => !open && setAddExerciseDayId(null)}
        clientTrainingPlanDayId={addExerciseDayId ?? ""}
        onSuccess={() => {
          utils.clientTrainingPlan.get.invalidate({ id });
          utils.clientTrainingPlan.list.invalidate();
        }}
      />

      <EditExerciseInPlanDialog
        open={editingExercise != null}
        onOpenChange={(open) => !open && setEditingExerciseId(null)}
        exercise={editingExercise}
        onSuccess={() => {
          utils.clientTrainingPlan.get.invalidate({ id });
          utils.clientTrainingPlan.list.invalidate();
          setEditingExerciseId(null);
        }}
      />

      <ConfirmDialog
        open={deleteDayId !== null}
        onOpenChange={(open) => !open && setDeleteDayId(null)}
        title="Zmazať deň?"
        description="Odstrániš tento deň a všetky cvičenia v ňom. Túto akciu nemožno vrátiť."
        confirmLabel="Zmazať"
        variant="destructive"
        onConfirm={() => deleteDayId && deleteDay.mutate({ id: deleteDayId })}
        loading={deleteDay.isPending}
      />

      <ConfirmDialog
        open={deleteExerciseId !== null}
        onOpenChange={(open) => !open && setDeleteExerciseId(null)}
        title="Odstrániť cvičenie z plánu?"
        confirmLabel="Odstrániť"
        variant="destructive"
        onConfirm={() =>
          deleteExerciseId && deleteExercise.mutate({ id: deleteExerciseId })
        }
        loading={deleteExercise.isPending}
      />
    </div>
  );
}