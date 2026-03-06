import { z } from "zod";
import { router, trainerProcedure, protectedProcedure } from "../trpc";

export const mealPlanRouter = router({
  list: trainerProcedure.query(({ ctx }) =>
    ctx.prisma.mealPlan.findMany({
      where: { trainerId: ctx.profile.id },
      orderBy: { createdAt: "desc" },
    })
  ),

  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.mealPlan.findUnique({
        where: { id: input.id },
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: { meals: { include: { items: { include: { food: true } } } } },
          },
        },
      })
    ),

  create: trainerProcedure
    .input(z.object({ name: z.string().min(1), description: z.string().optional() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.mealPlan.create({
        data: { trainerId: ctx.profile.id, ...input },
      })
    ),

  assign: trainerProcedure
    .input(
      z.object({
        clientId: z.string(),
        mealPlanId: z.string(),
        startDate: z.date(),
        endDate: z.date().optional(),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.mealPlanAssignment.create({ data: input })
    ),

  myAssigned: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.mealPlanAssignment.findMany({
      where: { clientId: ctx.profile.id },
      include: {
        mealPlan: {
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: { meals: { include: { items: { include: { food: true } } } } },
            },
          },
        },
      },
    })
  ),
});
