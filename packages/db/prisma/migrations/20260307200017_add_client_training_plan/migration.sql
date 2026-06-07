-- CreateTable
CREATE TABLE "client_training_plans" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_training_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_training_plan_days" (
    "id" TEXT NOT NULL,
    "client_training_plan_id" TEXT NOT NULL,
    "day_number" INTEGER NOT NULL,
    "name" TEXT,
    "is_rest_day" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "client_training_plan_days_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_training_plan_exercises" (
    "id" TEXT NOT NULL,
    "client_training_plan_day_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "rest_seconds" INTEGER,
    "note" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "client_training_plan_exercises_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "client_training_plans" ADD CONSTRAINT "client_training_plans_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_training_plan_days" ADD CONSTRAINT "client_training_plan_days_client_training_plan_id_fkey" FOREIGN KEY ("client_training_plan_id") REFERENCES "client_training_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_training_plan_exercises" ADD CONSTRAINT "client_training_plan_exercises_client_training_plan_day_id_fkey" FOREIGN KEY ("client_training_plan_day_id") REFERENCES "client_training_plan_days"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_training_plan_exercises" ADD CONSTRAINT "client_training_plan_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
