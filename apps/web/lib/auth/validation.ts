import { z } from "zod";

// Shared auth input schemas. Used by BOTH the API route handlers and the
// server-side registration logic so validation can never be bypassed.

/** Password policy: 8–128 chars. */
export const passwordSchema = z.string().min(8).max(128);

/** Email: validated, trimmed, lowercased. */
export const emailSchema = z
  .string()
  .email()
  .transform((e) => e.trim().toLowerCase());

/** Login payload. Password only needs to be present (policy enforced at signup). */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

/** Registration payload. */
export const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema,
  password: passwordSchema,
  role: z.enum(["TRAINER", "CLIENT"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

/** Normalize an email the same way the schemas do (trim + lowercase). */
export function normalizeEmail(e: string): string {
  return e.trim().toLowerCase();
}
