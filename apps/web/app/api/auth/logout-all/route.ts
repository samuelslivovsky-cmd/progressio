import { getCurrentUser } from "@/lib/auth/session";
import { revokeAllForUser } from "@/lib/auth/token-store";
import { clearAuthCookies } from "@/lib/auth/cookies";

export const runtime = "nodejs";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  await revokeAllForUser(user.userId);
  await clearAuthCookies();
  return Response.json({ ok: true });
}
