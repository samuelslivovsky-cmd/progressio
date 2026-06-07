import { cookies } from "next/headers";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_TTL,
  COOKIE_SECURE,
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
  REFRESH_TOKEN_TTL,
} from "./config";

// httpOnly cookie transport for the access + refresh tokens. Uses the Next.js
// cookies() store, so these run only in route handlers / server actions.

/** Set both auth cookies (after login or a refresh rotation). */
export async function setAuthCookies(
  access: string,
  refresh: string,
): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_COOKIE_NAME, access, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_TTL,
  });

  store.set(REFRESH_COOKIE_NAME, refresh, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "strict",
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_TTL,
  });
}

/** Clear both auth cookies (logout). */
export async function clearAuthCookies(): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_COOKIE_NAME, "", {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  store.set(REFRESH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: "strict",
    path: REFRESH_COOKIE_PATH,
    maxAge: 0,
  });
}

/** Read the raw access-token cookie value, or null. */
export async function readAccessCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(ACCESS_COOKIE_NAME)?.value ?? null;
}

/** Read the raw refresh-token cookie value, or null. */
export async function readRefreshCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(REFRESH_COOKIE_NAME)?.value ?? null;
}
