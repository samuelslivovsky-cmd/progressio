import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getCachedProfile } from "@/lib/cache";

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = await getCachedProfile(user.userId);
  if (!profile) redirect("/login");

  return { user, profile };
}

export async function requireTrainer() {
  const { user, profile } = await requireAuth();
  if (profile.role !== "TRAINER") redirect("/client");
  return { user, profile };
}

export async function requireClient() {
  const { user, profile } = await requireAuth();
  if (profile.role !== "CLIENT") redirect("/trainer");
  return { user, profile };
}
