-- Combined remediation migration (DATA MODEL + JOBS package):
--   DB-1  Float -> Decimal for money/measurement columns
--   DB-2  unique (client_id,date) on analytics_snapshots + (client_id,week_start)
--         on weekly_summaries, with dedup DELETE first (keep newest per group)
--   DB-3  explicit onDelete (CASCADE / SET NULL / RESTRICT) on relations
--   DB-4  new indexes: measurements(profile_id,logged_at),
--         ai_chat_messages(client_id,created_at)
--   API-7 exercises.created_by_id + FK + index (custom-exercise ownership)
-- DropForeignKey
ALTER TABLE "client_trainer" DROP CONSTRAINT "client_trainer_client_id_fkey";

-- DropForeignKey
ALTER TABLE "client_trainer" DROP CONSTRAINT "client_trainer_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "alerts" DROP CONSTRAINT "alerts_client_id_fkey";

-- DropForeignKey
ALTER TABLE "analytics_snapshots" DROP CONSTRAINT "analytics_snapshots_client_id_fkey";

-- DropForeignKey
ALTER TABLE "weekly_summaries" DROP CONSTRAINT "weekly_summaries_client_id_fkey";

-- DropForeignKey
ALTER TABLE "weight_logs" DROP CONSTRAINT "weight_logs_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "measurements" DROP CONSTRAINT "measurements_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "food_logs" DROP CONSTRAINT "food_logs_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "food_log_items" DROP CONSTRAINT "food_log_items_food_log_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_plans" DROP CONSTRAINT "meal_plans_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_plan_days" DROP CONSTRAINT "meal_plan_days_meal_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "meals" DROP CONSTRAINT "meals_meal_plan_day_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_items" DROP CONSTRAINT "meal_items_meal_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_plan_assignments" DROP CONSTRAINT "meal_plan_assignments_client_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_plan_assignments" DROP CONSTRAINT "meal_plan_assignments_meal_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "meal_templates" DROP CONSTRAINT "meal_templates_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "training_plans" DROP CONSTRAINT "training_plans_trainer_id_fkey";

-- DropForeignKey
ALTER TABLE "training_plan_days" DROP CONSTRAINT "training_plan_days_training_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "training_plan_exercises" DROP CONSTRAINT "training_plan_exercises_training_plan_day_id_fkey";

-- DropForeignKey
ALTER TABLE "training_plan_assignments" DROP CONSTRAINT "training_plan_assignments_client_id_fkey";

-- DropForeignKey
ALTER TABLE "training_plan_assignments" DROP CONSTRAINT "training_plan_assignments_training_plan_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_logs" DROP CONSTRAINT "workout_logs_profile_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_log_items" DROP CONSTRAINT "workout_log_items_workout_log_id_fkey";

-- DropForeignKey
ALTER TABLE "workout_sets" DROP CONSTRAINT "workout_sets_workout_log_item_id_fkey";

-- DropForeignKey
ALTER TABLE "ai_chat_messages" DROP CONSTRAINT "ai_chat_messages_client_id_fkey";

-- DropIndex
DROP INDEX "analytics_snapshots_client_id_date_idx";

-- AlterTable
ALTER TABLE "profiles" ALTER COLUMN "goal_weight" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "height" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "weight_logs" ALTER COLUMN "weight" SET DATA TYPE DECIMAL(6,2);

-- AlterTable
ALTER TABLE "measurements" ALTER COLUMN "chest" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "waist" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "hips" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "thigh" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "arm" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "calf" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "neck" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "foods" ALTER COLUMN "calories" SET DATA TYPE DECIMAL(7,2),
ALTER COLUMN "protein" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "carbs" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "fat" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "fiber" SET DATA TYPE DECIMAL(6,2),
ALTER COLUMN "serving_size" SET DATA TYPE DECIMAL(7,2);

-- AlterTable
ALTER TABLE "food_log_items" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(7,2);

-- AlterTable
ALTER TABLE "meal_items" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(7,2);

-- AlterTable
ALTER TABLE "meal_template_items" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(7,2);

-- AlterTable
ALTER TABLE "exercises" ADD COLUMN     "created_by_id" TEXT;

-- AlterTable
ALTER TABLE "workout_sets" ALTER COLUMN "weight_kg" SET DATA TYPE DECIMAL(6,2);

-- DB-2 dedup: keep the newest AnalyticsSnapshot per (client_id, date) before
-- enforcing the unique index. Newest = highest created_at, tiebreak by id.
DELETE FROM "analytics_snapshots" a
USING "analytics_snapshots" b
WHERE a."client_id" = b."client_id"
  AND a."date" = b."date"
  AND (a."created_at" < b."created_at"
       OR (a."created_at" = b."created_at" AND a."id" < b."id"));

-- CreateIndex
CREATE UNIQUE INDEX "analytics_snapshots_client_id_date_key" ON "analytics_snapshots"("client_id", "date");

-- DB-2 dedup: keep the newest WeeklySummary per (client_id, week_start) before
-- enforcing the unique index. Newest = highest created_at, tiebreak by id.
DELETE FROM "weekly_summaries" a
USING "weekly_summaries" b
WHERE a."client_id" = b."client_id"
  AND a."week_start" = b."week_start"
  AND (a."created_at" < b."created_at"
       OR (a."created_at" = b."created_at" AND a."id" < b."id"));

-- CreateIndex
CREATE UNIQUE INDEX "weekly_summaries_client_id_week_start_key" ON "weekly_summaries"("client_id", "week_start");

-- CreateIndex
CREATE INDEX "measurements_profile_id_logged_at_idx" ON "measurements"("profile_id", "logged_at");

-- CreateIndex
CREATE INDEX "exercises_created_by_id_idx" ON "exercises"("created_by_id");

-- CreateIndex
CREATE INDEX "ai_chat_messages_client_id_created_at_idx" ON "ai_chat_messages"("client_id", "created_at");

-- AddForeignKey
ALTER TABLE "client_trainer" ADD CONSTRAINT "client_trainer_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_trainer" ADD CONSTRAINT "client_trainer_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_summaries" ADD CONSTRAINT "weekly_summaries_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_logs" ADD CONSTRAINT "weight_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_logs" ADD CONSTRAINT "food_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_log_items" ADD CONSTRAINT "food_log_items_food_log_id_fkey" FOREIGN KEY ("food_log_id") REFERENCES "food_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plans" ADD CONSTRAINT "meal_plans_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_days" ADD CONSTRAINT "meal_plan_days_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meals" ADD CONSTRAINT "meals_meal_plan_day_id_fkey" FOREIGN KEY ("meal_plan_day_id") REFERENCES "meal_plan_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_items" ADD CONSTRAINT "meal_items_meal_id_fkey" FOREIGN KEY ("meal_id") REFERENCES "meals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_assignments" ADD CONSTRAINT "meal_plan_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_plan_assignments" ADD CONSTRAINT "meal_plan_assignments_meal_plan_id_fkey" FOREIGN KEY ("meal_plan_id") REFERENCES "meal_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meal_templates" ADD CONSTRAINT "meal_templates_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plans" ADD CONSTRAINT "training_plans_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plan_days" ADD CONSTRAINT "training_plan_days_training_plan_id_fkey" FOREIGN KEY ("training_plan_id") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plan_exercises" ADD CONSTRAINT "training_plan_exercises_training_plan_day_id_fkey" FOREIGN KEY ("training_plan_day_id") REFERENCES "training_plan_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plan_assignments" ADD CONSTRAINT "training_plan_assignments_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_plan_assignments" ADD CONSTRAINT "training_plan_assignments_training_plan_id_fkey" FOREIGN KEY ("training_plan_id") REFERENCES "training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_logs" ADD CONSTRAINT "workout_logs_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_log_items" ADD CONSTRAINT "workout_log_items_workout_log_id_fkey" FOREIGN KEY ("workout_log_id") REFERENCES "workout_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_sets" ADD CONSTRAINT "workout_sets_workout_log_item_id_fkey" FOREIGN KEY ("workout_log_item_id") REFERENCES "workout_log_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_chat_messages" ADD CONSTRAINT "ai_chat_messages_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

