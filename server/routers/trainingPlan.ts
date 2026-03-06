import { z } from "zod";
import { router, trainerProcedure, protectedProcedure } from "../trpc";

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
    .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.trainingPlan.create({
        data: { trainerId: ctx.profile.id, ...input },
      })
    ),

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
