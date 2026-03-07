import { z } from "zod";
import { router, trainerProcedure } from "../trpc";

export const mealTemplateRouter = router({
  list: trainerProcedure.query(({ ctx }) =>
    ctx.prisma.mealTemplate.findMany({
      where: { trainerId: ctx.profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { food: true } },
      },
    })
  ),

  create: trainerProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.mealTemplate.create({
        data: { trainerId: ctx.profile.id, name: input.name.trim() },
      })
    ),

  addItem: trainerProcedure
    .input(
      z.object({
        mealTemplateId: z.string(),
        foodId: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const template = await ctx.prisma.mealTemplate.findFirst({
        where: { id: input.mealTemplateId, trainerId: ctx.profile.id },
      });
      if (!template) throw new Error("Šablóna neexistuje");
      return ctx.prisma.mealTemplateItem.create({
        data: input,
        include: { food: true },
      });
    }),

  removeItem: trainerProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.mealTemplateItem.findFirst({
        where: { id: input.itemId },
        include: { mealTemplate: true },
      });
      if (!item || item.mealTemplate.trainerId !== ctx.profile.id) throw new Error("Položka neexistuje");
      return ctx.prisma.mealTemplateItem.delete({ where: { id: input.itemId } });
    }),

  delete: trainerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.mealTemplate.deleteMany({
        where: { id: input.id, trainerId: ctx.profile.id },
      });
    }),
});
