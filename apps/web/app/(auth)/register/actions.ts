"use server";

import { redirect } from "next/navigation";
import { registerUser } from "@/lib/auth/register";

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  role: "TRAINER" | "CLIENT";
}) {
  const result = await registerUser(data);
  if (!result.ok) {
    return { error: result.error };
  }

  // registerUser already set the auth cookies. Redirect to the role landing.
  redirect(data.role === "TRAINER" ? "/trainer" : "/client");
}
