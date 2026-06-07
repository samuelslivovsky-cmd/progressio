import { router } from "../trpc";
import { aiRouter } from "./ai";
import { analyticsRouter } from "./analytics";
import { profileRouter } from "./profile";
import { weightRouter } from "./weight";
import { measurementRouter } from "./measurement";
import { foodLogRouter } from "./foodLog";
import { foodRouter } from "./food";
import { workoutLogRouter } from "./workoutLog";
import { mealPlanRouter } from "./mealPlan";
import { mealTemplateRouter } from "./mealTemplate";
import { trainingPlanRouter } from "./trainingPlan";
import { clientTrainingPlanRouter } from "./clientTrainingPlan";

export const appRouter = router({
  profile: profileRouter,
  weight: weightRouter,
  measurement: measurementRouter,
  foodLog: foodLogRouter,
  food: foodRouter,
  workoutLog: workoutLogRouter,
  mealPlan: mealPlanRouter,
  mealTemplate: mealTemplateRouter,
  trainingPlan: trainingPlanRouter,
  clientTrainingPlan: clientTrainingPlanRouter,
  analytics: analyticsRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
