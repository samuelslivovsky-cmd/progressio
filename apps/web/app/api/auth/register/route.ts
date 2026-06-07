import { z } from "zod";
import { registerUser } from "@/lib/auth/register";
import { requestMeta } from "../_shared";
import { rateLimitByIp, tooManyResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(1),
  role: z.enum(["TRAINER", "CLIENT"]),
});

export async function POST(req: Request) {
  // Rate limit by IP: 5 / 3600s.
  const ipLimit = await rateLimitByIp(req, {
    scope: "register",
    limit: 5,
    windowSec: 3600,
  });
  if (!ipLimit.ok) return tooManyResponse(ipLimit.resetSec);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  const meta = requestMeta(req);
  const result = await registerUser(parsed.data, meta);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 409 });
  }

  return Response.json({ ok: true });
}
