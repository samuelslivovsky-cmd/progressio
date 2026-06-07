import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@progressio/db";
import {
  verifyPassword,
  hashPassword,
  isBcryptHash,
} from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/tokens";
import { issueRefresh } from "@/lib/auth/token-store";
import { setAuthCookies } from "@/lib/auth/cookies";
import type { AuthUser } from "@/lib/auth/config";
import { requestMeta } from "../_shared";
import { rateLimit, rateLimitByIp, tooManyResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  // Rate limit by IP first (cheap, no body needed): 10 / 60s.
  const ipLimit = await rateLimitByIp(req, {
    scope: "login",
    limit: 10,
    windowSec: 60,
  });
  if (!ipLimit.ok) return tooManyResponse(ipLimit.resetSec);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }
  const { email, password } = parsed.data;

  // Rate limit by email (normalized): 5 / 900s.
  const emailLimit = await rateLimit({
    key: `login:email:${email.trim().toLowerCase()}`,
    limit: 5,
    windowSec: 900,
  });
  if (!emailLimit.ok) return tooManyResponse(emailLimit.resetSec);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.password) {
    return Response.json(
      { error: "Nesprávny email alebo heslo." },
      { status: 401 },
    );
  }

  // Transitional dual-path password verification (bcrypt -> argon2).
  // Legacy users created under the old NextAuth/bcryptjs system still carry
  // bcrypt hashes. We verify those with bcrypt and lazily re-hash to argon2id
  // on successful login. New users always use argon2 (verifyPassword).
  // TODO: remove this dual-path once all bcrypt hashes have been migrated.
  let valid: boolean;
  if (isBcryptHash(user.password)) {
    valid = await bcrypt.compare(password, user.password);
    if (valid) {
      // Best-effort migration: never block or fail the login if this throws.
      try {
        const migrated = await hashPassword(password);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: migrated },
        });
      } catch (err) {
        console.error("[login] argon2 re-hash migration failed", err);
      }
    }
  } else {
    valid = await verifyPassword(user.password, password);
  }
  if (!valid) {
    return Response.json(
      { error: "Nesprávny email alebo heslo." },
      { status: 401 },
    );
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  if (!profile) {
    return Response.json(
      { error: "Nesprávny email alebo heslo." },
      { status: 401 },
    );
  }

  const authUser: AuthUser = {
    userId: user.id,
    profileId: profile.id,
    role: profile.role,
  };

  const access = await signAccessToken(authUser);
  const meta = requestMeta(req);
  const { raw: refresh } = await issueRefresh({
    user: authUser,
    userAgent: meta.userAgent,
    ip: meta.ip,
  });
  await setAuthCookies(access, refresh);

  return Response.json({ ok: true, user: { id: user.id, role: profile.role } });
}
