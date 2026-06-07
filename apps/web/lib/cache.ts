import { prisma, type Profile } from "@progressio/db";
import { redis } from "@/lib/redis";

// Short-lived Redis cache for the user's Profile, keyed by userId. Used on the
// hot path (e.g. enriching the tRPC context) to avoid a DB round-trip per
// request while the access token is valid.
//
// The cache is BEST-EFFORT: every Redis touch is wrapped in try/catch so a
// Redis outage degrades to a direct DB read instead of throwing. Profile data
// is non-sensitive for issuance purposes, so fail-soft is acceptable here
// (unlike token issuance, which fails closed — see the auth routes).

const PROFILE_TTL = 300; // seconds
const profileKey = (userId: string) => `profile:${userId}`;

/** Get a user's Profile from cache, falling back to the DB (and caching it). */
export async function getCachedProfile(
  userId: string,
): Promise<Profile | null> {
  // Best-effort cache read.
  try {
    const cached = await redis.get(profileKey(userId));
    if (cached) {
      return JSON.parse(cached) as Profile;
    }
  } catch (err) {
    console.error("[cache] getCachedProfile read failed", err);
  }

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (profile) {
    // Best-effort cache write.
    try {
      await redis.set(
        profileKey(userId),
        JSON.stringify(profile),
        "EX",
        PROFILE_TTL,
      );
    } catch (err) {
      console.error("[cache] getCachedProfile write failed", err);
    }
  }
  return profile;
}

/** Invalidate the cached Profile for a user (call after profile updates). */
export async function invalidateProfile(userId: string): Promise<void> {
  try {
    await redis.del(profileKey(userId));
  } catch (err) {
    console.error("[cache] invalidateProfile failed", err);
  }
}
