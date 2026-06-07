// Bundle the BullMQ worker into a single CJS file the prod standalone image can
// run with plain `node` (no tsx / TS sources shipped). Native + Prisma modules
// stay external — they come from the pruned prod node_modules copied into the
// runner stage.
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const webRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

await build({
  entryPoints: [resolve(webRoot, "server/jobs/worker.ts")],
  outfile: resolve(webRoot, "dist/worker.cjs"),
  platform: "node",
  target: "node20",
  format: "cjs",
  bundle: true,
  sourcemap: true,
  // Keep native bindings, Prisma client/adapter, and heavy runtime deps external;
  // they are resolved from the pruned prod node_modules at runtime.
  external: [
    "@progressio/db",
    "@prisma/client",
    "@prisma/adapter-pg",
    "pg",
    "@node-rs/argon2",
    "ioredis",
    "bullmq",
  ],
  // Resolve the "@/..." alias (scoped to apps/web) the same way Next does.
  alias: { "@": webRoot },
});

console.log("[build-worker] bundled server/jobs/worker.ts → dist/worker.cjs");
