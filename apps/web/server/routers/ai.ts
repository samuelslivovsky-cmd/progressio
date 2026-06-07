import { z } from "zod";
import { router, clientProcedure } from "../trpc";

export const sendMessage = clientProcedure
  .input(z.object({ content: z.string().min(1).max(10000) }))
  .mutation(({ ctx, input }) =>
    ctx.prisma.aiChatMessage.create({
      data: {
        clientId: ctx.profile.id,
        role: "user",
        content: input.content,
      },
    })
  );

export const getHistory = clientProcedure
  .input(z.object({ limit: z.number().min(1).max(200).default(50) }).optional())
  .query(({ ctx, input }) =>
    ctx.prisma.aiChatMessage.findMany({
      where: { clientId: ctx.profile.id },
      orderBy: { createdAt: "asc" },
      take: input?.limit ?? 50,
    })
  );

export const getWeeklySummary = clientProcedure
  .input(
    z
      .object({
        weekStart: z.date().optional(),
        limit: z.number().min(1).max(20).default(10),
      })
      .optional()
  )
  .query(({ ctx, input }) =>
    ctx.prisma.weeklySummary.findMany({
      where: {
        clientId: ctx.profile.id,
        ...(input?.weekStart ? { weekStart: input.weekStart } : {}),
      },
      orderBy: { weekStart: "desc" },
      take: input?.limit ?? 10,
    })
  );

export const aiRouter = router({
  sendMessage,
  getHistory,
  getWeeklySummary,
});
