import { z } from "zod";
import { router, protectedProcedure, trainerProcedure } from "../trpc";

export const workoutLogRouter = router({
  /** Tréner: zoznam workout logov klienta (read-only). */
  listForClient: trainerProcedure
    .input(z.object({ clientId: z.string(), limit: z.number().min(1).max(100).default(30) }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.prisma.clientTrainer.findFirst({
        where: { trainerId: ctx.profile.id, clientId: input.clientId },
      });
      if (!link) return [];
      return ctx.prisma.workoutLog.findMany({
        where: { profileId: input.clientId },
        orderBy: { date: "desc" },
        take: input.limit,
        include: { items: { include: { exercise: true, sets: true } } },
      });
    }),

  byDate: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.workoutLog.findFirst({
        where: { profileId: ctx.profile.id, date: new Date(input.date) },
        include: {
          items: { include: { exercise: true, sets: true } },
        },
      })
    ),

  list: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(({ ctx, input }) =>
      ctx.prisma.workoutLog.findMany({
        where: { profileId: ctx.profile.id },
        orderBy: { date: "desc" },
        take: input.limit,
        include: { items: { include: { exercise: true } } },
      })
    ),

  create: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        name: z.string().optional(),
        durationMin: z.number().optional(),
        note: z.string().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.workoutLog.create({
        data: {
          profileId: ctx.profile.id,
          date: new Date(input.date),
          name: input.name,
          durationMin: input.durationMin,
          note: input.note,
        },
      })
    ),

  addExercise: protectedProcedure
    .input(
      z.object({
        workoutLogId: z.string(),
        exerciseId: z.string(),
        sets: z.array(
          z.object({
            reps: z.number().optional(),
            weightKg: z.number().optional(),
            durationSec: z.number().optional(),
            note: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.workoutLogItem.create({
        data: {
          workoutLogId: input.workoutLogId,
          exerciseId: input.exerciseId,
        },
      });

      await ctx.prisma.workoutSet.createMany({
        data: input.sets.map((set) => ({ workoutLogItemId: item.id, ...set })),
      });

      return item;
    }),

  /** Vytvorí celý tréning naraz: log + položky + série. Pre „Dokončiť tréning“. */
  complete: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        name: z.string().optional(),
        durationMin: z.number().optional(),
        note: z.string().optional(),
        items: z.array(
          z.object({
            exerciseId: z.string(),
            sets: z.array(
              z.object({
                reps: z.number().optional(),
                weightKg: z.number().optional(),
                durationSec: z.number().optional(),
                note: z.string().optional(),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const date = new Date(input.date);
      const log = await ctx.prisma.workoutLog.create({
        data: {
          profileId: ctx.profile.id,
          date,
          name: input.name,
          durationMin: input.durationMin,
          note: input.note,
        },
      });

      for (const item of input.items) {
        const logItem = await ctx.prisma.workoutLogItem.create({
          data: { workoutLogId: log.id, exerciseId: item.exerciseId },
        });
        if (item.sets.length > 0) {
          await ctx.prisma.workoutSet.createMany({
            data: item.sets.map((set) => ({
              workoutLogItemId: logItem.id,
              reps: set.reps ?? null,
              weightKg: set.weightKg ?? null,
              durationSec: set.durationSec ?? null,
              note: set.note ?? null,
            })),
          });
        }
      }

      return ctx.prisma.workoutLog.findUnique({
        where: { id: log.id },
        include: {
          items: { include: { exercise: true, sets: true } },
        },
      });
    }),
});
