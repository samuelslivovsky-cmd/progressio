/**
 * Import všetkých cvikov z ExerciseDB API do našej DB.
 * Cviky sa uložia s externalId (žiadne duplicity pri opakovanom spustení).
 *
 * Spustenie z koreňa projektu: node prisma/import-exercises-from-api.mjs
 */
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("Chýba DATABASE_URL v .env.local alebo .env");
  process.exit(1);
}

const BASE = "https://exercisedb-api.vercel.app/api/v1";
const PAGE_SIZE = 25;
/** Oneskorenie medzi požiadavkami (ms) – API má prísny rate limit. */
const DELAY_MS = 2500;
/** Pri 429 počkať (ms) a skúsiť znova. */
const RETRY_DELAY_MS = 20000;
const MAX_RETRIES = 15;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchPage(offset) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const params = new URLSearchParams({ offset: String(offset), limit: String(PAGE_SIZE) });
    const res = await fetch(`${BASE}/exercises?${params}`, { cache: "no-store" });
    if (res.status === 429) {
      if (attempt < MAX_RETRIES) {
        const retryAfter = res.headers.get("retry-after");
        const waitMs = retryAfter ? Math.max(Number(retryAfter) * 1000, RETRY_DELAY_MS) : RETRY_DELAY_MS;
        process.stdout.write(`\r429 – čakám ${Math.round(waitMs / 1000)}s, pokus ${attempt}/${MAX_RETRIES}...    `);
        await sleep(waitMs);
        continue;
      }
      throw new Error(`API 429: Too Many Requests (po ${MAX_RETRIES} pokusoch). Spustite skript neskôr znova – pokračuje od posledného offsetu.`);
    }
    if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
    const json = await res.json();
    return {
      data: json.data ?? [],
      total: json.metadata?.totalExercises ?? 0,
    };
  }
}

function toExerciseRow(item) {
  const muscleGroups = [
    ...(item.targetMuscles ?? []),
    ...(item.secondaryMuscles ?? []),
  ].filter(Boolean);
  const description =
    item.instructions?.length > 0 ? item.instructions.join("\n") : null;
  const equipment =
    item.equipments?.length > 0 ? item.equipments.join(", ") : null;
  return {
    externalId: item.exerciseId,
    name: item.name,
    description,
    muscleGroups: muscleGroups.length ? muscleGroups : ["other"],
    equipment,
    videoUrl: item.gifUrl || null,
  };
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Sťahujem cviky z ExerciseDB API...\n");
  let offset = 0;
  let total = 0;
  let imported = 0;
  let skipped = 0;

  do {
    const { data, total: t } = await fetchPage(offset);
    if (t > 0) total = t;
    if (data.length === 0) break;

    await sleep(DELAY_MS);

    for (const item of data) {
      const existing = await prisma.exercise.findUnique({
        where: { externalId: item.exerciseId },
      });
      if (existing) {
        skipped++;
        continue;
      }
      const row = toExerciseRow(item);
      await prisma.exercise.create({
        data: {
          externalId: row.externalId,
          name: row.name,
          description: row.description,
          muscleGroups: row.muscleGroups,
          equipment: row.equipment,
          videoUrl: row.videoUrl,
        },
      });
      imported++;
    }

    offset += data.length;
    const done = total ? Math.min(offset, total) : offset;
    process.stdout.write(`\rSpracované: ${done}${total ? ` / ${total}` : ""}  (importované: ${imported}, preskočené: ${skipped})`);

    if (data.length < PAGE_SIZE) break;
  } while (!total || offset < total);

  console.log("\n\nHotovo.");
  console.log(`Importované: ${imported} nových cvikov.`);
  console.log(`Preskočené (už v DB): ${skipped}.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
