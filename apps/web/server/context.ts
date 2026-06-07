import { prisma } from "@progressio/db";
import { getCurrentUser } from "@/lib/auth/session";
import { getCachedProfile } from "@/lib/cache";

export async function createContext() {
  const authUser = await getCurrentUser();

  // Keep `ctx.user` backward-compatible with the previous NextAuth shape:
  // routers / procedures read `ctx.user.id`. We also expose profileId + role
  // from the verified access token.
  const user = authUser
    ? {
        id: authUser.userId,
        profileId: authUser.profileId,
        role: authUser.role,
      }
    : null;

  const profile = authUser ? await getCachedProfile(authUser.userId) : null;

  return { user, profile, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
