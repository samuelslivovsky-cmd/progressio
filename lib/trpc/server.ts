import { createCallerFactory } from "@/server/trpc";
import { appRouter } from "@/server/routers";
import { createContext } from "@/server/context";

const createCaller = createCallerFactory(appRouter);

export async function trpcServer() {
  const ctx = await createContext();
  return createCaller(ctx);
}
