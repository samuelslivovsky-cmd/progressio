import { describe, it, expect } from "vitest";
import { SignJWT } from "jose";
import { signAccessToken, verifyAccessToken } from "@/lib/auth/jwt";
import type { AuthUser } from "@/lib/auth/config";

const SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);

const user: AuthUser = {
  userId: "user-1",
  profileId: "profile-1",
  role: "TRAINER",
};

describe("signAccessToken / verifyAccessToken", () => {
  it("round-trips a signed token back to the AuthUser", async () => {
    const token = await signAccessToken(user);
    const result = await verifyAccessToken(token);
    expect(result).toEqual(user);
  });

  it("returns null for a tampered signature", async () => {
    const token = await signAccessToken(user);
    // Flip the last char of the signature segment.
    const parts = token.split(".");
    const sig = parts[2];
    const tamperedChar = sig[sig.length - 1] === "A" ? "B" : "A";
    parts[2] = sig.slice(0, -1) + tamperedChar;
    const result = await verifyAccessToken(parts.join("."));
    expect(result).toBeNull();
  });

  it("returns null for an expired token", async () => {
    const now = Math.floor(Date.now() / 1000);
    const expired = await new SignJWT({
      profileId: user.profileId,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(user.userId)
      .setIssuedAt(now - 3600)
      .setExpirationTime(now - 1800)
      .sign(SECRET);
    const result = await verifyAccessToken(expired);
    expect(result).toBeNull();
  });

  it("rejects a non-HS256 token (alg pinning) — e.g. alg: none", async () => {
    // Hand-craft an unsigned alg:none token: header.payload. (empty sig)
    const header = Buffer.from(
      JSON.stringify({ alg: "none", typ: "JWT" })
    ).toString("base64url");
    const payload = Buffer.from(
      JSON.stringify({
        sub: user.userId,
        profileId: user.profileId,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + 3600,
      })
    ).toString("base64url");
    const noneToken = `${header}.${payload}.`;
    const result = await verifyAccessToken(noneToken);
    expect(result).toBeNull();
  });

  it("returns null when required claims are missing", async () => {
    const now = Math.floor(Date.now() / 1000);
    // Sign a valid HS256 token but omit profileId/role.
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setSubject(user.userId)
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(SECRET);
    const result = await verifyAccessToken(token);
    expect(result).toBeNull();
  });
});
