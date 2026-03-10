import { requireAuth } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function DashboardRedirectPage() {
  const { profile } = await requireAuth();

  if (profile.role === "TRAINER") redirect("/trainer");
  redirect("/client");
}
