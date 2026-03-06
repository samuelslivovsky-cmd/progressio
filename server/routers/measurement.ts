import { z } from "zod";
import { router, protectedProcedure } from "../trpc";

const measurementInput = z.object({
  chest: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  thigh: z.number().optional(),
  arm: z.number().optional(),
  calf: z.number().optional(),
  neck: z.number().optional(),
  unit: z.enum(["CM", "INCH"]).default("CM"),
  note: z.string().optional(),
  loggedAt: z.date().optional(),
});

export const measurementRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(({ ctx, input }) =>
      ctx.prisma.measurement.findMany({
        where: { profileId: ctx.profile.id },
        orderBy: { loggedAt: "desc" },
        take: input.limit,
      })
    ),

  add: protectedProcedure
    .input(measurementInput)
    .mutation(({ ctx, input }) =>
      ctx.prisma.measurement.create({
        data: {
          profileId: ctx.profile.id,
          ...input,
          loggedAt: input.loggedAt ?? new Date(),
        },
      })
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.measurement.delete({
        where: { id: input.id, profileId: ctx.profile.id },
      })
    ),
});
