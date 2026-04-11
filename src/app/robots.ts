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
      // Explicitly allow AI bots to crawl public pages
      { userAgent: 'GPTBot', allow: '/' },
      { userAgent: 'ChatGPT-User', allow: '/' },
      { userAgent: 'ClaudeBot', allow: '/' },
      { userAgent: 'PerplexityBot', allow: '/' },
      { userAgent: 'Amazonbot', allow: '/' },
      { userAgent: 'GoogleOther', allow: '/' },
    ],
  }
}