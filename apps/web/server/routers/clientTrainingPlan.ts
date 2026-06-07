import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";

export const clientTrainingPlanRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.clientTrainingPlan.findMany({
      where: { profileId: ctx.profile.id },
      orderBy: { createdAt: "desc" },
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

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.prisma.clientTrainingPlan.findFirst({
        where: { id: input.id, profileId: ctx.profile.id },
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
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      return plan;
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        dayCount: z.number().int().min(1).max(7).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.clientTrainingPlan.create({
        data: {
          profileId: ctx.profile.id,
          name: input.name,
          description: input.description ?? null,
        },
      });
      const count = input.dayCount ?? 1;
      if (count > 0) {
        await ctx.prisma.clientTrainingPlanDay.createMany({
          data: Array.from({ length: count }, (_, i) => ({
            clientTrainingPlanId: plan.id,
            dayNumber: i + 1,
          })),
        });
      }
      return plan;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.clientTrainingPlan.findFirst({
        where: { id: input.id, profileId: ctx.profile.id },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      const { id, ...data } = input;
      return ctx.prisma.clientTrainingPlan.update({
        where: { id },
        data: data as { name?: string; description?: string | null },
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.clientTrainingPlan.findFirst({
        where: { id: input.id, profileId: ctx.profile.id },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.prisma.clientTrainingPlan.delete({ where: { id: input.id } });
    }),

  addDay: protectedProcedure
    .input(z.object({ clientTrainingPlanId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.clientTrainingPlan.findFirst({
        where: { id: input.clientTrainingPlanId, profileId: ctx.profile.id },
        include: { days: { orderBy: { dayNumber: "desc" }, take: 1 } },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      const nextNum = (plan.days[0]?.dayNumber ?? 0) + 1;
      return ctx.prisma.clientTrainingPlanDay.create({
        data: {
          clientTrainingPlanId: input.clientTrainingPlanId,
          dayNumber: nextNum,
        },
      });
    }),

  updateDay: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().nullable().optional(),
        isRestDay: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const day = await ctx.prisma.clientTrainingPlanDay.findFirst({
        where: { id: input.id },
        include: { clientTrainingPlan: true },
      });
      if (!day || day.clientTrainingPlan.profileId !== ctx.profile.id)
        throw new TRPCError({ code: "NOT_FOUND" });
      const { id, ...data } = input;
      return ctx.prisma.clientTrainingPlanDay.update({
        where: { id },
        data: data as { name?: string | null; isRestDay?: boolean },
      });
    }),

  deleteDay: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const day = await ctx.prisma.clientTrainingPlanDay.findFirst({
        where: { id: input.id },
        include: { clientTrainingPlan: true },
      });
      if (!day || day.clientTrainingPlan.profileId !== ctx.profile.id)
        throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.prisma.clientTrainingPlanDay.delete({ where: { id: input.id } });
    }),

  addExerciseToDay: protectedProcedure
    .input(
      z.object({
        clientTrainingPlanDayId: z.string(),
        exerciseId: z.string(),
        sets: z.number().int().min(1),
        reps: z.string().min(1),
        restSeconds: z.number().int().min(0).optional(),
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const day = await ctx.prisma.clientTrainingPlanDay.findFirst({
        where: { id: input.clientTrainingPlanDayId },
        include: {
          clientTrainingPlan: true,
          exercises: { orderBy: { order: "desc" }, take: 1 },
        },
      });
      if (!day || day.clientTrainingPlan.profileId !== ctx.profile.id)
        throw new TRPCError({ code: "NOT_FOUND" });
      const order = (day.exercises[0]?.order ?? 0) + 1;
      return ctx.prisma.clientTrainingPlanExercise.create({
        data: {
          clientTrainingPlanDayId: input.clientTrainingPlanDayId,
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

  updateExercise: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        sets: z.number().int().min(1).optional(),
        reps: z.string().min(1).optional(),
        restSeconds: z.number().int().min(0).nullable().optional(),
        note: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const ex = await ctx.prisma.clientTrainingPlanExercise.findFirst({
        where: { id: input.id },
        include: { clientTrainingPlanDay: { include: { clientTrainingPlan: true } } },
      });
      if (!ex || ex.clientTrainingPlanDay.clientTrainingPlan.profileId !== ctx.profile.id)
        throw new TRPCError({ code: "NOT_FOUND" });
      const { id, ...data } = input;
      return ctx.prisma.clientTrainingPlanExercise.update({
        where: { id },
        data: data as {
          sets?: number;
          reps?: string;
          restSeconds?: number | null;
          note?: string | null;
        },
        include: { exercise: true },
      });
    }),

  deleteExercise: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const ex = await ctx.prisma.clientTrainingPlanExercise.findFirst({
        where: { id: input.id },
        include: { clientTrainingPlanDay: { include: { clientTrainingPlan: true } } },
      });
      if (!ex || ex.clientTrainingPlanDay.clientTrainingPlan.profileId !== ctx.profile.id)
        throw new TRPCError({ code: "NOT_FOUND" });
      return ctx.prisma.clientTrainingPlanExercise.delete({ where: { id: input.id } });
    }),

  /** Vyhľadanie cvičení v DB (pre výber do vlastného plánu). */
  searchExercises: protectedProcedure
    .input(z.object({ q: z.string(), limit: z.number().min(1).max(30).optional() }))
    .query(({ ctx, input }) => {
      const q = input.q.trim();
      const limit = input.limit ?? 15;
      if (!q) {
        return ctx.prisma.exercise.findMany({
          orderBy: { name: "asc" },
          take: limit,
          select: { id: true, name: true, equipment: true, muscleGroups: true, videoUrl: true },
        });
      }
      return ctx.prisma.exercise.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        orderBy: { name: "asc" },
        take: limit,
        select: { id: true, name: true, equipment: true, muscleGroups: true, videoUrl: true },
      });
    }),
});
