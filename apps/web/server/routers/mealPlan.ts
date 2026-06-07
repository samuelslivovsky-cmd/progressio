import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, trainerProcedure, protectedProcedure } from "../trpc";
import { serializeFood, serializeMealItem } from "@/lib/serializers";

type RawMealItem = Parameters<typeof serializeMealItem>[0];

// Generic spreads over a same-named key produce an unusable intersection
// (`Decimal & number`), so each level uses `Omit` to fully replace the
// serialized key. Inner element types are derived via indexed access so a
// single inferred type param keeps the full original shape (ids, names, …).
type SerializedMeal<M extends { items: RawMealItem[] }> = Omit<M, "items"> & {
  items: ReturnType<typeof serializeMealItem<M["items"][number]>>[];
};

type SerializedDay<D extends { meals: { items: RawMealItem[] }[] }> = Omit<
  D,
  "meals"
> & { meals: SerializedMeal<D["meals"][number]>[] };

type SerializedPlan<P extends { days: { meals: { items: RawMealItem[] }[] }[] }> =
  Omit<P, "days"> & { days: SerializedDay<P["days"][number]>[] };

/** Flatten Decimal columns inside a Meal's items (with nested Food). */
function serializeMeal<M extends { items: RawMealItem[] }>(meal: M): SerializedMeal<M> {
  return { ...meal, items: meal.items.map((it) => serializeMealItem(it)) } as SerializedMeal<M>;
}

/** Flatten Decimal columns inside a full MealPlan (days → meals → items → food). */
function serializeMealPlan<P extends { days: { meals: { items: RawMealItem[] }[] }[] }>(
  plan: P,
): SerializedPlan<P> {
  return {
    ...plan,
    days: plan.days.map((day) => ({
      ...day,
      meals: day.meals.map((meal) => serializeMeal(meal)),
    })),
  } as SerializedPlan<P>;
}

export const mealPlanRouter = router({
  list: trainerProcedure.query(({ ctx }) =>
    ctx.prisma.mealPlan.findMany({
      where: { trainerId: ctx.profile.id },
      orderBy: { createdAt: "desc" },
    })
  ),

  detail: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const plan = await ctx.prisma.mealPlan.findFirst({
        where: {
          id: input.id,
          OR: [
            { trainerId: ctx.profile.id },
            { assignments: { some: { clientId: ctx.profile.id } } },
          ],
        },
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: { meals: { include: { items: { include: { food: true } } } } },
          },
        },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND" });
      return serializeMealPlan(plan);
    }),

  create: trainerProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        calorieTargetPerDay: z.number().int().min(1).optional(),
      })
    )
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
        note: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [plan, link] = await Promise.all([
        ctx.prisma.mealPlan.findFirst({ where: { id: input.mealPlanId, trainerId: ctx.profile.id } }),
        ctx.prisma.clientTrainer.findFirst({ where: { clientId: input.clientId, trainerId: ctx.profile.id } }),
      ]);
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plán neexistuje" });
      if (!link) throw new TRPCError({ code: "FORBIDDEN", message: "Klient nie je váš" });
      return ctx.prisma.mealPlanAssignment.create({ data: input });
    }),

  myAssigned: protectedProcedure.query(async ({ ctx }) => {
    const assignments = await ctx.prisma.mealPlanAssignment.findMany({
      where: { clientId: ctx.profile.id },
      orderBy: { startDate: "desc" },
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
    });
    return assignments.map((a) => ({ ...a, mealPlan: serializeMealPlan(a.mealPlan) }));
  }),

  update: trainerProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        calorieTargetPerDay: z.number().int().min(1).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await ctx.prisma.mealPlan.updateMany({
        where: { id, trainerId: ctx.profile.id },
        data,
      });
      return ctx.prisma.mealPlan.findUniqueOrThrow({ where: { id } });
    }),

  addDay: trainerProcedure
    .input(z.object({ mealPlanId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.mealPlan.findFirst({
        where: { id: input.mealPlanId, trainerId: ctx.profile.id },
        include: { days: { orderBy: { dayNumber: "desc" }, take: 1 } },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plán neexistuje" });
      const nextDay = (plan.days[0]?.dayNumber ?? 0) + 1;
      return ctx.prisma.mealPlanDay.create({
        data: { mealPlanId: input.mealPlanId, dayNumber: nextDay },
      });
    }),

  addMeal: trainerProcedure
    .input(
      z.object({
        mealPlanDayId: z.string(),
        name: z.enum(["breakfast", "desiata", "lunch", "olovrant", "dinner"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const day = await ctx.prisma.mealPlanDay.findFirst({
        where: { id: input.mealPlanDayId },
        include: { mealPlan: true },
      });
      if (!day || day.mealPlan.trainerId !== ctx.profile.id) throw new TRPCError({ code: "NOT_FOUND", message: "Deň neexistuje" });
      return ctx.prisma.meal.create({
        data: { mealPlanDayId: input.mealPlanDayId, name: input.name },
      });
    }),

  addMealItem: trainerProcedure
    .input(
      z.object({
        mealId: z.string(),
        foodId: z.string(),
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const meal = await ctx.prisma.meal.findFirst({
        where: { id: input.mealId },
        include: { mealPlanDay: { include: { mealPlan: true } } },
      });
      if (!meal || meal.mealPlanDay.mealPlan.trainerId !== ctx.profile.id) throw new TRPCError({ code: "NOT_FOUND", message: "Jedlo neexistuje" });
      const item = await ctx.prisma.mealItem.create({
        data: input,
        include: { food: true },
      });
      return serializeMealItem(item);
    }),

  deleteDay: trainerProcedure
    .input(z.object({ dayId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const day = await ctx.prisma.mealPlanDay.findFirst({
        where: { id: input.dayId },
        include: { mealPlan: true },
      });
      if (!day || day.mealPlan.trainerId !== ctx.profile.id) throw new TRPCError({ code: "NOT_FOUND", message: "Deň neexistuje" });
      return ctx.prisma.mealPlanDay.delete({ where: { id: input.dayId } });
    }),

  deleteMeal: trainerProcedure
    .input(z.object({ mealId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const meal = await ctx.prisma.meal.findFirst({
        where: { id: input.mealId },
        include: { mealPlanDay: { include: { mealPlan: true } } },
      });
      if (!meal || meal.mealPlanDay.mealPlan.trainerId !== ctx.profile.id) throw new TRPCError({ code: "NOT_FOUND", message: "Jedlo neexistuje" });
      return ctx.prisma.meal.delete({ where: { id: input.mealId } });
    }),

  deleteMealItem: trainerProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.mealItem.findFirst({
        where: { id: input.itemId },
        include: { meal: { include: { mealPlanDay: { include: { mealPlan: true } } } } },
      });
      if (!item || item.meal.mealPlanDay.mealPlan.trainerId !== ctx.profile.id) throw new TRPCError({ code: "NOT_FOUND", message: "Položka neexistuje" });
      return ctx.prisma.mealItem.delete({ where: { id: input.itemId } });
    }),

  updateMealItemAmount: trainerProcedure
    .input(z.object({ itemId: z.string(), amount: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.mealItem.findFirst({
        where: { id: input.itemId },
        include: { meal: { include: { mealPlanDay: { include: { mealPlan: true } } } } },
      });
      if (!item || item.meal.mealPlanDay.mealPlan.trainerId !== ctx.profile.id) throw new TRPCError({ code: "NOT_FOUND", message: "Položka neexistuje" });
      const updated = await ctx.prisma.mealItem.update({
        where: { id: input.itemId },
        data: { amount: input.amount },
        include: { food: true },
      });
      return serializeMealItem(updated);
    }),

  copyDay: trainerProcedure
    .input(
      z.object({
        mealPlanId: z.string(),
        sourceDayId: z.string(),
        targetDayNumber: z.number().int().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.mealPlan.findFirst({
        where: { id: input.mealPlanId, trainerId: ctx.profile.id },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plán neexistuje" });
      const sourceDay = await ctx.prisma.mealPlanDay.findFirst({
        where: { id: input.sourceDayId, mealPlanId: input.mealPlanId },
        include: { meals: { include: { items: true } } },
      });
      if (!sourceDay) throw new TRPCError({ code: "NOT_FOUND", message: "Zdrojový deň neexistuje" });

      const result = await ctx.prisma.$transaction(async (tx) => {
        let targetDay = await tx.mealPlanDay.findFirst({
          where: { mealPlanId: input.mealPlanId, dayNumber: input.targetDayNumber },
        });
        if (targetDay) {
          const mealIds = (await tx.meal.findMany({
            where: { mealPlanDayId: targetDay.id },
            select: { id: true },
          })).map((m) => m.id);
          if (mealIds.length > 0) {
            await tx.mealItem.deleteMany({ where: { mealId: { in: mealIds } } });
          }
          await tx.meal.deleteMany({ where: { mealPlanDayId: targetDay.id } });
        } else {
          targetDay = await tx.mealPlanDay.create({
            data: { mealPlanId: input.mealPlanId, dayNumber: input.targetDayNumber },
          });
        }

        for (const meal of sourceDay.meals) {
          const newMeal = await tx.meal.create({
            data: { mealPlanDayId: targetDay.id, name: meal.name },
          });
          if (meal.items.length > 0) {
            await tx.mealItem.createMany({
              data: meal.items.map((it) => ({
                mealId: newMeal.id,
                foodId: it.foodId,
                amount: it.amount,
              })),
            });
          }
        }

        return tx.mealPlan.findUniqueOrThrow({
          where: { id: input.mealPlanId },
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: { meals: { include: { items: { include: { food: true } } } } },
            },
          },
        });
      });
      return serializeMealPlan(result);
    }),

  addTemplateToMeal: trainerProcedure
    .input(
      z.object({
        mealId: z.string(),
        mealTemplateId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const meal = await ctx.prisma.meal.findFirst({
        where: { id: input.mealId },
        include: { mealPlanDay: { include: { mealPlan: true } } },
      });
      if (!meal || meal.mealPlanDay.mealPlan.trainerId !== ctx.profile.id) throw new TRPCError({ code: "NOT_FOUND", message: "Jedlo neexistuje" });
      const template = await ctx.prisma.mealTemplate.findFirst({
        where: { id: input.mealTemplateId, trainerId: ctx.profile.id },
        include: { items: true },
      });
      if (!template) throw new TRPCError({ code: "NOT_FOUND", message: "Šablóna jedla neexistuje" });
      if (template.items.length > 0) {
        await ctx.prisma.mealItem.createMany({
          data: template.items.map((it) => ({
            mealId: input.mealId,
            foodId: it.foodId,
            amount: it.amount,
          })),
        });
      }
      const updatedMeal = await ctx.prisma.meal.findUniqueOrThrow({
        where: { id: input.mealId },
        include: { items: { include: { food: true } } },
      });
      return serializeMeal(updatedMeal);
    }),

  searchFoods: trainerProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.query.length < 1) return [];
      const foods = await ctx.prisma.food.findMany({
        where: { name: { contains: input.query, mode: "insensitive" } },
        take: 20,
      });
      return foods.map(serializeFood);
    }),

  saveContent: trainerProcedure
    .input(
      z.object({
        mealPlanId: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        days: z.array(
          z.object({
            dayNumber: z.number().int().min(1),
            meals: z.array(
              z.object({
                name: z.enum(["breakfast", "desiata", "lunch", "olovrant", "dinner"]),
                items: z.array(
                  z.object({
                    foodId: z.string(),
                    amount: z.number().positive(),
                  })
                ),
              })
            ),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await ctx.prisma.mealPlan.findFirst({
        where: { id: input.mealPlanId, trainerId: ctx.profile.id },
      });
      if (!plan) throw new TRPCError({ code: "NOT_FOUND", message: "Plán neexistuje" });

      const saved = await ctx.prisma.$transaction(async (tx) => {
        if (input.name !== undefined || input.description !== undefined) {
          await tx.mealPlan.update({
            where: { id: input.mealPlanId },
            data: {
              ...(input.name !== undefined && { name: input.name }),
              ...(input.description !== undefined && { description: input.description }),
            },
          });
        }

        // Bulk delete existing structure
        const existingDayIds = (await tx.mealPlanDay.findMany({
          where: { mealPlanId: input.mealPlanId },
          select: { id: true },
        })).map((d) => d.id);

        if (existingDayIds.length > 0) {
          const existingMealIds = (await tx.meal.findMany({
            where: { mealPlanDayId: { in: existingDayIds } },
            select: { id: true },
          })).map((m) => m.id);

          if (existingMealIds.length > 0) {
            await tx.mealItem.deleteMany({ where: { mealId: { in: existingMealIds } } });
          }
          await tx.meal.deleteMany({ where: { mealPlanDayId: { in: existingDayIds } } });
          await tx.mealPlanDay.deleteMany({ where: { mealPlanId: input.mealPlanId } });
        }

        // Create new structure with createMany where possible
        for (const d of input.days) {
          const day = await tx.mealPlanDay.create({
            data: { mealPlanId: input.mealPlanId, dayNumber: d.dayNumber },
          });
          for (const m of d.meals) {
            const meal = await tx.meal.create({
              data: { mealPlanDayId: day.id, name: m.name },
            });
            if (m.items.length > 0) {
              await tx.mealItem.createMany({
                data: m.items.map((it) => ({
                  mealId: meal.id,
                  foodId: it.foodId,
                  amount: it.amount,
                })),
              });
            }
          }
        }

        return tx.mealPlan.findUniqueOrThrow({
          where: { id: input.mealPlanId },
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: { meals: { include: { items: { include: { food: true } } } } },
            },
          },
        });
      });
      return serializeMealPlan(saved);
    }),

  duplicate: trainerProcedure
    .input(z.object({ mealPlanId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const source = await ctx.prisma.mealPlan.findFirst({
        where: { id: input.mealPlanId, trainerId: ctx.profile.id },
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: { meals: { include: { items: true } } },
          },
        },
      });
      if (!source) throw new TRPCError({ code: "NOT_FOUND", message: "Plán neexistuje" });

      const duplicated = await ctx.prisma.$transaction(async (tx) => {
        const newPlan = await tx.mealPlan.create({
          data: {
            trainerId: ctx.profile.id,
            name: `${source.name} (kópia)`,
            description: source.description,
            calorieTargetPerDay: source.calorieTargetPerDay,
          },
        });
        for (const day of source.days) {
          const newDay = await tx.mealPlanDay.create({
            data: { mealPlanId: newPlan.id, dayNumber: day.dayNumber },
          });
          for (const meal of day.meals) {
            const newMeal = await tx.meal.create({
              data: { mealPlanDayId: newDay.id, name: meal.name },
            });
            if (meal.items.length > 0) {
              await tx.mealItem.createMany({
                data: meal.items.map((it) => ({
                  mealId: newMeal.id,
                  foodId: it.foodId,
                  amount: it.amount,
                })),
              });
            }
          }
        }
        return tx.mealPlan.findUniqueOrThrow({
          where: { id: newPlan.id },
          include: {
            days: {
              orderBy: { dayNumber: "asc" },
              include: { meals: { include: { items: { include: { food: true } } } } },
            },
          },
        });
      });
      return serializeMealPlan(duplicated);
    }),
});
