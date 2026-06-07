// Shared helpers for the auth route handlers.

/** Extract client metadata (User-Agent + best-effort IP) from a request. */
export function requestMeta(req: Request): {
  userAgent: string | null;
  ip: string | null;
} {
  const userAgent = req.headers.get("user-agent");
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded
    ? (forwarded.split(",")[0]?.trim() ?? null)
    : req.headers.get("x-real-ip");
  return { userAgent: userAgent ?? null, ip: ip ?? null };
}
