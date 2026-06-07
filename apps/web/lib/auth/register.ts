import { prisma, Role } from "@progressio/db";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/tokens";
import { issueRefresh } from "@/lib/auth/token-store";
import { setAuthCookies } from "@/lib/auth/cookies";
import { registerSchema } from "@/lib/auth/validation";
import type { AuthUser } from "@/lib/auth/config";

export type RegisterResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

/**
 * Create a new User + Profile, issue auth tokens, and set the auth cookies.
 * Shared by the register server action and the POST /api/auth/register route.
 *
 * Input is validated INTERNALLY with `registerSchema` (the same schema the API
 * route uses), so this function can never be called with unvalidated data — the
 * email is normalized (trimmed + lowercased) and the password policy enforced
 * here regardless of caller. Returns `{ ok: false }` (no cookies set) on
 * invalid input or if the email is already taken.
 */
export async function registerUser(
  input: unknown,
  meta?: { userAgent?: string | null; ip?: string | null },
): Promise<RegisterResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Neplatné údaje." };
  }
  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    return { ok: false, error: "Účet s týmto emailom už existuje." };
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const profile = await prisma.profile.create({
    data: {
      userId: user.id,
      name,
      email,
      role: role === "TRAINER" ? Role.TRAINER : Role.CLIENT,
    },
  });

  const authUser: AuthUser = {
    userId: user.id,
    profileId: profile.id,
    role: profile.role,
  };

  const access = await signAccessToken(authUser);
  const { raw: refresh } = await issueRefresh({
    user: authUser,
    userAgent: meta?.userAgent ?? null,
    ip: meta?.ip ?? null,
  });
  await setAuthCookies(access, refresh);

  return { ok: true, user: authUser };
}
