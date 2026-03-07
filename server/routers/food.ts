import { z } from "zod";
import { router, protectedProcedure, trainerProcedure } from "../trpc";

export const foodRouter = router({
  /** Klient aj tréner môžu vytvoriť jednoduchú potravinu (názov + gramáž). */
  createSimple: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        servingSize: z.number().positive().default(100),
      })
    )
    .mutation(({ ctx, input }) =>
      ctx.prisma.food.create({
        data: {
          name: input.name.trim(),
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          servingSize: input.servingSize,
          unit: "g",
        },
      })
    ),

  /** Klient aj tréner môžu vytvoriť plnú potravinu (výživové údaje). */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        barcode: z.string().optional(),
        calories: z.number().min(0),
        servingSize: z.number().positive(),
        protein: z.number().min(0),
        fiber: z.number().min(0),
        carbs: z.number().min(0).optional(),
        fat: z.number().min(0).optional(),
        unit: z.string().default("g"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (input.barcode?.trim()) {
        const existing = await ctx.prisma.food.findUnique({
          where: { barcode: input.barcode.trim() },
        });
        if (existing) throw new Error("Potravina s týmto čiarovým kódom už existuje.");
      }
      return ctx.prisma.food.create({
        data: {
          name: input.name.trim(),
          barcode: input.barcode?.trim() || null,
          calories: input.calories,
          servingSize: input.servingSize,
          unit: input.unit,
          protein: input.protein,
          fiber: input.fiber,
          carbs: input.carbs ?? 0,
          fat: input.fat ?? 0,
        },
      });
    }),
});
