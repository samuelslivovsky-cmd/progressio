import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

export const foodLogRouter = router({
  byDate: protectedProcedure
    .input(z.object({ date: z.string() })) // YYYY-MM-DD
    .query(({ ctx, input }) =>
      ctx.prisma.foodLog.findFirst({
        where: {
          profileId: ctx.profile.id,
          date: new Date(input.date),
        },
        include: {
          items: { include: { food: true } },
        },
      })
    ),

  addItem: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        foodId: z.string(),
        amount: z.number().positive(),
        mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const date = new Date(input.date);
      const log = await ctx.prisma.foodLog.upsert({
        where: {
          profileId_date: { profileId: ctx.profile.id, date },
        } as never,
        create: { profileId: ctx.profile.id, date },
        update: {},
      });

      return ctx.prisma.foodLogItem.create({
        data: {
          foodLogId: log.id,
          foodId: input.foodId,
          amount: input.amount,
          mealType: input.mealType,
        },
        include: { food: true },
      });
    }),

  removeItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.foodLogItem.delete({ where: { id: input.itemId } })
    ),

  searchFoods: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(({ ctx, input }) =>
      ctx.prisma.food.findMany({
        where: { name: { contains: input.query, mode: "insensitive" } },
        take: 20,
      })
    ),
});
