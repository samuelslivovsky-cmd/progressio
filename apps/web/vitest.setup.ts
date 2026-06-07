// Test environment defaults. Set before any auth module loads its
// env-dependent constants (config TTLs/cookie names, JWT secret).
const env = process.env as Record<string, string | undefined>;
env.JWT_ACCESS_SECRET ??= "test-secret-test-secret-test-secret-32";
env.NODE_ENV ??= "test";
