import type { NextConfig } from "next";

const nextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ["gleo"],
  typescript: {
    ignoreBuildErrors: true,
  },
} satisfies NextConfig;

export default nextConfig;
