import { prisma, Role } from "@progressio/db";
import { hashPassword } from "@/lib/auth/password";
import { signAccessToken } from "@/lib/auth/tokens";
import { issueRefresh } from "@/lib/auth/token-store";
import { setAuthCookies } from "@/lib/auth/cookies";
import type { AuthUser } from "@/lib/auth/config";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: "TRAINER" | "CLIENT";
};

export type RegisterResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string };

/**
 * Create a new User + Profile, issue auth tokens, and set the auth cookies.
 * Shared by the register server action and the POST /api/auth/register route.
 * Returns `{ ok: false }` (no cookies set) if the email is already taken.
 */
export async function registerUser(
  input: RegisterInput,
  meta?: { userAgent?: string | null; ip?: string | null },
): Promise<RegisterResult> {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  });
  if (existing) {
    return { ok: false, error: "Účet s týmto emailom už existuje." };
  }

  const hashedPassword = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
    },
  });

  const profile = await prisma.profile.create({
    data: {
      userId: user.id,
      name: input.name,
      email: input.email,
      role: input.role === "TRAINER" ? Role.TRAINER : Role.CLIENT,
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
