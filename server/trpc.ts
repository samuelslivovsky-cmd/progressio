import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user || !ctx.profile) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({ ctx: { ...ctx, user: ctx.user, profile: ctx.profile } });
});

export const trainerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.profile.role !== "TRAINER") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

export const clientProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.profile.role !== "CLIENT") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});
