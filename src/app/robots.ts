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
      // Explicitly allow AI bots to crawl public pages while inheriting the
      // same disallow list so they cannot access protected routes.
      ...[
        'GPTBot',
        'ChatGPT-User',
        'ClaudeBot',
        'PerplexityBot',
        'Amazonbot',
        'GoogleOther',
      ].map((bot) => ({
        userAgent: bot,
        allow: '/' as const,
        disallow: [
          '/admin',
          '/api',
          '/book',
          '/patient',
          '/provider',
          '/preview',
          '/dev-login',
        ],
      })),
    ],
  }
}