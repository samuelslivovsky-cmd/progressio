import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const workoutLogRouter = router({
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
});
