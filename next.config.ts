import type { NextConfig } from "next";

const nextConfig = {
  images: {
    unoptimized: true,
  },
  transpilePackages: ["react-map-gl"],
  typescript: {
    ignoreBuildErrors: true,
  },
} satisfies NextConfig;

export default nextConfig;
