import type { Metadata } from 'next'

export type StaticLocale = 'en' | 'hi'

export type LocalizedStaticPath = '/about' | '/faq' | '/how-it-works' | '/privacy' | '/terms'

export function getLocalizedStaticHref(locale: StaticLocale, path: LocalizedStaticPath): string {
  return locale === 'hi' ? `/hi${path}` : path
}

export function getLocalizedStaticAlternates(
  locale: StaticLocale,
  path: LocalizedStaticPath,
): Metadata['alternates'] {
  const englishHref = getLocalizedStaticHref('en', path)
  const hindiHref = getLocalizedStaticHref('hi', path)

  return {
    canonical: getLocalizedStaticHref(locale, path),
    languages: {
      'en-IN': englishHref,
      'hi-IN': hindiHref,
    },
  }
}
