import { prisma, type Profile } from "@progressio/db";
import { redis } from "@/lib/redis";

// Short-lived Redis cache for the user's Profile, keyed by userId. Used on the
// hot path (e.g. enriching the tRPC context) to avoid a DB round-trip per
// request while the access token is valid.

const PROFILE_TTL = 300; // seconds
const profileKey = (userId: string) => `profile:${userId}`;

/** Get a user's Profile from cache, falling back to the DB (and caching it). */
export async function getCachedProfile(
  userId: string,
): Promise<Profile | null> {
  const cached = await redis.get(profileKey(userId));
  if (cached) {
    return JSON.parse(cached) as Profile;
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (profile) {
    await redis.set(
      profileKey(userId),
      JSON.stringify(profile),
      "EX",
      PROFILE_TTL,
    );
  }
  return profile;
}

/** Invalidate the cached Profile for a user (call after profile updates). */
export async function invalidateProfile(userId: string): Promise<void> {
  await redis.del(profileKey(userId));
}
