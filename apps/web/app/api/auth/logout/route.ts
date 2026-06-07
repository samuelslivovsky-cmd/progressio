import { revokeRefresh } from "@/lib/auth/token-store";
import { clearAuthCookies, readRefreshCookie } from "@/lib/auth/cookies";

export const runtime = "nodejs";

export async function POST() {
  const raw = await readRefreshCookie();
  if (raw) {
    await revokeRefresh(raw);
  }
  await clearAuthCookies();
  return Response.json({ ok: true });
}
