import { describe, it, expect, afterEach, vi } from "vitest";

// config.ts reads NODE_ENV at module-load to decide cookie naming/Secure.
// We reset the module registry and re-set NODE_ENV before each dynamic import.
const ORIGINAL_NODE_ENV = process.env.NODE_ENV;

async function loadConfigWith(nodeEnv: string) {
  vi.resetModules();
  process.env.NODE_ENV = nodeEnv;
  return import("@/lib/auth/config");
}

afterEach(() => {
  process.env.NODE_ENV = ORIGINAL_NODE_ENV;
  vi.resetModules();
});

describe("auth config cookie naming", () => {
  it("production: __Host- access cookie + Secure", async () => {
    const cfg = await loadConfigWith("production");
    expect(cfg.ACCESS_COOKIE_NAME).toBe("__Host-progressio_access");
    expect(cfg.COOKIE_SECURE).toBe(true);
  });

  it("development: plain access cookie name, not Secure", async () => {
    const cfg = await loadConfigWith("development");
    expect(cfg.ACCESS_COOKIE_NAME).toBe("progressio_access");
    expect(cfg.ACCESS_COOKIE_NAME.startsWith("__Host-")).toBe(false);
    expect(cfg.COOKIE_SECURE).toBe(false);
  });

  it("refresh cookie is scoped to /api/auth/refresh and never uses __Host-", async () => {
    const prod = await loadConfigWith("production");
    expect(prod.REFRESH_COOKIE_PATH).toBe("/api/auth/refresh");
    expect(prod.REFRESH_COOKIE_NAME.startsWith("__Host-")).toBe(false);

    const dev = await loadConfigWith("development");
    expect(dev.REFRESH_COOKIE_PATH).toBe("/api/auth/refresh");
    expect(dev.REFRESH_COOKIE_NAME.startsWith("__Host-")).toBe(false);
  });
});
