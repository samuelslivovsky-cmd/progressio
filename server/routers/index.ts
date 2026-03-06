import { router } from "../trpc";
import { profileRouter } from "./profile";
import { weightRouter } from "./weight";
import { measurementRouter } from "./measurement";
import { foodLogRouter } from "./foodLog";
import { workoutLogRouter } from "./workoutLog";
import { mealPlanRouter } from "./mealPlan";
import { trainingPlanRouter } from "./trainingPlan";

export const appRouter = router({
  profile: profileRouter,
  weight: weightRouter,
  measurement: measurementRouter,
  foodLog: foodLogRouter,
  workoutLog: workoutLogRouter,
  mealPlan: mealPlanRouter,
  trainingPlan: trainingPlanRouter,
});

export type AppRouter = typeof appRouter;
