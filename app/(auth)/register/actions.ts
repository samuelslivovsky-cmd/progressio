"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  role: "TRAINER" | "CLIENT";
}) {
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });
  if (existing) {
    return { error: "Účet s týmto emailom už existuje." };
  }

  const hashedPassword = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });

  await prisma.profile.create({
    data: {
      userId: user.id,
      name: data.name,
      email: data.email,
      role: data.role,
    },
  });

  await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirectTo: data.role === "TRAINER" ? "/trainer" : "/client",
  });
}
