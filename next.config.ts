import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  ...(isGitHubPages && {
    output: 'export' as const,
    basePath: '/bookphysio',
  }),
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
} satisfies NextConfig;

export default nextConfig;
