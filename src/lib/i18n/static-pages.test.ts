import { describe, expect, it } from 'vitest'
import { getLocalizedStaticAlternates, getLocalizedStaticHref } from './static-pages'

describe('static page i18n helpers', () => {
  it('builds localized static hrefs for English and Hindi routes', () => {
    expect(getLocalizedStaticHref('en', '/about')).toBe('/about')
    expect(getLocalizedStaticHref('hi', '/about')).toBe('/hi/about')
  })

  it('builds canonical and language alternates for localized static pages', () => {
    expect(getLocalizedStaticAlternates('hi', '/faq')).toEqual({
      canonical: '/hi/faq',
      languages: {
        'en-IN': '/faq',
        'hi-IN': '/hi/faq',
      },
    })
  })
})