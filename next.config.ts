import type { NextConfig } from "next";

const nextConfig = {
  output: "export",
  basePath: "/bookphysio",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
} satisfies NextConfig;

export default nextConfig;
