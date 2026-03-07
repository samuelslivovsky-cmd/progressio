import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { LandingPage } from "@/components/landing/landing-page";

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let role: "TRAINER" | "CLIENT" | null = null;
  if (user) {
    const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
    if (profile) role = profile.role;
  }

  return <LandingPage role={role} />;
}
