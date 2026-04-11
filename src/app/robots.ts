import type { MetadataRoute } from 'next'

const BASE_URL = 'https://bookphysio.in'
const DISALLOWED_PROTECTED_PATHS = [
  '/admin',
  '/api',
  '/book',
  '/patient',
  '/provider',
  '/preview',
  '/dev-login',
] as const
const EXPLICIT_AI_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'ClaudeBot',
  'PerplexityBot',
  'Amazonbot',
  'GoogleOther',
] as const

export default function robots(): MetadataRoute.Robots {
  return {
    host: BASE_URL,
    sitemap: `${BASE_URL}/sitemap.xml`,
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [...DISALLOWED_PROTECTED_PATHS],
      },
      // Explicitly allow AI bots to crawl public pages while inheriting the
      // same disallow list so they cannot access protected routes.
      ...EXPLICIT_AI_BOTS.map((bot) => ({
        userAgent: bot,
        allow: '/' as const,
        disallow: [...DISALLOWED_PROTECTED_PATHS],
      })),
    ],
  }
}
