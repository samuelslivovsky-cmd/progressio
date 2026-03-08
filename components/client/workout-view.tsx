"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dumbbell, Play, ChevronLeft, Check, PlusCircle, Pencil, Timer, SkipForward } from "lucide-react";
import { capitalizeWords } from "@/lib/utils";

type RestTimerState = {
  secondsLeft: number;
  totalSeconds: number;
  label?: string;
};

type Exercise = { id: string; name: string };
type PlanExercise = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string;
  restSeconds: number | null;
  order: number;
  exercise: Exercise;
};
export type PlanDay = {
  id: string;
  dayNumber: number;
  name: string | null;
  isRestDay: boolean;
  exercises: PlanExercise[];
};
type TrainingPlan = {
  id: string;
  name: string;
  days: PlanDay[];
};
type Assignment = {
  id: string;
  startDate: Date;
  endDate: Date | null;
  trainingPlan: TrainingPlan;
};
type ClientPlan = {
  id: string;
  name: string;
  description: string | null;
  days: PlanDay[];
};

const DEFAULT_REST_SECONDS = 90;

export function WorkoutView() {
  const [sessionDay, setSessionDay] = useState<PlanDay | null>(null);
  const [setValues, setSetValues] = useState<
    Record<string, Record<number, { reps?: number; weightKg?: number }>>
  >({});
  const [durationMin, setDurationMin] = useState<number | "">("");
  const [restTimer, setRestTimer] = useState<RestTimerState | null>(null);
  const restIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!restTimer || restTimer.secondsLeft <= 0) {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
      if (restTimer?.secondsLeft === 0) {
        toast.success("Odpočinok skončil.");
        setRestTimer(null);
      }
      return;
    }
    restIntervalRef.current = setInterval(() => {
      setRestTimer((prev) => {
        if (!prev || prev.secondsLeft <= 0) return null;
        return { ...prev, secondsLeft: prev.secondsLeft - 1 };
      });
    }, 1000);
    return () => {
      if (restIntervalRef.current) clearInterval(restIntervalRef.current);
    };
  }, [restTimer?.secondsLeft]);

  const today = format(new Date(), "yyyy-MM-dd");
  const utils = trpc.useUtils();
  const { data: assignments = [], isLoading } = trpc.trainingPlan.myAssigned.useQuery();
  const { data: myPlans = [] } = trpc.clientTrainingPlan.list.useQuery();
  const { data: todayLog } = trpc.workoutLog.byDate.useQuery({ date: today });
  const { data: recentLogs = [] } = trpc.workoutLog.list.useQuery({ limit: 5 });
  const completeMutation = trpc.workoutLog.complete.useMutation({
    onSuccess: () => {
      utils.workoutLog.byDate.invalidate({ date: format(new Date(), "yyyy-MM-dd") });
      utils.workoutLog.list.invalidate();
      setSessionDay(null);
      setSetValues({});
      setDurationMin("");
      toast.success("Tréning uložený.");
    },
    onError: (e) => toast.error(e.message),
  });

  const currentAssignment = assignments[0] as Assignment | undefined;
  const plan = currentAssignment?.trainingPlan;
  const trainerDays = plan?.days ?? [];
  const clientPlans = myPlans as ClientPlan[];

  const getSetValue = (exerciseId: string, setIndex: number) =>
    setValues[exerciseId]?.[setIndex] ?? {};
  const setSetValue = (
    exerciseId: string,
    setIndex: number,
    field: "reps" | "weightKg",
    value: number | ""
  ) => {
    setSetValues((prev) => ({
      ...prev,
      [exerciseId]: {
        ...(prev[exerciseId] ?? {}),
        [setIndex]: {
          ...(prev[exerciseId]?.[setIndex] ?? {}),
          [field]: value === "" ? undefined : value,
        },
      },
    }));
  };

  const handleComplete = () => {
    if (!sessionDay) return;
    const date = format(new Date(), "yyyy-MM-dd");
    const items = sessionDay.exercises.map((pe) => {
      const numSets = pe.sets;
      const sets = Array.from({ length: numSets }, (_, i) => {
        const v = getSetValue(pe.exerciseId, i);
        return {
          reps: v.reps,
          weightKg: v.weightKg,
        };
      });
      return { exerciseId: pe.exerciseId, sets };
    });
    completeMutation.mutate({
      date,
      name: sessionDay.name ?? `Deň ${sessionDay.dayNumber}`,
      durationMin: durationMin === "" ? undefined : Number(durationMin),
      items,
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Načítavam plán…
        </CardContent>
      </Card>
    );
  }

  const hasTrainerDays = trainerDays.filter((d) => !d.isRestDay && d.exercises.length > 0).length > 0;
  const hasClientPlans = clientPlans.some((p) =>
    p.days.some((d) => !d.isRestDay && d.exercises.length > 0)
  );
  if (!hasTrainerDays && !hasClientPlans) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <Dumbbell className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">Nemáš žiadny tréningový plán</p>
          <p className="text-sm mt-1">
            Tréner ti môže priradiť plán, alebo si vytvor vlastný.
          </p>
          <Link href="/client/workout/my-plans">
            <Button className="mt-4 inline-flex items-center gap-2">
              <PlusCircle className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Vytvoriť vlastný plán</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const startRestTimer = (seconds: number, label?: string) => {
    setRestTimer({ secondsLeft: seconds, totalSeconds: seconds, label });
  };

  if (sessionDay) {
    return (
      <div className="space-y-6">
        {/* Rest timer bar */}
        {restTimer && (
          <Card className="border-primary bg-primary/10">
            <CardContent className="py-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Timer className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  Odpočinok{restTimer.label ? ` · ${restTimer.label}` : ""}
                </span>
                <span className="text-2xl font-mono tabular-nums">
                  {Math.floor(restTimer.secondsLeft / 60)}:
                  {(restTimer.secondsLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRestTimer(null);
                    toast.info("Odpočinok ukončený.");
                  }}
                >
                  <SkipForward className="h-4 w-4 mr-1" />
                  Ukončiť
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSessionDay(null);
              setSetValues({});
              setRestTimer(null);
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {sessionDay.name ? capitalizeWords(sessionDay.name) : `Deň ${sessionDay.dayNumber}`}
          </h2>
        </div>

        <div className="space-y-4">
          {sessionDay.exercises.map((pe) => {
            const restSeconds = pe.restSeconds ?? DEFAULT_REST_SECONDS;
            return (
              <Card key={pe.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{capitalizeWords(pe.exercise.name)}</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startRestTimer(restSeconds, pe.exercise.name)}
                      disabled={!!restTimer}
                    >
                      <Timer className="h-3.5 w-3.5 mr-1.5" />
                      Odpočinok {restSeconds}s
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {pe.sets} × {pe.reps}
                    {pe.restSeconds != null && pe.restSeconds > 0 && ` · odpočinok ${pe.restSeconds}s`}
                  </p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-[auto_1fr_1fr] gap-2 text-xs text-muted-foreground items-center">
                    <span className="w-8">Séria</span>
                    <Label className="text-muted-foreground">Opak.</Label>
                    <Label className="text-muted-foreground">Váha (kg)</Label>
                  </div>
                  {Array.from({ length: pe.sets }, (_, i) => (
                    <div key={i} className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center">
                      <span className="text-sm font-medium w-8">{i + 1}.</span>
                      <Input
                        type="number"
                        min={0}
                        placeholder="—"
                        value={getSetValue(pe.exerciseId, i).reps ?? ""}
                        onChange={(e) =>
                          setSetValue(
                            pe.exerciseId,
                            i,
                            "reps",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                      />
                      <Input
                        type="number"
                        min={0}
                        step={0.5}
                        placeholder="—"
                        value={getSetValue(pe.exerciseId, i).weightKg ?? ""}
                        onChange={(e) =>
                          setSetValue(
                            pe.exerciseId,
                            i,
                            "weightKg",
                            e.target.value === "" ? "" : Number(e.target.value)
                          )
                        }
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="duration">Trvanie (min)</Label>
            <Input
              id="duration"
              type="number"
              min={0}
              className="w-20"
              value={durationMin}
              onChange={(e) =>
                setDurationMin(e.target.value === "" ? "" : Number(e.target.value))
              }
            />
          </div>
          <Button
            onClick={handleComplete}
            disabled={completeMutation.isPending}
          >
            <Check className="h-4 w-4 mr-2" />
            Dokončiť tréning
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {todayLog && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Dnešný záznam</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {todayLog.name ?? "Tréning"} · {todayLog.items.length} cvičení
              {todayLog.durationMin != null && ` · ${todayLog.durationMin} min`}
            </p>
          </CardContent>
        </Card>
      )}
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">
          Vyber deň a začni tréning. Po dokončení záznam uložíš jedným klikom.
        </p>

        {hasTrainerDays && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Trénerov plán</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {trainerDays
                .filter((d) => !d.isRestDay && d.exercises.length > 0)
                .map((day) => (
                  <Card key={day.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-base">
                        {day.name ? capitalizeWords(day.name) : `Deň ${day.dayNumber}`}
                      </CardTitle>
                      <Button size="sm" onClick={() => setSessionDay(day)}>
                        <Play className="h-4 w-4 mr-1" />
                        Začať tréning
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {day.exercises.slice(0, 4).map((e) => (
                          <li key={e.id}>{capitalizeWords(e.exercise.name)}</li>
                        ))}
                        {day.exercises.length > 4 && (
                          <li>+{day.exercises.length - 4} ďalších</li>
                        )}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Moje plány</h3>
            <Link href="/client/workout/my-plans">
              <Button variant="outline" size="sm" className="inline-flex items-center gap-1.5">
                <PlusCircle className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">
                  {clientPlans.length > 0 ? "Nový plán" : "Vytvoriť vlastný plán"}
                </span>
              </Button>
            </Link>
          </div>
          {clientPlans.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">
              Nemáš vlastný plán. Vytvor si ho a pridaj dni s cvičeniami.
            </p>
          ) : (
            <div className="space-y-4">
              {clientPlans.map((clientPlan) => (
                <div key={clientPlan.id}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium">{clientPlan.name}</span>
                    <Link
                      href={`/client/workout/my-plans/${clientPlan.id}`}
                      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7")}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {clientPlan.days
                      .filter((d) => !d.isRestDay && d.exercises.length > 0)
                      .map((day) => (
                        <Card key={day.id}>
                          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-base">
                              {day.name ? capitalizeWords(day.name) : `Deň ${day.dayNumber}`}
                            </CardTitle>
                            <Button size="sm" onClick={() => setSessionDay(day)}>
                              <Play className="h-4 w-4 mr-1" />
                              Začať tréning
                            </Button>
                          </CardHeader>
                          <CardContent>
                            <ul className="text-sm text-muted-foreground list-disc list-inside">
                              {day.exercises.slice(0, 4).map((e) => (
                                <li key={e.id}>{capitalizeWords(e.exercise.name)}</li>
                              ))}
                              {day.exercises.length > 4 && (
                                <li>+{day.exercises.length - 4} ďalších</li>
                              )}
                            </ul>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {recentLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Posledné tréningy</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {recentLogs.map((log) => (
                <li key={log.id}>
                  {format(new Date(log.date), "d. M. yyyy")} — {log.name ?? "Tréning"} ·{" "}
                  {log.items.length} cv.
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
