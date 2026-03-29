import type { NextConfig } from "next";

const nextConfig = {
  output: "export",
  basePath: "/bookphysio",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
} as any;

export default nextConfig;
