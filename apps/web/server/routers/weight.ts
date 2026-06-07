import { z } from "zod";
import { router, protectedProcedure, trainerProcedure } from "../trpc";

export const weightRouter = router({
  /** Tréner: zoznam váh klienta (read-only). */
  listForClient: trainerProcedure
    .input(z.object({ clientId: z.string(), limit: z.number().min(1).max(100).default(30) }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.prisma.clientTrainer.findFirst({
        where: { trainerId: ctx.profile.id, clientId: input.clientId },
      });
      if (!link) return [];
      return ctx.prisma.weightLog.findMany({
        where: { profileId: input.clientId },
        orderBy: { loggedAt: "desc" },
        take: input.limit,
      });
    }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(30) }))
    .query(({ ctx, input }) =>
      ctx.prisma.weightLog.findMany({
        where: { profileId: ctx.profile.id },
        orderBy: { loggedAt: "desc" },
        take: input.limit,
      })
    ),

  add: protectedProcedure
    .input(
      z.object({
        weight: z.number().positive(),
        unit: z.enum(["KG", "LBS"]).default("KG"),
        note: z.string().optional(),
        loggedAt: z.date().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.weightLog.create({
        data: {
          profileId: ctx.profile.id,
          weight: input.weight,
          unit: input.unit,
          note: input.note,
          loggedAt: input.loggedAt ?? new Date(),
        },
      })
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.weightLog.delete({
        where: { id: input.id, profileId: ctx.profile.id },
      })
    ),
});
