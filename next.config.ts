import type { NextConfig } from "next";

const isStaticExport = process.env.GITHUB_ACTIONS === 'true';

const nextConfig = {
  ...(isStaticExport && {
    output: 'export' as const,
    basePath: '/bookphysio',
    assetPrefix: '/bookphysio/',
  }),
  images: {
    unoptimized: true,
  },
  transpilePackages: ["react-map-gl"],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
} satisfies NextConfig;

export default nextConfig;
