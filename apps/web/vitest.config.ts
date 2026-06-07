import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Resolve the `@/*` alias explicitly (independent of tsconfig include/exclude,
// since test files are excluded from the app tsconfig to keep `next build` clean).
const here = fileURLToPath(new URL(".", import.meta.url)).replace(/[/\\]$/, "");

export default defineConfig({
  resolve: {
    alias: [{ find: /^@\//, replacement: here + "/" }],
  },
  test: {
    environment: "node",
    globals: true,
    include: [
      "lib/**/*.test.ts",
      "server/**/*.test.ts",
      "__tests__/**/*.test.ts",
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});
