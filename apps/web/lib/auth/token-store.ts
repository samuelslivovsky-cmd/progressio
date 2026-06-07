import { randomUUID } from "node:crypto";
import { prisma } from "@progressio/db";
import { redis } from "@/lib/redis";
import { REFRESH_TOKEN_TTL, type AuthUser } from "./config";
import { generateRefreshToken, sha256 } from "./tokens";

// Stateful refresh-token store with rotation + reuse detection.
//
// Redis keys:
//   refresh:{tokenId} -> JSON RefreshRecord   (TTL = REFRESH_TOKEN_TTL)
//   family:{familyId} -> "valid" | "revoked"  (TTL = REFRESH_TOKEN_TTL)
//
// A family groups all rotations of one login session. On each refresh the old
// token is deleted and a new one issued in the SAME family. If a deleted
// (already-rotated) token is presented again while its family is still valid,
// that is a replay → the whole family is revoked.

type RefreshRecord = {
  userId: string;
  profileId: string;
  role: string;
  familyId: string;
  secretHash: string;
  expiresAt: number; // unix seconds
};

const refreshKey = (tokenId: string) => `refresh:${tokenId}`;
const familyKey = (familyId: string) => `family:${familyId}`;

function recordToUser(rec: RefreshRecord): AuthUser {
  return { userId: rec.userId, profileId: rec.profileId, role: rec.role };
}

/** Split a raw refresh token into its tokenId and secret parts. */
function parseRaw(raw: string): { tokenId: string; secret: string } | null {
  const idx = raw.indexOf(".");
  if (idx <= 0 || idx === raw.length - 1) return null;
  return { tokenId: raw.slice(0, idx), secret: raw.slice(idx + 1) };
}

/**
 * Issue a fresh refresh token: writes the Redis record + family marker and
 * creates a RefreshSession DB row. If `familyId` is provided the token joins
 * that family (used by rotation); otherwise a new family is started.
 */
export async function issueRefresh(args: {
  user: AuthUser;
  familyId?: string;
  userAgent?: string | null;
  ip?: string | null;
}): Promise<{ raw: string; tokenId: string; familyId: string }> {
  const { user } = args;
  const familyId = args.familyId ?? randomUUID();
  const { tokenId, secret, raw } = generateRefreshToken();
  const expiresAtSec = Math.floor(Date.now() / 1000) + REFRESH_TOKEN_TTL;
  const expiresAt = new Date(expiresAtSec * 1000);

  const record: RefreshRecord = {
    userId: user.userId,
    profileId: user.profileId,
    role: user.role,
    familyId,
    secretHash: sha256(secret),
    expiresAt: expiresAtSec,
  };

  await redis
    .multi()
    .set(refreshKey(tokenId), JSON.stringify(record), "EX", REFRESH_TOKEN_TTL)
    .set(familyKey(familyId), "valid", "EX", REFRESH_TOKEN_TTL)
    .exec();

  await prisma.refreshSession.create({
    data: {
      id: tokenId,
      userId: user.userId,
      familyId,
      userAgent: args.userAgent ?? null,
      ip: args.ip ?? null,
      expiresAt,
    },
  });

  return { raw, tokenId, familyId };
}

/**
 * Rotate a refresh token. On success deletes the presented token, marks its
 * RefreshSession revoked, and issues a new token in the same family.
 * Returns null if the token is invalid/expired. If a reused (already-rotated)
 * token is detected, the entire family is revoked and null is returned.
 */
export async function rotateRefresh(
  raw: string,
  meta?: { userAgent?: string | null; ip?: string | null },
): Promise<{ user: AuthUser; raw: string } | null> {
  const parsed = parseRaw(raw);
  if (!parsed) return null;
  const { tokenId, secret } = parsed;

  const json = await redis.get(refreshKey(tokenId));
  if (!json) {
    // Token not found. If we can recover the family from the DB row and that
    // family is still valid → this is a replay of an already-rotated token.
    const row = await prisma.refreshSession.findUnique({
      where: { id: tokenId },
      select: { familyId: true },
    });
    if (row) {
      const familyState = await redis.get(familyKey(row.familyId));
      if (familyState === "valid") {
        await revokeFamily(row.familyId);
      }
    }
    return null;
  }

  const record = JSON.parse(json) as RefreshRecord;

  // Family must still be valid (defends against TOCTOU after a revoke).
  const familyState = await redis.get(familyKey(record.familyId));
  if (familyState !== "valid") {
    await revokeFamily(record.familyId);
    return null;
  }

  // Verify the presented secret.
  if (sha256(secret) !== record.secretHash) {
    // Wrong secret for a live token → treat as compromise, revoke family.
    await revokeFamily(record.familyId);
    return null;
  }

  // Valid: rotate. Delete old key, mark old row revoked, issue new in family.
  await redis.del(refreshKey(tokenId));
  await prisma.refreshSession.updateMany({
    where: { id: tokenId, revokedAt: null },
    data: { revokedAt: new Date() },
  });

  const user = recordToUser(record);
  const issued = await issueRefresh({
    user,
    familyId: record.familyId,
    userAgent: meta?.userAgent ?? null,
    ip: meta?.ip ?? null,
  });

  return { user, raw: issued.raw };
}

/** Revoke a single refresh token (logout of the current device). */
export async function revokeRefresh(raw: string): Promise<void> {
  const parsed = parseRaw(raw);
  if (!parsed) return;
  const { tokenId } = parsed;
  await redis.del(refreshKey(tokenId));
  await prisma.refreshSession.updateMany({
    where: { id: tokenId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Revoke an entire token family (reuse detected, or full session kill). */
export async function revokeFamily(familyId: string): Promise<void> {
  await redis.set(familyKey(familyId), "revoked", "EX", REFRESH_TOKEN_TTL);

  // Delete all live member keys for this family.
  const rows = await prisma.refreshSession.findMany({
    where: { familyId },
    select: { id: true },
  });
  if (rows.length > 0) {
    const keys = rows.map((r: { id: string }) => refreshKey(r.id));
    await redis.del(...keys);
  }

  await prisma.refreshSession.updateMany({
    where: { familyId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

/** Revoke every active refresh session for a user (logout all devices). */
export async function revokeAllForUser(userId: string): Promise<void> {
  const rows = await prisma.refreshSession.findMany({
    where: { userId, revokedAt: null },
    select: { id: true, familyId: true },
  });

  const familyIds = new Set<string>();
  const keys: string[] = [];
  for (const row of rows as { id: string; familyId: string }[]) {
    familyIds.add(row.familyId);
    keys.push(refreshKey(row.id));
  }

  const multi = redis.multi();
  for (const familyId of familyIds) {
    multi.set(familyKey(familyId), "revoked", "EX", REFRESH_TOKEN_TTL);
  }
  if (keys.length > 0) multi.del(...keys);
  await multi.exec();

  await prisma.refreshSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
