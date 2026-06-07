import { describe, it, expect, beforeEach, vi } from "vitest";
import type { AuthUser } from "@/lib/auth/config";

// --- Mock Redis with ioredis-mock (shared instance) -----------------------
vi.mock("@/lib/redis", async () => {
  const RedisMock = (await import("ioredis-mock")).default;
  return { redis: new RedisMock() };
});

// --- In-memory prisma.refreshSession stub ---------------------------------
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
      findMany: vi.fn(
        async ({ where }: { where: Record<string, unknown> }) => {
          return [...sessions.values()].filter((s) => matchWhere(s, where));
        }
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
  userId: "user-1",
  profileId: "profile-1",
  role: "CLIENT",
};

async function getStore() {
  return import("@/lib/auth/token-store");
}

async function getRedis() {
  return (await import("@/lib/redis")).redis;
}

beforeEach(async () => {
  sessions.clear();
  const redis = await getRedis();
  await redis.flushall();
});

describe("token-store issue + rotate", () => {
  it("issues a token and stores the redis record + family marker", async () => {
    const { issueRefresh } = await getStore();
    const redis = await getRedis();
    const { raw, tokenId, familyId } = await issueRefresh({ user });

    expect(raw).toContain(".");
    expect(await redis.get(`refresh:${tokenId}`)).toBeTruthy();
    expect(await redis.get(`family:${familyId}`)).toBe("valid");
    expect(sessions.get(tokenId)?.revokedAt).toBeNull();
  });

  it("rotates a valid token, returning a new raw and revoking the old", async () => {
    const { issueRefresh, rotateRefresh } = await getStore();
    const redis = await getRedis();
    const issued = await issueRefresh({ user });
    const oldTokenId = issued.tokenId;

    const rotated = await rotateRefresh(issued.raw);
    expect(rotated).not.toBeNull();
    expect(rotated!.user).toEqual(user);
    expect(rotated!.raw).not.toBe(issued.raw);

    // Old redis key gone; old DB row revoked.
    expect(await redis.get(`refresh:${oldTokenId}`)).toBeNull();
    expect(sessions.get(oldTokenId)?.revokedAt).not.toBeNull();
  });
});

describe("reuse detection (highest value)", () => {
  it("replaying the OLD raw after rotation returns null AND revokes the family", async () => {
    const { issueRefresh, rotateRefresh } = await getStore();
    const redis = await getRedis();

    const issued = await issueRefresh({ user });
    const familyId = issued.familyId;

    // First rotation: succeeds, produces a new live token.
    const rotated = await rotateRefresh(issued.raw);
    expect(rotated).not.toBeNull();

    // Replay the ORIGINAL (already-rotated) token → reuse.
    const replay = await rotateRefresh(issued.raw);
    expect(replay).toBeNull();

    // Whole family is now revoked...
    expect(await redis.get(`family:${familyId}`)).toBe("revoked");

    // ...so even the legitimately-rotated token now dies.
    const afterReuse = await rotateRefresh(rotated!.raw);
    expect(afterReuse).toBeNull();
  });
});
