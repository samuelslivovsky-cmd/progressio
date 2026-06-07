import { hash, verify } from "@node-rs/argon2";

// argon2id with OWASP-recommended parameters (memory cost 19 MiB, 2 passes,
// 1 lane). @node-rs/argon2 ships prebuilt Rust binaries — no native build step.
const ARGON2_OPTS = {
  // 2 = argon2id
  algorithm: 2 as const,
  memoryCost: 19456, // 19 MiB in KiB
  timeCost: 2,
  parallelism: 1,
};

/** Hash a plaintext password with argon2id. Returns the encoded PHC string. */
export async function hashPassword(pw: string): Promise<string> {
  return hash(pw, ARGON2_OPTS);
}

/** Verify a plaintext password against an argon2 hash. */
export async function verifyPassword(
  hashStr: string,
  pw: string,
): Promise<boolean> {
  try {
    return await verify(hashStr, pw);
  } catch {
    return false;
  }
}

/**
 * True if the hash is a bcrypt hash (`$2a$`/`$2b$`/`$2y$`). Used for
 * lazy migration of legacy NextAuth/bcryptjs hashes to argon2 on next login.
 */
export function isBcryptHash(hashStr: string): boolean {
  return hashStr.startsWith("$2");
}
