/**
 * Seed slovenských cvikov do našej DB.
 * Spustenie z koreňa projektu: node prisma/seed-exercises.mjs
 */
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const prisma = new PrismaClient();

const SLOVENSKE_CVIKY = [
  { name: "Tlačenie na lavičke", description: "Tlačenie činky alebo jednoručiek v ľahu na lavičke.", muscleGroups: ["pectorals", "triceps"], equipment: "lavica, činka alebo jednoručky" },
  { name: "Drepy", description: "Spúšťanie sa do drepu s činkou na pleciach alebo s vlastnou váhou.", muscleGroups: ["quadriceps", "glutes", "hamstrings"], equipment: "činka (voliteľne)" },
  { name: "Mŕtvy ťah", description: "Klasický mŕtvy ťah s činkou alebo osou.", muscleGroups: ["back", "hamstrings", "glutes"], equipment: "činka / os" },
  { name: "Príťahy v predklone", description: "Príťah činky alebo osi k podbradku v predklone.", muscleGroups: ["lats", "biceps", "back"], equipment: "činka alebo os" },
  { name: "Tlak nad hlavu", description: "Tlačenie činky alebo jednoručiek nad hlavu v stoji alebo sede.", muscleGroups: ["shoulders", "triceps"], equipment: "činka alebo jednoručky" },
  { name: "Bicepsové zdvihy", description: "Zdvih jednoručiek alebo činky na biceps.", muscleGroups: ["biceps"], equipment: "jednoručky alebo činka" },
  { name: "Triceps na lane", description: "Stláčanie lana alebo kladky na triceps.", muscleGroups: ["triceps"], equipment: "kladka / lano" },
  { name: "Výpady", description: "Výpad vpred alebo vzad s vlastnou váhou alebo jednoručkami.", muscleGroups: ["quadriceps", "glutes", "hamstrings"], equipment: "jednoručky (voliteľne)" },
  { name: "Skúšky na bradle", description: "Kliky na bradle alebo na lavičke (dips).", muscleGroups: ["triceps", "pectorals"], equipment: "bradlá" },
  { name: "Kliky", description: "Klasické kliky na zemi.", muscleGroups: ["pectorals", "triceps", "shoulders"], equipment: "žiadne" },
  { name: "Plank (výdrž v podpore)", description: "Výdrž v predlaktí alebo na rukách v podpore.", muscleGroups: ["core", "abs"], equipment: "žiadne" },
  { name: "Zhyby", description: "Zhyby na hrazde nadhmatom alebo podhmatom.", muscleGroups: ["lats", "biceps", "back"], equipment: "hrazda" },
];

async function main() {
  console.log("Pridávam slovenské cviky...");
  let added = 0;
  for (const cvik of SLOVENSKE_CVIKY) {
    const existing = await prisma.exercise.findFirst({
      where: { name: cvik.name, externalId: null },
    });
    if (!existing) {
      await prisma.exercise.create({
        data: {
          name: cvik.name,
          description: cvik.description ?? null,
          muscleGroups: cvik.muscleGroups,
          equipment: cvik.equipment ?? null,
          videoUrl: null,
          externalId: null,
        },
      });
      added++;
    }
  }
  console.log(`Hotovo. Pridaných ${added} nových cvikov (celkom ${SLOVENSKE_CVIKY.length} v zozname).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
