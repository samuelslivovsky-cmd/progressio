"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { registerUser } from "@/lib/auth/register";
import { getClientIp } from "@/lib/auth/ip";
import { rateLimit } from "@/lib/rate-limit";

export async function registerAction(data: {
  name: string;
  email: string;
  password: string;
  role: "TRAINER" | "CLIENT";
}) {
  let role: "TRAINER" | "CLIENT" = "CLIENT";

  // Everything except the final redirect must live inside try/catch — Next's
  // redirect() throws a control-flow signal, so it MUST stay outside.
  try {
    const h = await headers();
    const ip = getClientIp(h);
    const userAgent = h.get("user-agent");

    // Same IP rate limit as the API route (register: 5 / 3600s).
    const limited = await rateLimit({
      key: `register:ip:${ip ?? "unknown"}`,
      limit: 5,
      windowSec: 3600,
    });
    if (!limited.ok) {
      return { error: "Príliš veľa pokusov, skús neskôr." };
    }

    // registerUser validates internally (shared registerSchema) + normalizes.
    const result = await registerUser(data, { ip, userAgent });
    if (!result.ok) {
      return { error: result.error };
    }

    role = data.role;
  } catch (err) {
    console.error("[register] action failed", err);
    return { error: "Služba je dočasne nedostupná." };
  }

  // registerUser already set the auth cookies. Redirect to the role landing.
  redirect(role === "TRAINER" ? "/trainer" : "/client");
}
