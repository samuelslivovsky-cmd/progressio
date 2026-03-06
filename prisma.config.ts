import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

expand(config({ path: ".env.local" }));

export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL!,
  },
});
