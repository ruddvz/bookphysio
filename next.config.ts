import type { NextConfig } from "next";
import { SPECIALTIES } from "./src/lib/specialties";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.in',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          // Content-Security-Policy is set per-request in middleware.ts.
        ],
      },
    ]
  },
  /**
   * Legacy /specialty/:slug URLs (removed in favour of /specialties/:slug) → 301.
   */
  async redirects() {
    return SPECIALTIES.map((s) => ({
      source: `/specialty/${s.slug}`,
      destination: `/specialties/${s.slug}`,
      permanent: true,
    }))
  },
} satisfies NextConfig;

export default nextConfig;
