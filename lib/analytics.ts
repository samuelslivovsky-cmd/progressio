import type { PrismaClient } from "@prisma/client";
import { AlertType } from "@prisma/client";
import { startOfDay, subDays, differenceInDays } from "date-fns";

/** Lineárna regresia: y = slope * x + intercept (x = dni od začiatku). */
export function linearRegression(points: { x: number; y: number }[]): {
  slope: number;
  intercept: number;
} {
  if (points.length < 2) return { slope: 0, intercept: points[0]?.y ?? 0 };
  const n = points.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumX2 = 0;
  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumX2 += p.x * p.x;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX) || 0;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}

/** Počet dní od poslednej aktivity (food, workout alebo weight). */
export async function getDaysSinceLastActivity(
  prisma: PrismaClient,
  clientId: string,
): Promise<number> {
  const [lastFood, lastWorkout, lastWeight] = await Promise.all([
    prisma.foodLog.findFirst({
      where: { profileId: clientId },
      orderBy: { date: "desc" },
      select: { date: true },
    }),
    prisma.workoutLog.findFirst({
      where: { profileId: clientId },
      orderBy: { date: "desc" },
      select: { date: true },
    }),
    prisma.weightLog.findFirst({
      where: { profileId: clientId },
      orderBy: { loggedAt: "desc" },
      select: { loggedAt: true },
    }),
  ]);
  const dates = [
    lastFood?.date,
    lastWorkout?.date,
    lastWeight?.loggedAt,
  ].filter((d): d is Date => d != null);
  if (dates.length === 0) return 999;
  const last = new Date(Math.max(...dates.map((d) => d.getTime())));
  return differenceInDays(startOfDay(new Date()), startOfDay(last));
}

/** Streak: počet po sebe idúcich dní s aspoň jednou aktivitou (dozadu od včera). */
export async function getStreakDays(
  prisma: PrismaClient,
  clientId: string,
): Promise<number> {
  const today = startOfDay(new Date());
  let streak = 0;
  for (let d = 1; d <= 365; d++) {
    const day = subDays(today, d);
    const dayEnd = subDays(today, d - 1);
    const [food, workout] = await Promise.all([
      prisma.foodLog.findFirst({
        where: { profileId: clientId, date: day },
        select: { id: true },
      }),
      prisma.workoutLog.findFirst({
        where: { profileId: clientId, date: day },
        select: { id: true },
      }),
    ]);
    if (food || workout) streak++;
    else break;
  }
  return streak;
}

/** Tréningová adherencia za posledných N dní: completed / planned * 100. Ak nemá plán, vráti 50. */
export async function getWorkoutAdherence(
  prisma: PrismaClient,
  clientId: string,
  days: number = 14,
): Promise<number> {
  const planEnd = await prisma.trainingPlanAssignment.findFirst({
    where: { clientId },
    orderBy: { startDate: "desc" },
    include: {
      trainingPlan: {
        include: {
          days: true,
        },
      },
    },
  });
  const from = subDays(startOfDay(new Date()), days);
  const plannedWorkouts = planEnd
    ? planEnd.trainingPlan.days.filter((d) => !d.isRestDay).length
    : 0;
  const weeks = days / 7;
  const planned = plannedWorkouts * weeks;
  if (planned <= 0) return 50;

  const completed = await prisma.workoutLog.count({
    where: { profileId: clientId, date: { gte: from } },
  });
  return Math.min(100, Math.round((completed / planned) * 100));
}

/** Strava / meal adherencia: percento dní s aspoň jedným food logom za N dní. */
export async function getMealAdherence(
  prisma: PrismaClient,
  clientId: string,
  days: number = 14,
): Promise<number> {
  const from = subDays(startOfDay(new Date()), days);
  const logs = await prisma.foodLog.findMany({
    where: { profileId: clientId, date: { gte: from } },
    select: { date: true },
    distinct: ["date"],
  });
  return Math.min(100, Math.round((logs.length / days) * 100));
}

/** Posledných 7 dní: pre každý deň (0 = dnes) či mal klient food log a workout log. */
export async function getLast7DaysActivity(
  prisma: PrismaClient,
  clientId: string,
): Promise<{ foodDays: boolean[]; workoutDays: boolean[] }> {
  const today = startOfDay(new Date());
  const foodDays: boolean[] = [];
  const workoutDays: boolean[] = [];
  for (let i = 0; i < 7; i++) {
    const day = subDays(today, i);
    const [food, workout] = await Promise.all([
      prisma.foodLog.findFirst({
        where: { profileId: clientId, date: day },
        select: { id: true },
      }),
      prisma.workoutLog.findFirst({
        where: { profileId: clientId, date: day },
        select: { id: true },
      }),
    ]);
    foodDays.push(!!food);
    workoutDays.push(!!workout);
  }
  return { foodDays, workoutDays };
}

/** Drop-off risk 0–100: kompozit z adherencie, dní neaktivity, streaku. */
export async function getDropOffScore(
  prisma: PrismaClient,
  clientId: string,
): Promise<number> {
  const [workoutAdh, mealAdh, daysInactive, streak] = await Promise.all([
    getWorkoutAdherence(prisma, clientId, 14),
    getMealAdherence(prisma, clientId, 14),
    getDaysSinceLastActivity(prisma, clientId),
    getStreakDays(prisma, clientId),
  ]);
  const adherenceRisk = 100 - workoutAdh;
  const daysRisk = Math.min(100, daysInactive * 15);
  const loggingRisk = 100 - mealAdh;
  const streakRisk = Math.max(0, 100 - streak * 5);
  const progressRisk = 50;
  const score =
    adherenceRisk * 0.3 +
    daysRisk * 0.25 +
    loggingRisk * 0.2 +
    progressRisk * 0.15 +
    streakRisk * 0.1;
  return Math.round(Math.min(100, Math.max(0, score)));
}

/** Plateau: váha v rozsahu &lt; 0.5 kg za 21 dní a adherencia &gt; 70%. */
export async function detectPlateau(
  prisma: PrismaClient,
  clientId: string,
): Promise<{ detected: boolean; rangeKg?: number; message?: string }> {
  const from = subDays(startOfDay(new Date()), 21);
  const weights = await prisma.weightLog.findMany({
    where: { profileId: clientId, loggedAt: { gte: from } },
    orderBy: { loggedAt: "asc" },
    select: { weight: true },
  });
  if (weights.length < 7) return { detected: false };
  const minW = Math.min(...weights.map((w) => w.weight));
  const maxW = Math.max(...weights.map((w) => w.weight));
  const rangeKg = maxW - minW;
  const adherence = await getWorkoutAdherence(prisma, clientId, 21);
  if (rangeKg < 0.5 && adherence >= 70) {
    return {
      detected: true,
      rangeKg,
      message: `Váha stabilná ±${rangeKg.toFixed(1)} kg za 21 dní pri dobrej adherencii. Zvážte úpravu kalórií alebo tréningu.`,
    };
  }
  return { detected: false };
}

/** Cvičenia z plánu, ktoré chýbajú v posledných 3 workout logoch. */
export async function detectSkippedExercises(
  prisma: PrismaClient,
  clientId: string,
): Promise<{ exerciseId: string; exerciseName: string; message: string }[]> {
  const assignment = await prisma.trainingPlanAssignment.findFirst({
    where: { clientId },
    orderBy: { startDate: "desc" },
    include: {
      trainingPlan: {
        include: {
          days: {
            include: {
              exercises: { include: { exercise: true } },
            },
          },
        },
      },
    },
  });
  if (!assignment) return [];

  const planExerciseIds = new Set<string>();
  const planExerciseNames: Record<string, string> = {};
  for (const day of assignment.trainingPlan.days) {
    for (const ex of day.exercises) {
      planExerciseIds.add(ex.exerciseId);
      planExerciseNames[ex.exerciseId] = ex.exercise.name;
    }
  }
  if (planExerciseIds.size === 0) return [];

  const lastThree = await prisma.workoutLog.findMany({
    where: { profileId: clientId },
    orderBy: { date: "desc" },
    take: 3,
    include: {
      items: { select: { exerciseId: true } },
    },
  });
  const exercisedInLastThree = new Set<string>();
  for (const log of lastThree) {
    for (const item of log.items) {
      exercisedInLastThree.add(item.exerciseId);
    }
  }

  const skipped: {
    exerciseId: string;
    exerciseName: string;
    message: string;
  }[] = [];
  for (const eid of planExerciseIds) {
    if (!exercisedInLastThree.has(eid)) {
      skipped.push({
        exerciseId: eid,
        exerciseName: planExerciseNames[eid] ?? "?",
        message: `Cvičenie "${planExerciseNames[eid]}" chýba v posledných 3 tréningoch.`,
      });
    }
  }
  return skipped;
}

/** Predikcia dátumu dosiahnutia cieľovej váhy (lineárna regresia 28 dní). */
export async function predictGoalDate(
  prisma: PrismaClient,
  clientId: string,
): Promise<{
  trendKgPerWeek: number;
  weeksToGoal: number | null;
  estimatedDate: Date | null;
  currentWeight: number | null;
  goalWeight: number | null;
  message: string;
}> {
  const profile = await prisma.profile.findUnique({
    where: { id: clientId },
    select: { goalWeight: true },
  });
  const from = subDays(new Date(), 28);
  const logs = await prisma.weightLog.findMany({
    where: { profileId: clientId, loggedAt: { gte: from } },
    orderBy: { loggedAt: "asc" },
    select: { weight: true, loggedAt: true },
  });
  const goal = profile?.goalWeight ?? null;
  if (logs.length < 5) {
    return {
      trendKgPerWeek: 0,
      weeksToGoal: null,
      estimatedDate: null,
      currentWeight: logs[logs.length - 1]?.weight ?? null,
      goalWeight: goal,
      message: "Potrebných viac záznamov váhy na predikciu.",
    };
  }
  const startT = logs[0].loggedAt.getTime();
  const points = logs.map((l) => ({
    x: (l.loggedAt.getTime() - startT) / (7 * 24 * 60 * 60 * 1000),
    y: l.weight,
  }));
  const { slope } = linearRegression(points);
  const currentWeight = logs[logs.length - 1]!.weight;
  const trendKgPerWeek = slope;

  if (goal == null) {
    return {
      trendKgPerWeek,
      weeksToGoal: null,
      estimatedDate: null,
      currentWeight,
      goalWeight: null,
      message: `Trend ${trendKgPerWeek >= 0 ? "+" : ""}${trendKgPerWeek.toFixed(2)} kg/týždeň. Nastavte cieľovú váhu pre odhad dátumu.`,
    };
  }

  const diff = currentWeight - goal;
  if (Math.abs(diff) < 0.1) {
    return {
      trendKgPerWeek,
      weeksToGoal: 0,
      estimatedDate: new Date(),
      currentWeight,
      goalWeight: goal,
      message: "Cieľová váha takmer dosiahnutá.",
    };
  }
  if (Math.abs(trendKgPerWeek) < 0.01) {
    return {
      trendKgPerWeek,
      weeksToGoal: null,
      estimatedDate: null,
      currentWeight,
      goalWeight: goal,
      message: "Trend váhy je príliš malý na odhad dátumu.",
    };
  }
  const weeksToGoal = diff / trendKgPerWeek;
  if (weeksToGoal < 0) {
    return {
      trendKgPerWeek,
      weeksToGoal: null,
      estimatedDate: null,
      currentWeight,
      goalWeight: goal,
      message: "Váha sa pohybuje opačným smerom k cieľu.",
    };
  }
  const estimatedDate = new Date();
  estimatedDate.setDate(estimatedDate.getDate() + Math.round(weeksToGoal * 7));
  return {
    trendKgPerWeek,
    weeksToGoal,
    estimatedDate,
    currentWeight,
    goalWeight: goal,
    message: `Odhad dosiahnutia cieľa: ${estimatedDate.toLocaleDateString("sk-SK")} (${trendKgPerWeek.toFixed(2)} kg/týždeň).`,
  };
}

export type AlertInput = {
  trainerId: string;
  clientId: string;
  type: AlertType;
  severity: string;
  message: string;
};

/** Vygeneruje alerty pre klienta a uloží ich do DB. */
export async function generateAlerts(
  prisma: PrismaClient,
  clientId: string,
): Promise<AlertInput[]> {
  const link = await prisma.clientTrainer.findFirst({
    where: { clientId },
    select: { trainerId: true },
  });
  if (!link) return [];

  const alerts: AlertInput[] = [];
  const trainerId = link.trainerId;

  const daysInactive = await getDaysSinceLastActivity(prisma, clientId);
  if (daysInactive >= 7) {
    alerts.push({
      trainerId,
      clientId,
      type: AlertType.INACTIVE,
      severity: "high",
      message: `Žiadna aktivita ${daysInactive} dní. Odporúčame kontaktovať klienta.`,
    });
  } else if (daysInactive >= 5) {
    alerts.push({
      trainerId,
      clientId,
      type: AlertType.INACTIVE,
      severity: "medium",
      message: `Žiadna aktivita ${daysInactive} dní.`,
    });
  } else if (daysInactive >= 3) {
    alerts.push({
      trainerId,
      clientId,
      type: AlertType.INACTIVE,
      severity: "low",
      message: `Žiadna aktivita ${daysInactive} dní.`,
    });
  }

  const dropOff = await getDropOffScore(prisma, clientId);
  if (dropOff >= 61) {
    alerts.push({
      trainerId,
      clientId,
      type: AlertType.DROP_OFF_RISK,
      severity: "high",
      message: `Vysoké riziko odpadnutia (skóre ${dropOff}). Odporúčame motivačnú správu alebo úpravu plánu.`,
    });
  } else if (dropOff >= 31) {
    alerts.push({
      trainerId,
      clientId,
      type: AlertType.DROP_OFF_RISK,
      severity: "medium",
      message: `Stredné riziko odpadnutia (skóre ${dropOff}).`,
    });
  }

  const plateau = await detectPlateau(prisma, clientId);
  if (plateau.detected && plateau.message) {
    alerts.push({
      trainerId,
      clientId,
      type: AlertType.PLATEAU,
      severity: "medium",
      message: plateau.message,
    });
  }

  const workoutAdh = await getWorkoutAdherence(prisma, clientId, 14);
  if (workoutAdh < 60) {
    alerts.push({
      trainerId,
      clientId,
      type: AlertType.LOW_ADHERENCE,
      severity: workoutAdh < 40 ? "high" : "medium",
      message: `Nízka tréningová adherencia za 2 týždne: ${workoutAdh}%.`,
    });
  }

  const skipped = await detectSkippedExercises(prisma, clientId);
  for (const s of skipped) {
    alerts.push({
      trainerId,
      clientId,
      type: AlertType.SKIPPED_EXERCISE,
      severity: "medium",
      message: s.message,
    });
  }

  const existing = await prisma.alert.findMany({
    where: { clientId, resolved: false },
    select: { type: true },
  });
  const existingTypes = new Set(existing.map((e) => e.type));

  for (const a of alerts) {
    if (existingTypes.has(a.type)) continue;
    await prisma.alert.create({
      data: {
        trainerId: a.trainerId,
        clientId: a.clientId,
        type: a.type,
        severity: a.severity,
        message: a.message,
      },
    });
    existingTypes.add(a.type);
  }
  return alerts;
}
