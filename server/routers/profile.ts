import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure, trainerProcedure } from "../trpc";

export const profileRouter = router({
  me: protectedProcedure.query(({ ctx }) => ctx.profile),

  update: protectedProcedure
    .input(z.object({ name: z.string().min(1).optional() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.profile.update({
        where: { id: ctx.profile.id },
        data: input,
      })
    ),

  clients: trainerProcedure.query(({ ctx }) =>
    ctx.prisma.profile.findMany({
      where: { trainerRelation: { trainerId: ctx.profile.id } },
      include: {
        weightLogs: { orderBy: { loggedAt: "desc" }, take: 1 },
        measurements: { orderBy: { loggedAt: "desc" }, take: 1 },
      },
      orderBy: { name: "asc" },
    })
  ),

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
    .mutation(({ ctx, input }) =>
      ctx.prisma.clientTrainer.delete({
        where: { clientId: input.clientId },
      })
    ),

  clientDetail: trainerProcedure
    .input(z.object({ clientId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.profile.findFirst({
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
      })
    ),
});
