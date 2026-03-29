import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/bookphysio",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
