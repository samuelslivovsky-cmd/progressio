import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { router, clientProcedure } from "../trpc";
import { rateLimit } from "@/lib/rate-limit";

// Daily caps for AI/Claude-backed procedures, keyed per profile.
const AI_WINDOW_SEC = 86_400; // 1 day
const AI_DAILY_LIMIT_FREE = 5;
const AI_DAILY_LIMIT_PAID = 50;

// Reusable middleware for Claude-API-calling procedures: enforces a tiered
// per-profile daily message limit. Paid AI tiers get a higher cap.
const aiRateLimited = clientProcedure.use(async ({ ctx, next }) => {
  const isPaid = ctx.profile.subscriptionTier !== "FREE";
  const { ok } = await rateLimit({
    key: `ai-chat:profile:${ctx.profile.id}`,
    limit: isPaid ? AI_DAILY_LIMIT_PAID : AI_DAILY_LIMIT_FREE,
    windowSec: AI_WINDOW_SEC,
  });
  if (!ok) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Dosiahol si denný limit AI správ.",
    });
  }
  return next({ ctx });
});

export const sendMessage = aiRateLimited
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
