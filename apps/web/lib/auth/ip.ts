// Client IP extraction. Edge-safe (no node:crypto / ioredis / prisma imports).
//
// Trust model: our own reverse proxy (Caddy) overwrites `X-Real-IP` with the
// real peer address and appends the peer to `X-Forwarded-For`. We therefore
// prefer `x-real-ip`; if absent we take the RIGHT-MOST `x-forwarded-for` entry,
// which is the hop appended by the proxy closest to us (the left-most entries
// are client-controllable and must not be trusted).

/** Best-effort trusted client IP from request headers, or null. */
export function getClientIp(h: Headers): string | null {
  const realIp = h.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();

  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 0) return parts[parts.length - 1] ?? null;
  }

  return null;
}
