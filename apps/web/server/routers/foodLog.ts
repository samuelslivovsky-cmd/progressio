import { z } from "zod";
import { router, protectedProcedure, trainerProcedure } from "../trpc";
import { serializeFood, serializeFoodLogItem } from "@/lib/serializers";

const mealTypeEnum = z.enum(["breakfast", "desiata", "lunch", "olovrant", "dinner"]);

type RawFoodLogItem = Parameters<typeof serializeFoodLogItem>[0];

/** FoodLog with its items: flatten Decimal `amount` + nested Food columns. */
function serializeFoodLog<T extends { items: RawFoodLogItem[] }>(
  log: T,
): Omit<T, "items"> & {
  items: ReturnType<typeof serializeFoodLogItem<T["items"][number]>>[];
} {
  return { ...log, items: log.items.map((it) => serializeFoodLogItem(it)) };
}

export const foodLogRouter = router({
  byDate: protectedProcedure
    .input(z.object({ date: z.string() })) // YYYY-MM-DD
    .query(async ({ ctx, input }) => {
      const log = await ctx.prisma.foodLog.findFirst({
        where: {
          profileId: ctx.profile.id,
          date: new Date(input.date),
        },
        include: {
          items: { include: { food: true } },
        },
      });
      return log ? serializeFoodLog(log) : null;
    }),

  /** Tréner: zoznam potravy klienta (posledné záznamy, read-only). */
  listForClient: trainerProcedure
    .input(z.object({ clientId: z.string(), limit: z.number().min(1).max(60).default(30) }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.prisma.clientTrainer.findFirst({
        where: { trainerId: ctx.profile.id, clientId: input.clientId },
      });
      if (!link) return [];
      const logs = await ctx.prisma.foodLog.findMany({
        where: { profileId: input.clientId },
        orderBy: { date: "desc" },
        take: input.limit,
        include: { items: { include: { food: true } } },
      });
      return logs.map(serializeFoodLog);
    }),

  /** Trenér: záznam stravy klienta podľa dátumu (iba pre svojich klientov). */
  byDateForClient: trainerProcedure
    .input(z.object({ clientId: z.string(), date: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.prisma.clientTrainer.findFirst({
        where: { trainerId: ctx.profile.id, clientId: input.clientId },
      });
      if (!link) return null;
      const log = await ctx.prisma.foodLog.findFirst({
        where: {
          profileId: input.clientId,
          date: new Date(input.date),
        },
        include: {
          items: { include: { food: true } },
        },
      });
      return log ? serializeFoodLog(log) : null;
    }),

  addItem: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        foodId: z.string(),
        amount: z.number().positive(),
        mealType: mealTypeEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const date = new Date(input.date);
      const log = await ctx.prisma.foodLog.upsert({
        where: {
          profileId_date: { profileId: ctx.profile.id, date },
        },
        create: { profileId: ctx.profile.id, date },
        update: {},
      });

      const item = await ctx.prisma.foodLogItem.create({
        data: {
          foodLogId: log.id,
          foodId: input.foodId,
          amount: input.amount,
          mealType: input.mealType,
        },
        include: { food: true },
      });
      return serializeFoodLogItem(item);
    }),

  /** Pridanie vlastného jedla len s názvom + gramáž (bez vytvárania Food záznamu). */
  addSimpleItem: protectedProcedure
    .input(
      z.object({
        date: z.string(),
        customName: z.string().min(1),
        amount: z.number().positive(),
        mealType: mealTypeEnum,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const date = new Date(input.date);
      const log = await ctx.prisma.foodLog.upsert({
        where: {
          profileId_date: { profileId: ctx.profile.id, date },
        },
        create: { profileId: ctx.profile.id, date },
        update: {},
      });

      const item = await ctx.prisma.foodLogItem.create({
        data: {
          foodLogId: log.id,
          customName: input.customName.trim(),
          amount: input.amount,
          mealType: input.mealType,
        },
      });
      return serializeFoodLogItem({ ...item, food: null });
    }),

  removeItem: protectedProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.foodLogItem.findFirst({
        where: { id: input.itemId },
        include: { foodLog: true },
      });
      if (!item || item.foodLog.profileId !== ctx.profile.id) return;
      return ctx.prisma.foodLogItem.delete({ where: { id: input.itemId } });
    }),

  searchFoods: protectedProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const foods = await ctx.prisma.food.findMany({
        where: { name: { contains: input.query, mode: "insensitive" } },
        take: 20,
      });
      return foods.map(serializeFood);
    }),
});
