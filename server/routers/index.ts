import { router } from "../trpc";
import { profileRouter } from "./profile";
import { weightRouter } from "./weight";
import { measurementRouter } from "./measurement";
import { foodLogRouter } from "./foodLog";
import { foodRouter } from "./food";
import { workoutLogRouter } from "./workoutLog";
import { mealPlanRouter } from "./mealPlan";
import { mealTemplateRouter } from "./mealTemplate";
import { trainingPlanRouter } from "./trainingPlan";

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
});

export type AppRouter = typeof appRouter;
