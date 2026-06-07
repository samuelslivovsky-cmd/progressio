import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
  output: "standalone",
  // Trace files from the monorepo root so the standalone bundle includes
  // workspace packages (e.g. @progressio/db) when built in Docker.
  outputFileTracingRoot: join(import.meta.dirname, "../../"),
};

export default nextConfig;
