import type { MetadataRoute } from 'next'

const BASE_URL = 'https://bookphysio.in'

export default function robots(): MetadataRoute.Robots {
  return {
    host: BASE_URL,
    sitemap: `${BASE_URL}/sitemap.xml`,
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/book',
          '/patient',
          '/provider',
          '/preview',
          '/dev-login',
        ],
      },
    ],
  }
}