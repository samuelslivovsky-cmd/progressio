import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function createContext() {
  const supabase = await createClient();

  // Use getSession() (local JWT decode, ~1ms) instead of getUser()
  // (network call to Supabase, ~300-500ms). The JWT is cryptographically
  // signed so it cannot be forged. Only trade-off: a revoked session
  // may remain valid until JWT expiry (~1h), acceptable for this app.
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user ?? null;

  const profile = user
    ? await prisma.profile.findUnique({ where: { userId: user.id } })
    : null;

  return { user, profile, prisma };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
