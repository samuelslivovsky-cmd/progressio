import { registerUser } from "@/lib/auth/register";
import { requestMeta, withRedisFailClosed, SERVICE_UNAVAILABLE, serviceUnavailableResponse } from "../_shared";
import { rateLimitByIp, tooManyResponse } from "@/lib/rate-limit";

export const runtime = "nodejs";

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

  // Validation now lives inside registerUser (shared registerSchema). Pass the
  // raw JSON through — registerUser normalizes the email and enforces policy.
  const meta = requestMeta(req);
  const result = await withRedisFailClosed(() => registerUser(body, meta));
  if (result === SERVICE_UNAVAILABLE) return serviceUnavailableResponse();
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 409 });
  }

  return Response.json({ ok: true });
}
