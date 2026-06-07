import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Structural shape of a Prisma `Decimal` (avoids importing the runtime type).
 * `string` is included because a `Decimal` cached as JSON (e.g. the Redis
 * profile cache in `lib/cache.ts`) deserializes back as its string form.
 */
type DecimalLike = { toNumber(): number } | number | string

/**
 * Convert a Prisma `Decimal` (or `number`/JSON-string) to a plain `number`.
 *
 * Prisma `Decimal` does NOT survive superjson serialization across the
 * tRPC/RSC boundary, so every `Decimal` read from the DB must be flattened to
 * `number` before it leaves the server. Use this at read boundaries (router
 * return values, server components, arithmetic). Tolerates the string form a
 * `Decimal` takes after JSON round-tripping through the Redis profile cache.
 */
export function toNum(value: DecimalLike): number
export function toNum(value: DecimalLike | null | undefined): number | null
export function toNum(value: DecimalLike | null | undefined): number | null {
  if (value == null) return null
  if (typeof value === "number") return value
  if (typeof value === "string") return Number(value)
  return value.toNumber()
}

/** Kapitalizuje prvý znak každého slova (názvy cvičení). */
export function capitalizeWords(s: string): string {
  return s
    .trim()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}
