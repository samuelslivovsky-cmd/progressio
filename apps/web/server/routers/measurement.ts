import { z } from "zod";
import { router, protectedProcedure, trainerProcedure } from "../trpc";
import { toNum } from "@/lib/utils";

type DecimalOrNull = { toNumber(): number } | number | null;

type MeasurementCols = "chest" | "waist" | "hips" | "thigh" | "arm" | "calf" | "neck";

/** Flatten a Measurement's Decimal body-part columns to plain numbers. */
function serializeMeasurement<
  T extends {
    chest: DecimalOrNull;
    waist: DecimalOrNull;
    hips: DecimalOrNull;
    thigh: DecimalOrNull;
    arm: DecimalOrNull;
    calf: DecimalOrNull;
    neck: DecimalOrNull;
  },
>(m: T): Omit<T, MeasurementCols> & Record<MeasurementCols, number | null> {
  return {
    ...m,
    chest: toNum(m.chest),
    waist: toNum(m.waist),
    hips: toNum(m.hips),
    thigh: toNum(m.thigh),
    arm: toNum(m.arm),
    calf: toNum(m.calf),
    neck: toNum(m.neck),
  };
}

const measurementInput = z.object({
  chest: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  thigh: z.number().optional(),
  arm: z.number().optional(),
  calf: z.number().optional(),
  neck: z.number().optional(),
  unit: z.enum(["CM", "INCH"]).default("CM"),
  note: z.string().optional(),
  loggedAt: z.date().optional(),
});

export const measurementRouter = router({
  /** Tréner: zoznam meraní klienta (read-only). */
  listForClient: trainerProcedure
    .input(z.object({ clientId: z.string(), limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.prisma.clientTrainer.findFirst({
        where: { trainerId: ctx.profile.id, clientId: input.clientId },
      });
      if (!link) return [];
      const rows = await ctx.prisma.measurement.findMany({
        where: { profileId: input.clientId },
        orderBy: { loggedAt: "desc" },
        take: input.limit,
      });
      return rows.map(serializeMeasurement);
    }),

  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      const rows = await ctx.prisma.measurement.findMany({
        where: { profileId: ctx.profile.id },
        orderBy: { loggedAt: "desc" },
        take: input.limit,
      });
      return rows.map(serializeMeasurement);
    }),

  add: protectedProcedure
    .input(measurementInput)
    .mutation(({ ctx, input }) =>
      ctx.prisma.measurement.create({
        data: {
          profileId: ctx.profile.id,
          ...input,
          loggedAt: input.loggedAt ?? new Date(),
        },
      })
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.measurement.deleteMany({
        where: { id: input.id, profileId: ctx.profile.id },
      });
      return { ok: true };
    }),
});
