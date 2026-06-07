import { z } from "zod";
import { router, trainerProcedure } from "../trpc";
import { serializeMealItem } from "@/lib/serializers";

type RawMealItem = Parameters<typeof serializeMealItem>[0];

/**
 * Flatten Decimal columns in a MealTemplate's items (with nested Food).
 * Uses `Omit` (not a plain spread) so the new `items` type fully replaces the
 * original `Decimal`-typed one instead of intersecting with it.
 */
function serializeTemplate<T extends { items: RawMealItem[] }>(
  tpl: T,
): Omit<T, "items"> & { items: ReturnType<typeof serializeMealItem<T["items"][number]>>[] } {
  return { ...tpl, items: tpl.items.map((it) => serializeMealItem(it)) };
}

export const mealTemplateRouter = router({
  list: trainerProcedure.query(async ({ ctx }) => {
    const templates = await ctx.prisma.mealTemplate.findMany({
      where: { trainerId: ctx.profile.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: { include: { food: true } },
      },
    });
    return templates.map(serializeTemplate);
  }),

  create: trainerProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.mealTemplate.create({
        data: { trainerId: ctx.profile.id, name: input.name.trim() },
      })
    ),

  update: trainerProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.mealTemplate.updateMany({
        where: { id: input.id, trainerId: ctx.profile.id },
        data: { name: input.name.trim() },
      });
      return ctx.prisma.mealTemplate.findUniqueOrThrow({ where: { id: input.id } });
    }),

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
      const item = await ctx.prisma.mealTemplateItem.create({
        data: input,
        include: { food: true },
      });
      return serializeMealItem(item);
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
