import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
  });
  if (!profile) redirect("/login");

  return { session, profile };
}

export async function requireTrainer() {
  const { session, profile } = await requireAuth();
  if (profile.role !== "TRAINER") redirect("/client");
  return { session, profile };
}

export async function requireClient() {
  const { session, profile } = await requireAuth();
  if (profile.role !== "CLIENT") redirect("/trainer");
  return { session, profile };
}
