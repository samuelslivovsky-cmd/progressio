import { z } from "zod";
import { router, protectedProcedure, trainerProcedure } from "../trpc";

export const profileRouter = router({
  me: protectedProcedure.query(({ ctx }) => ctx.profile),

  update: protectedProcedure
    .input(z.object({ name: z.string().min(1).optional() }))
    .mutation(({ ctx, input }) =>
      ctx.prisma.profile.update({
        where: { id: ctx.profile.id },
        data: input,
      })
    ),

  clients: trainerProcedure.query(({ ctx }) =>
    ctx.prisma.profile.findMany({
      where: { trainerRelation: { trainerId: ctx.profile.id } },
      orderBy: { name: "asc" },
    })
  ),

  clientDetail: trainerProcedure
    .input(z.object({ clientId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.prisma.profile.findFirst({
        where: {
          id: input.clientId,
          trainerRelation: { trainerId: ctx.profile.id },
        },
        include: {
          weightLogs: { orderBy: { loggedAt: "desc" }, take: 10 },
          measurements: { orderBy: { loggedAt: "desc" }, take: 5 },
        },
      })
    ),
});
