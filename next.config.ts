import type { NextConfig } from "next";

const isStaticExport = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  ...(isStaticExport && {
    output: 'export' as const,
  }),
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
} satisfies NextConfig;

export default nextConfig;
