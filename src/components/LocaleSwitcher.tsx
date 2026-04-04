import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getLocalizedStaticHref, type LocalizedStaticPath, type StaticLocale } from '@/lib/i18n/static-pages'

const LOCALE_OPTIONS: Array<{ locale: StaticLocale; label: string }> = [
  { locale: 'en', label: 'English' },
  { locale: 'hi', label: 'हिंदी' },
]

export function LocaleSwitcher({
  locale,
  path,
  className,
}: {
  locale: StaticLocale
  path: LocalizedStaticPath
  className?: string
}) {
  return (
    <div
      className={cn('inline-flex items-center gap-1 rounded-full border border-[#ddd3c6] bg-white/80 p-1 text-[13px]', className)}
      role="group"
      aria-label="Language switcher"
    >
      {LOCALE_OPTIONS.map((option) => {
        const isActive = option.locale === locale

        return (
          <Link
            key={option.locale}
            href={getLocalizedStaticHref(option.locale, path)}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'rounded-full px-3 py-1.5 font-semibold transition-colors',
              isActive ? 'bg-[#18312d] text-white' : 'text-[#4f5e5a] hover:bg-[#f4f7f7] hover:text-[#0f7668]'
            )}
            hrefLang={option.locale}
          >
            {option.label}
          </Link>
        )
      })}
    </div>
  )
}
