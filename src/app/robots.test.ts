import { describe, expect, it } from 'vitest'

import robots from './robots'

describe('robots metadata', () => {
  it('allows public pages while blocking private app surfaces', () => {
    const config = robots()
    const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules

    expect(config.host).toBe('https://bookphysio.in')
    expect(config.sitemap).toBe('https://bookphysio.in/sitemap.xml')
    expect(rules).toMatchObject({
      userAgent: '*',
      allow: '/',
    })

    expect(rules.disallow).toEqual(
      expect.arrayContaining([
        '/admin',
        '/api',
        '/book',
        '/patient',
        '/provider',
        '/preview',
        '/dev-login',
      ]),
    )
  })
})