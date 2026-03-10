import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { LandingPage } from "@/components/landing/landing-page";

export default async function RootPage() {
  const session = await auth();

  let role: "TRAINER" | "CLIENT" | null = null;
  if (session?.user) {
    const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } });
    if (profile) role = profile.role;
  }

  return <LandingPage role={role} />;
}
