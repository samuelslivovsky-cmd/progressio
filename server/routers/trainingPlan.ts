import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, trainerProcedure, protectedProcedure } from "../trpc";
import { searchExercises } from "@/lib/exercisedb";

export const trainingPlanRouter = router({
  list: trainerProcedure.query(({ ctx }) =>
    ctx.prisma.trainingPlan.findMany({
      where: { trainerId: ctx.profile.id },
      orderBy: { createdAt: "desc" },
    })
  ),

  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.trainingPlan.findUnique({
        where: { id: input.id },
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: {
              exercises: {
                orderBy: { order: "asc" },
                include: { exercise: true },
              },
            },
          },
        },
      })
    ),

  create: trainerProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        dayCount: z.number().int().min(2).max(6).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { dayCount, ...rest } = input;
      const plan = await ctx.prisma.trainingPlan.create({
        data: { trainerId: ctx.profile.id, ...rest },
      });
      if (dayCount && dayCount > 0) {
        await ctx.prisma.trainingPlanDay.createMany({
          data: Array.from({ length: dayCount }, (_, i) => ({
            trainingPlanId: plan.id,
            dayNumber: i + 1,
          })),
        });
      }
      return plan;
    }),

  update: trainerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.trainingPlan.findFirst({
        where: { id: input.id, trainerId: ctx.profile.id },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.prisma.trainingPlan.update({
        where: { id: input.id },
        data: { name: input.name, description: input.description },
      });
    }),

  updateDay: trainerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        isRestDay: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const day = await ctx.prisma.trainingPlanDay.findFirst({
        where: { id: input.id },
        include: { trainingPlan: true },
      });
      if (!day || day.trainingPlan.trainerId !== ctx.profile.id)
        throw new TRPCError({ code: "NOT_FOUND" });
      const data: { name?: string; isRestDay?: boolean } = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.isRestDay !== undefined) data.isRestDay = input.isRestDay;
      return ctx.prisma.trainingPlanDay.update({
        where: { id: input.id },
        data,
      });
    }),

  updatePlanExercise: trainerProcedure
    .input(
      z.object({
        id: z.string(),
        sets: z.number().int().min(1).optional(),
        reps: z.string().optional(),
        restSeconds: z.number().int().min(0).nullable().optional(),
        note: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const pe = await ctx.prisma.trainingPlanExercise.findFirst({
        where: { id: input.id },
        include: { trainingPlanDay: { include: { trainingPlan: true } } },
      });
      if (!pe || pe.trainingPlanDay.trainingPlan.trainerId !== ctx.profile.id)
        throw new TRPCError({ code: "NOT_FOUND" });
      const { id, ...data } = input;
      return ctx.prisma.trainingPlanExercise.update({
        where: { id },
        data: data as { sets?: number; reps?: string; restSeconds?: number | null; note?: string | null },
      });
    }),

  reorderExercises: trainerProcedure
    .input(
      z.object({
        trainingPlanDayId: z.string(),
        exerciseIds: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const day = await ctx.prisma.trainingPlanDay.findFirst({
        where: { id: input.trainingPlanDayId },
        include: { trainingPlan: true },
      });
      if (!day || day.trainingPlan.trainerId !== ctx.profile.id)
        throw new TRPCError({ code: "NOT_FOUND" });
      await Promise.all(
        input.exerciseIds.map((id, index) =>
          ctx.prisma.trainingPlanExercise.updateMany({
            where: { id, trainingPlanDayId: input.trainingPlanDayId },
            data: { order: index },
          })
        )
      );
      return { ok: true };
    }),

  copyDay: trainerProcedure
    .input(
      z.object({
        trainingPlanId: z.string(),
        sourceDayId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.trainingPlan.findFirst({
        where: { id: input.trainingPlanId, trainerId: ctx.profile.id },
        include: {
          days: { orderBy: { dayNumber: "desc" }, take: 1 },
        },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      const source = await ctx.prisma.trainingPlanDay.findFirst({
        where: { id: input.sourceDayId, trainingPlanId: input.trainingPlanId },
        include: { exercises: { orderBy: { order: "asc" } } },
      });
      if (!source) throw new TRPCError({ code: "NOT_FOUND" });
      const nextNum = (plan.days[0]?.dayNumber ?? 0) + 1;
      const newDay = await ctx.prisma.trainingPlanDay.create({
        data: {
          trainingPlanId: input.trainingPlanId,
          dayNumber: nextNum,
          name: source.name ? `${source.name} (kópia)` : null,
          isRestDay: source.isRestDay,
        },
      });
      if (source.exercises.length > 0) {
        await ctx.prisma.trainingPlanExercise.createMany({
          data: source.exercises.map((e, i) => ({
            trainingPlanDayId: newDay.id,
            exerciseId: e.exerciseId,
            sets: e.sets,
            reps: e.reps,
            restSeconds: e.restSeconds,
            note: e.note,
            order: i,
          })),
        });
      }
      return newDay;
    }),

  addDay: trainerProcedure
    .input(z.object({ trainingPlanId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.trainingPlan.findFirst({
        where: { id: input.trainingPlanId, trainerId: ctx.profile.id },
        include: { days: { orderBy: { dayNumber: "desc" }, take: 1 } },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      const nextDay = (plan.days[0]?.dayNumber ?? 0) + 1;
      return ctx.prisma.trainingPlanDay.create({
        data: { trainingPlanId: input.trainingPlanId, dayNumber: nextDay },
      });
    }),

  searchExternalExercises: trainerProcedure
    .input(z.object({ q: z.string(), limit: z.number().min(1).max(25).optional() }))
    .query(async ({ input }) => {
      return searchExercises(input.q, input.limit ?? 15, 0);
    }),

  getOrCreateExerciseFromApi: trainerProcedure
    .input(
      z.object({
        exerciseId: z.string(),
        name: z.string().min(1),
        gifUrl: z.string().optional(),
        targetMuscles: z.array(z.string()),
        secondaryMuscles: z.array(z.string()).optional(),
        equipments: z.array(z.string()).optional(),
        instructions: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const muscleGroups = [
        ...input.targetMuscles,
        ...(input.secondaryMuscles ?? []),
      ].filter(Boolean);
      const description =
        input.instructions?.length ? input.instructions.join("\n") : null;
      const equipment =
        input.equipments?.length ? input.equipments.join(", ") : null;

      const existing = await ctx.prisma.exercise.findFirst({
        where: { externalId: input.exerciseId },
      });
      if (existing) return existing;

      return ctx.prisma.exercise.create({
        data: {
          externalId: input.exerciseId,
          name: input.name,
          description,
          muscleGroups: muscleGroups.length ? muscleGroups : ["other"],
          equipment,
          videoUrl: input.gifUrl ?? null,
        },
      });
    }),

  addExerciseToDay: trainerProcedure
    .input(
      z.object({
        trainingPlanDayId: z.string(),
        exerciseId: z.string(),
        sets: z.number().int().min(1),
        reps: z.string().min(1),
        restSeconds: z.number().int().min(0).optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const day = await ctx.prisma.trainingPlanDay.findFirst({
        where: { id: input.trainingPlanDayId },
        include: {
          trainingPlan: true,
          exercises: { orderBy: { order: "desc" }, take: 1 },
        },
      });
      if (!day || day.trainingPlan.trainerId !== ctx.profile.id)
        throw new TRPCError({ code: "NOT_FOUND" });
      const order = (day.exercises[0]?.order ?? 0) + 1;
      return ctx.prisma.trainingPlanExercise.create({
        data: {
          trainingPlanDayId: input.trainingPlanDayId,
          exerciseId: input.exerciseId,
          sets: input.sets,
          reps: input.reps,
          restSeconds: input.restSeconds ?? null,
          note: input.note ?? null,
          order,
        },
        include: { exercise: true },
      });
    }),

  updateExercise: trainerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.prisma.exercise.update({
        where: { id },
        data: data as { name?: string; description?: string | null },
      });
    }),

  deletePlanExercise: trainerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const pe = await ctx.prisma.trainingPlanExercise.findFirst({
        where: { id: input.id },
        include: { trainingPlanDay: { include: { trainingPlan: true } } },
      });
      if (!pe || pe.trainingPlanDay.trainingPlan.trainerId !== ctx.profile.id)
        throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.prisma.trainingPlanExercise.delete({ where: { id: input.id } });
    }),

  assign: trainerProcedure
    .input(
      z.object({
        clientId: z.string(),
        trainingPlanId: z.string(),
        startDate: z.date(),
        endDate: z.date().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.trainingPlanAssignment.create({ data: input })
    ),

  myAssigned: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.trainingPlanAssignment.findMany({
      where: { clientId: ctx.profile.id },
      include: {
        trainingPlan: {
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: {
                exercises: { orderBy: { order: "asc" }, include: { exercise: true } },
              },
            },
          },
        },
      },
    })
  ),
});
