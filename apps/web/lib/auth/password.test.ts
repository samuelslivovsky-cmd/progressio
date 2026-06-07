import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  isBcryptHash,
} from "@/lib/auth/password";

describe("hashPassword / verifyPassword", () => {
  it("produces an argon2id PHC string", async () => {
    const hash = await hashPassword("correct horse battery staple");
    expect(hash.startsWith("$argon2id$")).toBe(true);
  });

  it("verifies the correct password", async () => {
    const pw = "s3cret-Passw0rd!";
    const hash = await hashPassword(pw);
    expect(await verifyPassword(hash, pw)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("right-password");
    expect(await verifyPassword(hash, "wrong-password")).toBe(false);
  });

  it("returns false (does not throw) for a malformed hash", async () => {
    await expect(
      verifyPassword("not-a-valid-hash", "anything")
    ).resolves.toBe(false);
  });
});

describe("isBcryptHash", () => {
  it("is true for $2a / $2b / $2y bcrypt prefixes", () => {
    expect(isBcryptHash("$2a$10$" + "x".repeat(53))).toBe(true);
    expect(isBcryptHash("$2b$10$" + "x".repeat(53))).toBe(true);
    expect(isBcryptHash("$2y$10$" + "x".repeat(53))).toBe(true);
  });

  it("is false for an argon2 hash", () => {
    expect(isBcryptHash("$argon2id$v=19$m=19456,t=2,p=1$abc$def")).toBe(false);
  });
});
