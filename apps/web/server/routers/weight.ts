import { z } from "zod";
import { router, protectedProcedure, trainerProcedure } from "../trpc";
import { toNum } from "@/lib/utils";

/** Flatten a WeightLog's Decimal `weight` to a plain number (read boundary). */
function serializeWeightLog<T extends { weight: { toNumber(): number } | number }>(
  log: T,
): Omit<T, "weight"> & { weight: number } {
  return { ...log, weight: toNum(log.weight) };
}

export const weightRouter = router({
  /** Tréner: zoznam váh klienta (read-only). */
  listForClient: trainerProcedure
    .input(z.object({ clientId: z.string(), limit: z.number().min(1).max(100).default(30) }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.prisma.clientTrainer.findFirst({
        where: { trainerId: ctx.profile.id, clientId: input.clientId },
      });
      if (!link) return [];
      const logs = await ctx.prisma.weightLog.findMany({
        where: { profileId: input.clientId },
        orderBy: { loggedAt: "desc" },
        take: input.limit,
      });
      return logs.map(serializeWeightLog);
    }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(30) }))
    .query(async ({ ctx, input }) => {
      const logs = await ctx.prisma.weightLog.findMany({
        where: { profileId: ctx.profile.id },
        orderBy: { loggedAt: "desc" },
        take: input.limit,
      });
      return logs.map(serializeWeightLog);
    }),

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
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.weightLog.deleteMany({
        where: { id: input.id, profileId: ctx.profile.id },
      });
      return { ok: true };
    }),
});
