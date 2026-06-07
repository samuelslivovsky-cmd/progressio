import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, trainerProcedure } from "../trpc";
import { toNum } from "@/lib/utils";

type DecimalOrNull = { toNumber(): number } | number | null;
type MeasurementCols = "chest" | "waist" | "hips" | "thigh" | "arm" | "calf" | "neck";

/** Flatten a Profile's Decimal `goalWeight` / `height` to plain numbers. */
function serializeProfile<T extends { goalWeight: DecimalOrNull; height: DecimalOrNull }>(
  profile: T,
): Omit<T, "goalWeight" | "height"> & { goalWeight: number | null; height: number | null } {
  return { ...profile, goalWeight: toNum(profile.goalWeight), height: toNum(profile.height) };
}

/** Flatten WeightLog.weight Decimals nested under a profile include. */
function serializeWeightLogs<T extends { weight: { toNumber(): number } | number }>(
  logs: T[],
): (Omit<T, "weight"> & { weight: number })[] {
  return logs.map((w) => ({ ...w, weight: toNum(w.weight) }));
}

/** Flatten Measurement Decimals nested under a profile include. */
function serializeMeasurements<
  T extends {
    chest: DecimalOrNull;
    waist: DecimalOrNull;
    hips: DecimalOrNull;
    thigh: DecimalOrNull;
    arm: DecimalOrNull;
    calf: DecimalOrNull;
    neck: DecimalOrNull;
  },
>(rows: T[]): (Omit<T, MeasurementCols> & Record<MeasurementCols, number | null>)[] {
  return rows.map((m) => ({
    ...m,
    chest: toNum(m.chest),
    waist: toNum(m.waist),
    hips: toNum(m.hips),
    thigh: toNum(m.thigh),
    arm: toNum(m.arm),
    calf: toNum(m.calf),
    neck: toNum(m.neck),
  }));
}

export const profileRouter = router({
  me: protectedProcedure.query(({ ctx }) => serializeProfile(ctx.profile)),

  update: protectedProcedure
    .input(z.object({ name: z.string().min(1).optional() }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.prisma.profile.update({
        where: { id: ctx.profile.id },
        data: input,
      });
      return serializeProfile(updated);
    }),

  clients: trainerProcedure.query(async ({ ctx }) => {
    const clients = await ctx.prisma.profile.findMany({
      where: { trainerRelation: { trainerId: ctx.profile.id } },
      include: {
        weightLogs: { orderBy: { loggedAt: "desc" }, take: 1 },
        measurements: { orderBy: { loggedAt: "desc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    });
    return clients.map((c) => ({
      ...serializeProfile(c),
      weightLogs: serializeWeightLogs(c.weightLogs),
      measurements: serializeMeasurements(c.measurements),
    }));
  }),

  addClient: trainerProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ ctx, input }) => {
      const client = await ctx.prisma.profile.findUnique({
        where: { email: input.email },
      });

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Používateľ s týmto emailom neexistuje.",
        });
      }

      if (client.role !== "CLIENT") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tento používateľ nie je klient.",
        });
      }

      const existing = await ctx.prisma.clientTrainer.findUnique({
        where: { clientId: client.id },
      });

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Tento klient už je priradený k trénerovi.",
        });
      }

      return ctx.prisma.clientTrainer.create({
        data: { clientId: client.id, trainerId: ctx.profile.id },
        include: { client: true },
      });
    }),

  removeClient: trainerProcedure
    .input(z.object({ clientId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const res = await ctx.prisma.clientTrainer.deleteMany({
        where: { clientId: input.clientId, trainerId: ctx.profile.id },
      });
      if (res.count === 0) throw new TRPCError({ code: "NOT_FOUND" });
      return { ok: true };
    }),

  clientDetail: trainerProcedure
    .input(z.object({ clientId: z.string() }))
    .query(async ({ ctx, input }) => {
      const client = await ctx.prisma.profile.findFirst({
        where: {
          id: input.clientId,
          trainerRelation: { trainerId: ctx.profile.id },
        },
        include: {
          weightLogs: { orderBy: { loggedAt: "desc" }, take: 10 },
          measurements: { orderBy: { loggedAt: "desc" }, take: 5 },
          assignedMealPlan: { include: { mealPlan: true }, orderBy: { startDate: "desc" }, take: 1 },
          assignedTrainingPlan: { include: { trainingPlan: true }, orderBy: { startDate: "desc" }, take: 1 },
        },
      });
      if (!client) return null;
      return {
        ...serializeProfile(client),
        weightLogs: serializeWeightLogs(client.weightLogs),
        measurements: serializeMeasurements(client.measurements),
      };
    }),
});
