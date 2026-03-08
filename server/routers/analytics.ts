import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { router, protectedProcedure, trainerProcedure } from "../trpc";
import * as analytics from "@/lib/analytics";

export const getClientSnapshot = protectedProcedure
  .input(z.object({ clientId: z.string().optional() }))
  .query(async ({ ctx, input }) => {
    if (
      ctx.profile.role === "CLIENT" &&
      input.clientId &&
      input.clientId !== ctx.profile.id
    ) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const clientId =
      ctx.profile.role === "CLIENT"
        ? ctx.profile.id
        : (input.clientId ?? ctx.profile.id);

    return ctx.prisma.analyticsSnapshot.findMany({
      where: { clientId },
      orderBy: { date: "desc" },
      take: 30,
    });
  });

export const getAlerts = protectedProcedure
  .input(
    z.object({
      clientId: z.string().optional(),
      limit: z.number().min(1).max(100).default(50),
      unresolvedOnly: z.boolean().optional(),
    })
  )
  .query(async ({ ctx, input }) => {
    if (ctx.profile.role === "CLIENT") {
      return ctx.prisma.alert.findMany({
        where: {
          clientId: ctx.profile.id,
          ...(input.unresolvedOnly === true ? { resolved: false } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: input.limit,
        include: { client: { select: { id: true, name: true } } },
      });
    }
    return ctx.prisma.alert.findMany({
      where: {
        trainerId: ctx.profile.id,
        ...(input.clientId ? { clientId: input.clientId } : {}),
        ...(input.unresolvedOnly === true ? { resolved: false } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: input.limit,
      include: { client: { select: { id: true, name: true } } },
    });
  });

export const resolveAlert = trainerProcedure
  .input(z.object({ alertId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    await ctx.prisma.alert.updateMany({
      where: { id: input.alertId, trainerId: ctx.profile.id },
      data: { resolved: true },
    });
    return { ok: true };
  });

export const getDropOffScore = trainerProcedure
  .input(z.object({ clientId: z.string() }))
  .query(async ({ ctx, input }) => {
    const link = await ctx.prisma.clientTrainer.findFirst({
      where: { trainerId: ctx.profile.id, clientId: input.clientId },
    });
    if (!link) throw new TRPCError({ code: "FORBIDDEN" });
    return analytics.getDropOffScore(ctx.prisma, input.clientId);
  });

export const detectPlateau = trainerProcedure
  .input(z.object({ clientId: z.string() }))
  .query(async ({ ctx, input }) => {
    const link = await ctx.prisma.clientTrainer.findFirst({
      where: { trainerId: ctx.profile.id, clientId: input.clientId },
    });
    if (!link) throw new TRPCError({ code: "FORBIDDEN" });
    return analytics.detectPlateau(ctx.prisma, input.clientId);
  });

export const detectSkippedExercises = trainerProcedure
  .input(z.object({ clientId: z.string() }))
  .query(async ({ ctx, input }) => {
    const link = await ctx.prisma.clientTrainer.findFirst({
      where: { trainerId: ctx.profile.id, clientId: input.clientId },
    });
    if (!link) throw new TRPCError({ code: "FORBIDDEN" });
    return analytics.detectSkippedExercises(ctx.prisma, input.clientId);
  });

export const predictGoalDate = protectedProcedure
  .input(z.object({ clientId: z.string().optional() }))
  .query(async ({ ctx, input }) => {
    const clientId =
      ctx.profile.role === "CLIENT"
        ? ctx.profile.id
        : input.clientId;
    if (!clientId) throw new TRPCError({ code: "BAD_REQUEST", message: "clientId required" });
    if (ctx.profile.role === "TRAINER") {
      const link = await ctx.prisma.clientTrainer.findFirst({
        where: { trainerId: ctx.profile.id, clientId },
      });
      if (!link) throw new TRPCError({ code: "FORBIDDEN" });
    } else if (clientId !== ctx.profile.id) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    return analytics.predictGoalDate(ctx.prisma, clientId);
  });

export const generateAlerts = trainerProcedure
  .input(z.object({ clientId: z.string() }))
  .mutation(async ({ ctx, input }) => {
    const link = await ctx.prisma.clientTrainer.findFirst({
      where: { trainerId: ctx.profile.id, clientId: input.clientId },
    });
    if (!link) throw new TRPCError({ code: "FORBIDDEN" });
    return analytics.generateAlerts(ctx.prisma, input.clientId);
  });

export const generateAlertsForAllClients = trainerProcedure.mutation(async ({ ctx }) => {
  const links = await ctx.prisma.clientTrainer.findMany({
    where: { trainerId: ctx.profile.id },
    select: { clientId: true },
  });
  const results: { clientId: string; count: number }[] = [];
  for (const { clientId } of links) {
    const alerts = await analytics.generateAlerts(ctx.prisma, clientId);
    results.push({ clientId, count: alerts.length });
  }
  return results;
});

export const getDropOffRanking = trainerProcedure
  .input(z.object({ limit: z.number().min(1).max(100).default(50) }).optional())
  .query(async ({ ctx, input }) => {
    const limit = input?.limit ?? 50;
    const clients = await ctx.prisma.clientTrainer.findMany({
      where: { trainerId: ctx.profile.id },
      select: { clientId: true, client: { select: { id: true, name: true } } },
    });
    if (clients.length === 0) return [];

    const snapshots = await ctx.prisma.analyticsSnapshot.findMany({
      where: { clientId: { in: clients.map((c) => c.clientId) } },
      orderBy: { date: "desc" },
    });

    const latestByClient = new Map<string, { clientId: string; clientName: string; dropOffScore: number; date: Date }>();
    for (const s of snapshots) {
      if (!latestByClient.has(s.clientId)) {
        const client = clients.find((c) => c.clientId === s.clientId)?.client;
        latestByClient.set(s.clientId, {
          clientId: s.clientId,
          clientName: client?.name ?? "",
          dropOffScore: s.dropOffScore,
          date: s.date,
        });
      }
    }

    const withSnapshot = Array.from(latestByClient.values()).sort(
      (a, b) => b.dropOffScore - a.dropOffScore
    );
    if (withSnapshot.length >= limit) return withSnapshot.slice(0, limit);

    const missing = clients.filter((c) => !latestByClient.has(c.clientId));
    for (const c of missing.slice(0, 15)) {
      try {
        const score = await analytics.getDropOffScore(ctx.prisma, c.clientId);
        withSnapshot.push({
          clientId: c.clientId,
          clientName: c.client?.name ?? "",
          dropOffScore: score,
          date: new Date(),
        });
      } catch {
        // skip on error
      }
    }
    return withSnapshot
      .sort((a, b) => b.dropOffScore - a.dropOffScore)
      .slice(0, limit);
  });

export const getUnresolvedAlertCount = trainerProcedure.query(async ({ ctx }) => {
  return ctx.prisma.alert.count({
    where: { trainerId: ctx.profile.id, resolved: false },
  });
});

/** Pre klienta: streak + posledných 7 dní adherence (strava / tréning) pre zobrazenie bodiek. */
export const getMyProgressOverview = protectedProcedure.query(async ({ ctx }) => {
  if (ctx.profile.role !== "CLIENT") throw new TRPCError({ code: "FORBIDDEN" });
  const [streak, last7] = await Promise.all([
    analytics.getStreakDays(ctx.prisma, ctx.profile.id),
    analytics.getLast7DaysActivity(ctx.prisma, ctx.profile.id),
  ]);
  return { streak, foodDays: last7.foodDays, workoutDays: last7.workoutDays };
});

export const analyticsRouter = router({
  getClientSnapshot,
  getAlerts,
  resolveAlert,
  getUnresolvedAlertCount,
  getDropOffRanking,
  getDropOffScore,
  getMyProgressOverview,
  detectPlateau,
  detectSkippedExercises,
  predictGoalDate,
  generateAlerts,
  generateAlertsForAllClients,
});
