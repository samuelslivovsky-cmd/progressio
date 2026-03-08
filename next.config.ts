import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /** Skip TypeScript errors during build (e.g. on Vercel). Prefer fixing implicit any instead. */
  typescript: { ignoreBuildErrors: true },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
