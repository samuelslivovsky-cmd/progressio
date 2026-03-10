import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createContext() {
  const session = await auth();
  const user = session?.user ?? null;

  const profile = user?.id
    ? await prisma.profile.findUnique({ where: { userId: user.id } })
    : null;

  return { user, profile, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
