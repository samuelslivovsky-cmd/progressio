-- DropForeignKey
ALTER TABLE "food_log_items" DROP CONSTRAINT "food_log_items_food_id_fkey";

-- AlterTable
ALTER TABLE "food_log_items" ADD COLUMN     "custom_name" TEXT,
ALTER COLUMN "food_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "alerts_trainer_id_resolved_idx" ON "alerts"("trainer_id", "resolved");

-- CreateIndex
CREATE INDEX "alerts_client_id_resolved_idx" ON "alerts"("client_id", "resolved");

-- CreateIndex
CREATE INDEX "analytics_snapshots_client_id_date_idx" ON "analytics_snapshots"("client_id", "date");

-- CreateIndex
CREATE INDEX "food_log_items_food_log_id_idx" ON "food_log_items"("food_log_id");

-- CreateIndex
CREATE INDEX "meal_items_meal_id_idx" ON "meal_items"("meal_id");

-- CreateIndex
CREATE INDEX "meal_plan_days_meal_plan_id_idx" ON "meal_plan_days"("meal_plan_id");

-- CreateIndex
CREATE INDEX "meals_meal_plan_day_id_idx" ON "meals"("meal_plan_day_id");

-- CreateIndex
CREATE INDEX "training_plan_days_training_plan_id_idx" ON "training_plan_days"("training_plan_id");

-- CreateIndex
CREATE INDEX "training_plan_exercises_training_plan_day_id_idx" ON "training_plan_exercises"("training_plan_day_id");

-- CreateIndex
CREATE INDEX "weight_logs_profile_id_logged_at_idx" ON "weight_logs"("profile_id", "logged_at");

-- CreateIndex
CREATE INDEX "workout_log_items_workout_log_id_idx" ON "workout_log_items"("workout_log_id");

-- CreateIndex
CREATE INDEX "workout_logs_profile_id_date_idx" ON "workout_logs"("profile_id", "date");

-- CreateIndex
CREATE INDEX "workout_sets_workout_log_item_id_idx" ON "workout_sets"("workout_log_item_id");

-- AddForeignKey
ALTER TABLE "food_log_items" ADD CONSTRAINT "food_log_items_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
