import { getCurrentUser } from "@/lib/auth/session";
import { getCachedProfile } from "@/lib/cache";
import { LandingPage } from "@/components/landing/landing-page";

export default async function RootPage() {
  const user = await getCurrentUser();

  let role: "TRAINER" | "CLIENT" | null = null;
  if (user) {
    const profile = await getCachedProfile(user.userId);
    if (profile) role = profile.role;
  }

  return <LandingPage role={role} />;
}
