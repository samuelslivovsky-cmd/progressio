import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

export async function createContext(_opts: FetchCreateContextFnOptions) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const profile = user
    ? await prisma.profile.findUnique({ where: { userId: user.id } })
    : null;

  return { user, profile, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
