import { describe, it, expect, beforeEach, vi } from "vitest";
import type { AuthUser } from "@/lib/auth/config";

// End-to-end auth lifecycle: access-token sign/verify + stateful refresh
// rotation with reuse-detection, against an ioredis-mock + in-memory prisma.

vi.mock("@/lib/redis", async () => {
  const RedisMock = (await import("ioredis-mock")).default;
  return { redis: new RedisMock() };
});

type Session = {
  id: string;
  userId: string;
  familyId: string;
  userAgent: string | null;
  ip: string | null;
  expiresAt: Date;
  revokedAt: Date | null;
};

const sessions = new Map<string, Session>();

function matchWhere(s: Session, where: Record<string, unknown>): boolean {
  for (const [k, v] of Object.entries(where)) {
    if (k === "revokedAt") {
      if (v === null && s.revokedAt !== null) return false;
    } else if ((s as Record<string, unknown>)[k] !== v) {
      return false;
    }
  }
  return true;
}

vi.mock("@progressio/db", () => ({
  prisma: {
    refreshSession: {
      create: vi.fn(async ({ data }: { data: Session }) => {
        const row: Session = { revokedAt: null, ...data };
        sessions.set(row.id, row);
        return row;
      }),
      findUnique: vi.fn(
        async ({
          where,
          select,
        }: {
          where: { id: string };
          select?: Record<string, boolean>;
        }) => {
          const row = sessions.get(where.id);
          if (!row) return null;
          if (select) {
            const out: Record<string, unknown> = {};
            for (const k of Object.keys(select)) out[k] = (row as Record<string, unknown>)[k];
            return out;
          }
          return row;
        }
      ),
      findMany: vi.fn(async ({ where }: { where: Record<string, unknown> }) =>
        [...sessions.values()].filter((s) => matchWhere(s, where))
      ),
      updateMany: vi.fn(
        async ({
          where,
          data,
        }: {
          where: Record<string, unknown>;
          data: Partial<Session>;
        }) => {
          let count = 0;
          for (const s of sessions.values()) {
            if (matchWhere(s, where)) {
              Object.assign(s, data);
              count++;
            }
          }
          return { count };
        }
      ),
    },
  },
}));

const user: AuthUser = {
  userId: "u-flow",
  profileId: "p-flow",
  role: "TRAINER",
};

beforeEach(async () => {
  sessions.clear();
  const { redis } = await import("@/lib/redis");
  await redis.flushall();
});

describe("auth flow: access token + refresh rotation", () => {
  it("logs in (sign+verify access), then rotates refresh successfully", async () => {
    const { signAccessToken, verifyAccessToken } = await import("@/lib/auth/jwt");
    const { issueRefresh, rotateRefresh } = await import("@/lib/auth/token-store");

    const access = await signAccessToken(user);
    expect(await verifyAccessToken(access)).toEqual(user);

    const issued = await issueRefresh({ user });
    const rotated = await rotateRefresh(issued.raw);
    expect(rotated).not.toBeNull();
    expect(rotated!.user).toEqual(user);

    // New access token can still be minted and verified for the rotated user.
    const access2 = await signAccessToken(rotated!.user);
    expect(await verifyAccessToken(access2)).toEqual(user);
  });

  it("reuse-detection: replayed old refresh kills the whole family", async () => {
    const { issueRefresh, rotateRefresh } = await import("@/lib/auth/token-store");
    const { redis } = await import("@/lib/redis");

    const issued = await issueRefresh({ user });
    const rotated = await rotateRefresh(issued.raw);
    expect(rotated).not.toBeNull();

    // Attacker replays the original (already-rotated) token.
    expect(await rotateRefresh(issued.raw)).toBeNull();
    expect(await redis.get(`family:${issued.familyId}`)).toBe("revoked");

    // The legit rotated token is now dead too (family revoked).
    expect(await rotateRefresh(rotated!.raw)).toBeNull();
  });
});
