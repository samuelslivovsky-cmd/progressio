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
    .mutation(({ ctx, input }) =>
      ctx.prisma.mealPlanAssignment.create({ data: input })
    ),

  myAssigned: protectedProcedure.query(({ ctx }) =>
    ctx.prisma.mealPlanAssignment.findMany({
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
    })
  ),

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
      if (!plan) throw new Error("Plán neexistuje");
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
      if (!day || day.mealPlan.trainerId !== ctx.profile.id) throw new Error("Deň neexistuje");
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
      if (!meal || meal.mealPlanDay.mealPlan.trainerId !== ctx.profile.id) throw new Error("Jedlo neexistuje");
      return ctx.prisma.mealItem.create({
        data: input,
        include: { food: true },
      });
    }),

  deleteDay: trainerProcedure
    .input(z.object({ dayId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const day = await ctx.prisma.mealPlanDay.findFirst({
        where: { id: input.dayId },
        include: { mealPlan: true },
      });
      if (!day || day.mealPlan.trainerId !== ctx.profile.id) throw new Error("Deň neexistuje");
      return ctx.prisma.mealPlanDay.delete({ where: { id: input.dayId } });
    }),

  deleteMeal: trainerProcedure
    .input(z.object({ mealId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const meal = await ctx.prisma.meal.findFirst({
        where: { id: input.mealId },
        include: { mealPlanDay: { include: { mealPlan: true } } },
      });
      if (!meal || meal.mealPlanDay.mealPlan.trainerId !== ctx.profile.id) throw new Error("Jedlo neexistuje");
      return ctx.prisma.meal.delete({ where: { id: input.mealId } });
    }),

  deleteMealItem: trainerProcedure
    .input(z.object({ itemId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.mealItem.findFirst({
        where: { id: input.itemId },
        include: { meal: { include: { mealPlanDay: { include: { mealPlan: true } } } } },
      });
      if (!item || item.meal.mealPlanDay.mealPlan.trainerId !== ctx.profile.id) throw new Error("Položka neexistuje");
      return ctx.prisma.mealItem.delete({ where: { id: input.itemId } });
    }),

  updateMealItemAmount: trainerProcedure
    .input(z.object({ itemId: z.string(), amount: z.number().positive() }))
    .mutation(async ({ ctx, input }) => {
      const item = await ctx.prisma.mealItem.findFirst({
        where: { id: input.itemId },
        include: { meal: { include: { mealPlanDay: { include: { mealPlan: true } } } } },
      });
      if (!item || item.meal.mealPlanDay.mealPlan.trainerId !== ctx.profile.id) throw new Error("Položka neexistuje");
      return ctx.prisma.mealItem.update({
        where: { id: input.itemId },
        data: { amount: input.amount },
        include: { food: true },
      });
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
      if (!plan) throw new Error("Plán neexistuje");
      const sourceDay = await ctx.prisma.mealPlanDay.findFirst({
        where: { id: input.sourceDayId, mealPlanId: input.mealPlanId },
        include: { meals: { include: { items: true } } },
      });
      if (!sourceDay) throw new Error("Zdrojový deň neexistuje");

      let targetDay = await ctx.prisma.mealPlanDay.findFirst({
        where: { mealPlanId: input.mealPlanId, dayNumber: input.targetDayNumber },
        include: { meals: { include: { items: true } } },
      });
      if (targetDay) {
        for (const meal of targetDay.meals) {
          await ctx.prisma.mealItem.deleteMany({ where: { mealId: meal.id } });
        }
        await ctx.prisma.meal.deleteMany({ where: { mealPlanDayId: targetDay.id } });
      } else {
        targetDay = await ctx.prisma.mealPlanDay.create({
          data: { mealPlanId: input.mealPlanId, dayNumber: input.targetDayNumber },
          include: { meals: { include: { items: true } } },
        });
      }

      for (const meal of sourceDay.meals) {
        const newMeal = await ctx.prisma.meal.create({
          data: { mealPlanDayId: targetDay!.id, name: meal.name },
        });
        for (const it of meal.items) {
          await ctx.prisma.mealItem.create({
            data: { mealId: newMeal.id, foodId: it.foodId, amount: it.amount },
          });
        }
      }

      return ctx.prisma.mealPlan.findUniqueOrThrow({
        where: { id: input.mealPlanId },
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: { meals: { include: { items: { include: { food: true } } } } },
          },
        },
      });
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
      if (!meal || meal.mealPlanDay.mealPlan.trainerId !== ctx.profile.id) throw new Error("Jedlo neexistuje");
      const template = await ctx.prisma.mealTemplate.findFirst({
        where: { id: input.mealTemplateId, trainerId: ctx.profile.id },
        include: { items: true },
      });
      if (!template) throw new Error("Šablóna jedla neexistuje");
      for (const it of template.items) {
        await ctx.prisma.mealItem.create({
          data: { mealId: input.mealId, foodId: it.foodId, amount: it.amount },
        });
      }
      return ctx.prisma.meal.findUniqueOrThrow({
        where: { id: input.mealId },
        include: { items: { include: { food: true } } },
      });
    }),

  searchFoods: trainerProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      if (input.query.length < 1) return [];
      return ctx.prisma.food.findMany({
        where: { name: { contains: input.query, mode: "insensitive" } },
        take: 20,
      });
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
      if (!plan) throw new Error("Plán neexistuje");

      if (input.name !== undefined || input.description !== undefined) {
        await ctx.prisma.mealPlan.update({
          where: { id: input.mealPlanId },
          data: {
            ...(input.name !== undefined && { name: input.name }),
            ...(input.description !== undefined && { description: input.description }),
          },
        });
      }

      const existingDays = await ctx.prisma.mealPlanDay.findMany({
        where: { mealPlanId: input.mealPlanId },
        include: { meals: { include: { items: true } } },
      });

      for (const day of existingDays) {
        for (const meal of day.meals) {
          await ctx.prisma.mealItem.deleteMany({ where: { mealId: meal.id } });
        }
        await ctx.prisma.meal.deleteMany({ where: { mealPlanDayId: day.id } });
      }
      await ctx.prisma.mealPlanDay.deleteMany({ where: { mealPlanId: input.mealPlanId } });

      for (const d of input.days) {
        const day = await ctx.prisma.mealPlanDay.create({
          data: { mealPlanId: input.mealPlanId, dayNumber: d.dayNumber },
        });
        for (const m of d.meals) {
          const meal = await ctx.prisma.meal.create({
            data: { mealPlanDayId: day.id, name: m.name },
          });
          for (const it of m.items) {
            await ctx.prisma.mealItem.create({
              data: { mealId: meal.id, foodId: it.foodId, amount: it.amount },
            });
          }
        }
      }

      return ctx.prisma.mealPlan.findUniqueOrThrow({
        where: { id: input.mealPlanId },
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: { meals: { include: { items: { include: { food: true } } } } },
          },
        },
      });
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
      if (!source) throw new Error("Plán neexistuje");
      const newPlan = await ctx.prisma.mealPlan.create({
        data: {
          trainerId: ctx.profile.id,
          name: `${source.name} (kópia)`,
          description: source.description,
          calorieTargetPerDay: source.calorieTargetPerDay,
        },
      });
      for (const day of source.days) {
        const newDay = await ctx.prisma.mealPlanDay.create({
          data: { mealPlanId: newPlan.id, dayNumber: day.dayNumber },
        });
        for (const meal of day.meals) {
          const newMeal = await ctx.prisma.meal.create({
            data: { mealPlanDayId: newDay.id, name: meal.name },
          });
          for (const it of meal.items) {
            await ctx.prisma.mealItem.create({
              data: { mealId: newMeal.id, foodId: it.foodId, amount: it.amount },
            });
          }
        }
      }
      return ctx.prisma.mealPlan.findUniqueOrThrow({
        where: { id: newPlan.id },
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: { meals: { include: { items: { include: { food: true } } } } },
          },
        },
      });
    }),
});
