"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// apps/web/server/jobs/worker.ts
var import_bullmq2 = require("bullmq");

// apps/web/server/jobs/connection.ts
var import_ioredis = __toESM(require("ioredis"));
var BULLMQ_REDIS_OPTIONS = {
  // Required by BullMQ for blocking commands.
  maxRetriesPerRequest: null
};
function createBullConnection() {
  const url = process.env.REDIS_URL;
  if (!url) {
    throw new Error("Missing REDIS_URL for BullMQ connection.");
  }
  return new import_ioredis.default(url, BULLMQ_REDIS_OPTIONS);
}

// apps/web/server/jobs/queue.ts
var import_bullmq = require("bullmq");
var ANALYTICS_QUEUE_NAME = "analytics";
var AI_SUMMARY_QUEUE_NAME = "ai-summaries";
var JOB_NIGHTLY_ANALYTICS = "nightly-analytics";
var JOB_WEEKLY_SUMMARIES = "weekly-summaries";
var analyticsQueue = new import_bullmq.Queue(
  ANALYTICS_QUEUE_NAME,
  { connection: createBullConnection() }
);
var aiSummaryQueue = new import_bullmq.Queue(
  AI_SUMMARY_QUEUE_NAME,
  { connection: createBullConnection() }
);

// apps/web/server/jobs/processors/analytics.ts
var import_db2 = require("@progressio/db");

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/constants.js
var daysInYear = 365.2425;
var maxTime = Math.pow(10, 8) * 24 * 60 * 60 * 1e3;
var minTime = -maxTime;
var millisecondsInDay = 864e5;
var secondsInHour = 3600;
var secondsInDay = secondsInHour * 24;
var secondsInWeek = secondsInDay * 7;
var secondsInYear = secondsInDay * daysInYear;
var secondsInMonth = secondsInYear / 12;
var secondsInQuarter = secondsInMonth * 3;
var constructFromSymbol = /* @__PURE__ */ Symbol.for("constructDateFrom");

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/constructFrom.js
function constructFrom(date, value) {
  if (typeof date === "function") return date(value);
  if (date && typeof date === "object" && constructFromSymbol in date)
    return date[constructFromSymbol](value);
  if (date instanceof Date) return new date.constructor(value);
  return new Date(value);
}

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/toDate.js
function toDate(argument, context) {
  return constructFrom(context || argument, argument);
}

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/addDays.js
function addDays(date, amount, options) {
  const _date = toDate(date, options?.in);
  if (isNaN(amount)) return constructFrom(options?.in || date, NaN);
  if (!amount) return _date;
  _date.setDate(_date.getDate() + amount);
  return _date;
}

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/_lib/defaultOptions.js
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/startOfWeek.js
function startOfWeek(date, options) {
  const defaultOptions2 = getDefaultOptions();
  const weekStartsOn = options?.weekStartsOn ?? options?.locale?.options?.weekStartsOn ?? defaultOptions2.weekStartsOn ?? defaultOptions2.locale?.options?.weekStartsOn ?? 0;
  const _date = toDate(date, options?.in);
  const day = _date.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  _date.setDate(_date.getDate() - diff);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/_lib/getTimezoneOffsetInMilliseconds.js
function getTimezoneOffsetInMilliseconds(date) {
  const _date = toDate(date);
  const utcDate = new Date(
    Date.UTC(
      _date.getFullYear(),
      _date.getMonth(),
      _date.getDate(),
      _date.getHours(),
      _date.getMinutes(),
      _date.getSeconds(),
      _date.getMilliseconds()
    )
  );
  utcDate.setUTCFullYear(_date.getFullYear());
  return +date - +utcDate;
}

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/_lib/normalizeDates.js
function normalizeDates(context, ...dates) {
  const normalize = constructFrom.bind(
    null,
    context || dates.find((date) => typeof date === "object")
  );
  return dates.map(normalize);
}

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/startOfDay.js
function startOfDay(date, options) {
  const _date = toDate(date, options?.in);
  _date.setHours(0, 0, 0, 0);
  return _date;
}

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/differenceInCalendarDays.js
function differenceInCalendarDays(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate
  );
  const laterStartOfDay = startOfDay(laterDate_);
  const earlierStartOfDay = startOfDay(earlierDate_);
  const laterTimestamp = +laterStartOfDay - getTimezoneOffsetInMilliseconds(laterStartOfDay);
  const earlierTimestamp = +earlierStartOfDay - getTimezoneOffsetInMilliseconds(earlierStartOfDay);
  return Math.round((laterTimestamp - earlierTimestamp) / millisecondsInDay);
}

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/differenceInDays.js
function differenceInDays(laterDate, earlierDate, options) {
  const [laterDate_, earlierDate_] = normalizeDates(
    options?.in,
    laterDate,
    earlierDate
  );
  const sign = compareLocalAsc(laterDate_, earlierDate_);
  const difference = Math.abs(
    differenceInCalendarDays(laterDate_, earlierDate_)
  );
  laterDate_.setDate(laterDate_.getDate() - sign * difference);
  const isLastDayNotFull = Number(
    compareLocalAsc(laterDate_, earlierDate_) === -sign
  );
  const result = sign * (difference - isLastDayNotFull);
  return result === 0 ? 0 : result;
}
function compareLocalAsc(laterDate, earlierDate) {
  const diff = laterDate.getFullYear() - earlierDate.getFullYear() || laterDate.getMonth() - earlierDate.getMonth() || laterDate.getDate() - earlierDate.getDate() || laterDate.getHours() - earlierDate.getHours() || laterDate.getMinutes() - earlierDate.getMinutes() || laterDate.getSeconds() - earlierDate.getSeconds() || laterDate.getMilliseconds() - earlierDate.getMilliseconds();
  if (diff < 0) return -1;
  if (diff > 0) return 1;
  return diff;
}

// node_modules/.pnpm/date-fns@4.4.0/node_modules/date-fns/subDays.js
function subDays(date, amount, options) {
  return addDays(date, -amount, options);
}

// apps/web/lib/analytics.ts
var import_db = require("@progressio/db");
async function getDaysSinceLastActivity(prisma3, clientId) {
  const [lastFood, lastWorkout, lastWeight] = await Promise.all([
    prisma3.foodLog.findFirst({
      where: { profileId: clientId },
      orderBy: { date: "desc" },
      select: { date: true }
    }),
    prisma3.workoutLog.findFirst({
      where: { profileId: clientId },
      orderBy: { date: "desc" },
      select: { date: true }
    }),
    prisma3.weightLog.findFirst({
      where: { profileId: clientId },
      orderBy: { loggedAt: "desc" },
      select: { loggedAt: true }
    })
  ]);
  const dates = [
    lastFood?.date,
    lastWorkout?.date,
    lastWeight?.loggedAt
  ].filter((d) => d != null);
  if (dates.length === 0) return 999;
  const last = new Date(Math.max(...dates.map((d) => d.getTime())));
  return differenceInDays(startOfDay(/* @__PURE__ */ new Date()), startOfDay(last));
}
async function getStreakDays(prisma3, clientId) {
  const today = startOfDay(/* @__PURE__ */ new Date());
  const from = subDays(today, 365);
  const [foodDates, workoutDates] = await Promise.all([
    prisma3.foodLog.findMany({
      where: { profileId: clientId, date: { gte: from, lt: today } },
      select: { date: true },
      distinct: ["date"]
    }),
    prisma3.workoutLog.findMany({
      where: { profileId: clientId, date: { gte: from, lt: today } },
      select: { date: true },
      distinct: ["date"]
    })
  ]);
  const activeDays = /* @__PURE__ */ new Set();
  for (const f of foodDates) activeDays.add(startOfDay(f.date).toISOString());
  for (const w of workoutDates) activeDays.add(startOfDay(w.date).toISOString());
  let streak = 0;
  for (let d = 1; d <= 365; d++) {
    const day = subDays(today, d);
    if (activeDays.has(day.toISOString())) streak++;
    else break;
  }
  return streak;
}
async function getWorkoutAdherence(prisma3, clientId, days = 14) {
  const planEnd = await prisma3.trainingPlanAssignment.findFirst({
    where: { clientId },
    orderBy: { startDate: "desc" },
    include: {
      trainingPlan: {
        include: {
          days: true
        }
      }
    }
  });
  const from = subDays(startOfDay(/* @__PURE__ */ new Date()), days);
  const plannedWorkouts = planEnd ? planEnd.trainingPlan.days.filter((d) => !d.isRestDay).length : 0;
  const weeks = days / 7;
  const planned = plannedWorkouts * weeks;
  if (planned <= 0) return 50;
  const completed = await prisma3.workoutLog.count({
    where: { profileId: clientId, date: { gte: from } }
  });
  return Math.min(100, Math.round(completed / planned * 100));
}
async function getMealAdherence(prisma3, clientId, days = 14) {
  const from = subDays(startOfDay(/* @__PURE__ */ new Date()), days);
  const logs = await prisma3.foodLog.findMany({
    where: { profileId: clientId, date: { gte: from } },
    select: { date: true },
    distinct: ["date"]
  });
  return Math.min(100, Math.round(logs.length / days * 100));
}
async function getDropOffScore(prisma3, clientId) {
  const [workoutAdh, mealAdh, daysInactive, streak] = await Promise.all([
    getWorkoutAdherence(prisma3, clientId, 14),
    getMealAdherence(prisma3, clientId, 14),
    getDaysSinceLastActivity(prisma3, clientId),
    getStreakDays(prisma3, clientId)
  ]);
  return computeDropOffScore(workoutAdh, mealAdh, daysInactive, streak);
}
function computeDropOffScore(workoutAdh, mealAdh, daysInactive, streak) {
  const adherenceRisk = 100 - workoutAdh;
  const daysRisk = Math.min(100, daysInactive * 15);
  const loggingRisk = 100 - mealAdh;
  const streakRisk = Math.max(0, 100 - streak * 5);
  const progressRisk = 50;
  const score = adherenceRisk * 0.3 + daysRisk * 0.25 + loggingRisk * 0.2 + progressRisk * 0.15 + streakRisk * 0.1;
  return Math.round(Math.min(100, Math.max(0, score)));
}
async function detectPlateau(prisma3, clientId, precomputedAdherence21) {
  const from = subDays(startOfDay(/* @__PURE__ */ new Date()), 21);
  const weights = await prisma3.weightLog.findMany({
    where: { profileId: clientId, loggedAt: { gte: from } },
    orderBy: { loggedAt: "asc" },
    select: { weight: true }
  });
  if (weights.length < 7) return { detected: false };
  const minW = Math.min(...weights.map((w) => w.weight));
  const maxW = Math.max(...weights.map((w) => w.weight));
  const rangeKg = maxW - minW;
  const adherence = precomputedAdherence21 ?? await getWorkoutAdherence(prisma3, clientId, 21);
  if (rangeKg < 0.5 && adherence >= 70) {
    return {
      detected: true,
      rangeKg,
      message: `V\xE1ha stabiln\xE1 \xB1${rangeKg.toFixed(1)} kg za 21 dn\xED pri dobrej adherencii. Zv\xE1\u017Ete \xFApravu kal\xF3ri\xED alebo tr\xE9ningu.`
    };
  }
  return { detected: false };
}
async function detectSkippedExercises(prisma3, clientId) {
  const assignment = await prisma3.trainingPlanAssignment.findFirst({
    where: { clientId },
    orderBy: { startDate: "desc" },
    include: {
      trainingPlan: {
        include: {
          days: {
            include: {
              exercises: { include: { exercise: true } }
            }
          }
        }
      }
    }
  });
  if (!assignment) return [];
  const planExerciseIds = /* @__PURE__ */ new Set();
  const planExerciseNames = {};
  for (const day of assignment.trainingPlan.days) {
    for (const ex of day.exercises) {
      planExerciseIds.add(ex.exerciseId);
      planExerciseNames[ex.exerciseId] = ex.exercise.name;
    }
  }
  if (planExerciseIds.size === 0) return [];
  const lastThree = await prisma3.workoutLog.findMany({
    where: { profileId: clientId },
    orderBy: { date: "desc" },
    take: 3,
    include: {
      items: { select: { exerciseId: true } }
    }
  });
  const exercisedInLastThree = /* @__PURE__ */ new Set();
  for (const log of lastThree) {
    for (const item of log.items) {
      exercisedInLastThree.add(item.exerciseId);
    }
  }
  const skipped = [];
  for (const eid of planExerciseIds) {
    if (!exercisedInLastThree.has(eid)) {
      skipped.push({
        exerciseId: eid,
        exerciseName: planExerciseNames[eid] ?? "?",
        message: `Cvi\u010Denie "${planExerciseNames[eid]}" ch\xFDba v posledn\xFDch 3 tr\xE9ningoch.`
      });
    }
  }
  return skipped;
}
async function generateAlerts(prisma3, clientId) {
  const link = await prisma3.clientTrainer.findFirst({
    where: { clientId },
    select: { trainerId: true }
  });
  if (!link) return [];
  const alerts = [];
  const trainerId = link.trainerId;
  const [daysInactive, workoutAdh14, workoutAdh21, mealAdh, streak, skipped] = await Promise.all([
    getDaysSinceLastActivity(prisma3, clientId),
    getWorkoutAdherence(prisma3, clientId, 14),
    getWorkoutAdherence(prisma3, clientId, 21),
    getMealAdherence(prisma3, clientId, 14),
    getStreakDays(prisma3, clientId),
    detectSkippedExercises(prisma3, clientId)
  ]);
  const plateau = await detectPlateau(prisma3, clientId, workoutAdh21);
  const dropOff = computeDropOffScore(workoutAdh14, mealAdh, daysInactive, streak);
  if (daysInactive >= 7) {
    alerts.push({
      trainerId,
      clientId,
      type: import_db.AlertType.INACTIVE,
      severity: "high",
      message: `\u017Diadna aktivita ${daysInactive} dn\xED. Odpor\xFA\u010Dame kontaktova\u0165 klienta.`
    });
  } else if (daysInactive >= 5) {
    alerts.push({
      trainerId,
      clientId,
      type: import_db.AlertType.INACTIVE,
      severity: "medium",
      message: `\u017Diadna aktivita ${daysInactive} dn\xED.`
    });
  } else if (daysInactive >= 3) {
    alerts.push({
      trainerId,
      clientId,
      type: import_db.AlertType.INACTIVE,
      severity: "low",
      message: `\u017Diadna aktivita ${daysInactive} dn\xED.`
    });
  }
  if (dropOff >= 61) {
    alerts.push({
      trainerId,
      clientId,
      type: import_db.AlertType.DROP_OFF_RISK,
      severity: "high",
      message: `Vysok\xE9 riziko odpadnutia (sk\xF3re ${dropOff}). Odpor\xFA\u010Dame motiva\u010Dn\xFA spr\xE1vu alebo \xFApravu pl\xE1nu.`
    });
  } else if (dropOff >= 31) {
    alerts.push({
      trainerId,
      clientId,
      type: import_db.AlertType.DROP_OFF_RISK,
      severity: "medium",
      message: `Stredn\xE9 riziko odpadnutia (sk\xF3re ${dropOff}).`
    });
  }
  if (plateau.detected && plateau.message) {
    alerts.push({
      trainerId,
      clientId,
      type: import_db.AlertType.PLATEAU,
      severity: "medium",
      message: plateau.message
    });
  }
  if (workoutAdh14 < 60) {
    alerts.push({
      trainerId,
      clientId,
      type: import_db.AlertType.LOW_ADHERENCE,
      severity: workoutAdh14 < 40 ? "high" : "medium",
      message: `N\xEDzka tr\xE9ningov\xE1 adherencia za 2 t\xFD\u017Edne: ${workoutAdh14}%.`
    });
  }
  for (const s of skipped) {
    alerts.push({
      trainerId,
      clientId,
      type: import_db.AlertType.SKIPPED_EXERCISE,
      severity: "medium",
      message: s.message
    });
  }
  const existing = await prisma3.alert.findMany({
    where: { clientId, resolved: false },
    select: { type: true }
  });
  const existingTypes = new Set(existing.map((e) => e.type));
  const newAlerts = alerts.filter((a) => !existingTypes.has(a.type));
  if (newAlerts.length > 0) {
    await prisma3.alert.createMany({
      data: newAlerts.map((a) => ({
        trainerId: a.trainerId,
        clientId: a.clientId,
        type: a.type,
        severity: a.severity,
        message: a.message
      }))
    });
  }
  return alerts;
}

// apps/web/server/jobs/processors/analytics.ts
async function processNightlyAnalytics(job) {
  const today = startOfDay(/* @__PURE__ */ new Date());
  const clients = await import_db2.prisma.profile.findMany({
    where: { role: import_db2.Role.CLIENT },
    select: { id: true }
  });
  console.log(
    `[analytics] job ${job.id} firedAt=${job.data.firedAt} \u2014 processing ${clients.length} clients`
  );
  let processed = 0;
  let failed = 0;
  for (const { id: clientId } of clients) {
    try {
      const [trainingAdherence, calorieAdherence, dropOffScore] = await Promise.all([
        getWorkoutAdherence(import_db2.prisma, clientId, 14),
        getMealAdherence(import_db2.prisma, clientId, 14),
        getDropOffScore(import_db2.prisma, clientId)
      ]);
      const adherenceScore = Math.round((trainingAdherence + calorieAdherence) / 2);
      const existing = await import_db2.prisma.analyticsSnapshot.findFirst({
        where: { clientId, date: today },
        select: { id: true }
      });
      const data = {
        adherenceScore,
        calorieAdherence,
        trainingAdherence,
        dropOffScore
      };
      if (existing) {
        await import_db2.prisma.analyticsSnapshot.update({ where: { id: existing.id }, data });
      } else {
        await import_db2.prisma.analyticsSnapshot.create({
          data: { clientId, date: today, ...data }
        });
      }
      await generateAlerts(import_db2.prisma, clientId);
      processed++;
    } catch (err) {
      failed++;
      console.error(`[analytics] client ${clientId} failed:`, err);
    }
  }
  console.log(`[analytics] job ${job.id} done \u2014 processed=${processed} failed=${failed}`);
  return { processed, failed };
}

// apps/web/server/jobs/processors/ai-summary.ts
var import_db3 = require("@progressio/db");
async function processWeeklySummaries(job) {
  const weekStart = startOfWeek(startOfDay(/* @__PURE__ */ new Date()), { weekStartsOn: 1 });
  const from = subDays(startOfDay(/* @__PURE__ */ new Date()), 7);
  const clients = await import_db3.prisma.profile.findMany({
    where: { role: import_db3.Role.CLIENT },
    select: { id: true, name: true }
  });
  console.log(
    `[ai-summary] job ${job.id} firedAt=${job.data.firedAt} \u2014 processing ${clients.length} clients`
  );
  let processed = 0;
  let failed = 0;
  for (const { id: clientId, name } of clients) {
    try {
      const [trainingAdherence, mealAdherence, foodItems, weights, workoutsCompleted] = await Promise.all([
        getWorkoutAdherence(import_db3.prisma, clientId, 7),
        getMealAdherence(import_db3.prisma, clientId, 7),
        // FoodLog has no kcal column; calories are derived from each linked
        // Food (per servingSize) scaled by the logged amount.
        import_db3.prisma.foodLogItem.findMany({
          where: { foodLog: { profileId: clientId, date: { gte: from } } },
          select: {
            amount: true,
            food: { select: { calories: true, servingSize: true } }
          }
        }),
        import_db3.prisma.weightLog.findMany({
          where: { profileId: clientId, loggedAt: { gte: from } },
          orderBy: { loggedAt: "asc" },
          select: { weight: true }
        }),
        import_db3.prisma.workoutLog.count({
          where: { profileId: clientId, date: { gte: from } }
        })
      ]);
      const totalKcal = foodItems.reduce((sum, item) => {
        if (!item.food || item.food.servingSize <= 0) return sum;
        return sum + item.food.calories * item.amount / item.food.servingSize;
      }, 0);
      const avgKcal = foodItems.length > 0 ? Math.round(totalKcal / 7) : 0;
      const firstWeight = weights[0]?.weight ?? null;
      const lastWeight = weights.length > 0 ? weights[weights.length - 1].weight : null;
      const weightDelta = firstWeight != null && lastWeight != null ? Math.round((lastWeight - firstWeight) * 10) / 10 : null;
      const adherence = Math.round((trainingAdherence + mealAdherence) / 2);
      const highlights = {
        adherence,
        avgKcal,
        weightDelta,
        workoutsCompleted
      };
      const content = [
        `# T\xFD\u017Edenn\xE9 zhrnutie \u2014 ${name}`,
        "",
        `- Adherencia: **${adherence}%** (tr\xE9ning ${trainingAdherence}%, strava ${mealAdherence}%)`,
        `- Priemern\xFD denn\xFD pr\xEDjem: **${avgKcal} kcal**`,
        `- Dokon\u010Den\xE9 tr\xE9ningy: **${workoutsCompleted}**`,
        weightDelta != null ? `- Zmena v\xE1hy: **${weightDelta >= 0 ? "+" : ""}${weightDelta} kg**` : `- Zmena v\xE1hy: nedostatok z\xE1znamov`,
        "",
        "_AI text generation pending \u2014 placeholder generated from logged data._"
      ].join("\n");
      const existing = await import_db3.prisma.weeklySummary.findFirst({
        where: { clientId, weekStart },
        select: { id: true }
      });
      if (existing) {
        await import_db3.prisma.weeklySummary.update({
          where: { id: existing.id },
          data: { content, highlights }
        });
      } else {
        await import_db3.prisma.weeklySummary.create({
          data: { clientId, weekStart, content, highlights }
        });
      }
      processed++;
    } catch (err) {
      failed++;
      console.error(`[ai-summary] client ${clientId} failed:`, err);
    }
  }
  console.log(`[ai-summary] job ${job.id} done \u2014 processed=${processed} failed=${failed}`);
  return { processed, failed };
}

// apps/web/server/jobs/scheduler.ts
var import_meta = {};
var NIGHTLY_ANALYTICS_CRON = "0 2 * * *";
var WEEKLY_SUMMARIES_CRON = "0 6 * * 1";
var NIGHTLY_ANALYTICS_JOB_ID = "repeat:nightly-analytics";
var WEEKLY_SUMMARIES_JOB_ID = "repeat:weekly-summaries";
async function registerRepeatableJobs() {
  await analyticsQueue.add(
    JOB_NIGHTLY_ANALYTICS,
    { firedAt: (/* @__PURE__ */ new Date()).toISOString() },
    {
      jobId: NIGHTLY_ANALYTICS_JOB_ID,
      repeat: { pattern: NIGHTLY_ANALYTICS_CRON },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 100 }
    }
  );
  await aiSummaryQueue.add(
    JOB_WEEKLY_SUMMARIES,
    { firedAt: (/* @__PURE__ */ new Date()).toISOString() },
    {
      jobId: WEEKLY_SUMMARIES_JOB_ID,
      repeat: { pattern: WEEKLY_SUMMARIES_CRON },
      removeOnComplete: { count: 50 },
      removeOnFail: { count: 100 }
    }
  );
  console.log(
    `[scheduler] registered repeatables \u2014 analytics "${NIGHTLY_ANALYTICS_CRON}", ai-summaries "${WEEKLY_SUMMARIES_CRON}"`
  );
}
if (process.argv[1] && import_meta.url === `file://${process.argv[1]}`) {
  registerRepeatableJobs().then(() => {
    console.log("[scheduler] done");
    process.exit(0);
  }).catch((err) => {
    console.error("[scheduler] failed", err);
    process.exit(1);
  });
}

// apps/web/server/jobs/worker.ts
var analyticsWorker = new import_bullmq2.Worker(
  ANALYTICS_QUEUE_NAME,
  (job) => processNightlyAnalytics(job),
  { connection: createBullConnection() }
);
var aiSummaryWorker = new import_bullmq2.Worker(
  AI_SUMMARY_QUEUE_NAME,
  (job) => processWeeklySummaries(job),
  { connection: createBullConnection() }
);
for (const worker of [analyticsWorker, aiSummaryWorker]) {
  worker.on("completed", (job) => {
    console.log(`[worker] ${worker.name} job ${job.id} (${job.name}) completed`);
  });
  worker.on("failed", (job, err) => {
    console.error(`[worker] ${worker.name} job ${job?.id} (${job?.name}) failed:`, err);
  });
  worker.on("error", (err) => {
    console.error(`[worker] ${worker.name} error:`, err);
  });
}
registerRepeatableJobs().catch((err) => {
  console.error("[worker] failed to register repeatable jobs:", err);
});
console.log(
  `[worker] started \u2014 listening on "${ANALYTICS_QUEUE_NAME}" and "${AI_SUMMARY_QUEUE_NAME}"`
);
async function shutdown(signal) {
  console.log(`[worker] ${signal} received \u2014 closing workers`);
  await Promise.all([analyticsWorker.close(), aiSummaryWorker.close()]);
  process.exit(0);
}
process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
//# sourceMappingURL=worker.cjs.map
