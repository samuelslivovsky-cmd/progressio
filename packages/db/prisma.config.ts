import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

// Single root .env is the source of truth for the whole monorepo.
// Run with cwd = packages/db (e.g. `pnpm --filter @progressio/db migrate:deploy`).
expand(config({ path: ["../../.env", "../../.env.local"] }));

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL!,
  },
});
