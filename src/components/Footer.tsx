import Link from 'next/link'
import BpLogo from '@/components/BpLogo'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { getLocalizedStaticHref, type LocalizedStaticPath, type StaticLocale } from '@/lib/i18n/static-pages'

const FOOTER_COPY = {
  en: {
    tagline: 'A sharper way to find physiotherapy care. Start with the search, compare verified providers, and book with clarity.',
    disclaimer: 'BookPhysio is a booking platform. We do not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.',
    copyright: '© 2026 BookPhysio.in',
    privacy: 'Privacy',
    terms: 'Terms',
    faq: 'FAQ',
    columns: [
      {
        heading: 'Explore',
        links: [
          { label: 'About us', href: '/about' },
          { label: 'Search physios', href: '/search' },
          { label: 'How it works', href: '/how-it-works' },
          { label: 'FAQ', href: '/faq' },
        ],
      },
      {
        heading: 'Patients',
        links: [
          { label: 'Log in', href: '/login' },
          { label: 'Create account', href: '/signup' },
          { label: 'Book a session', href: '/search' },
          { label: 'Privacy policy', href: '/privacy' },
        ],
      },
      {
        heading: 'Providers',
        links: [
          { label: 'Doctor signup', href: '/doctor-signup' },
          { label: 'Provider dashboard', href: '/provider/dashboard' },
          { label: 'Availability', href: '/provider/availability' },
          { label: 'Terms of service', href: '/terms' },
        ],
      },
    ],
  },
  hi: {
    tagline: 'फिजियोथेरेपी देखभाल खोजने का एक स्पष्ट तरीका। खोज से शुरुआत करें, सत्यापित प्रदाताओं की तुलना करें, और भरोसे के साथ बुक करें।',
    disclaimer: 'BookPhysio एक बुकिंग प्लेटफॉर्म है। हम चिकित्सा सलाह, निदान या उपचार प्रदान नहीं करते। किसी भी चिकित्सीय चिंता के लिए हमेशा योग्य स्वास्थ्य सेवा प्रदाता से सलाह लें।',
    copyright: '© 2026 BookPhysio.in',
    privacy: 'प्राइवेसी',
    terms: 'शर्तें',
    faq: 'सवाल-जवाब',
    columns: [
      {
        heading: 'एक्सप्लोर',
        links: [
          { label: 'हमारे बारे में', href: '/about' },
          { label: 'फिजियो खोजें', href: '/search' },
          { label: 'यह कैसे काम करता है', href: '/how-it-works' },
          { label: 'सवाल-जवाब', href: '/faq' },
        ],
      },
      {
        heading: 'मरीज',
        links: [
          { label: 'लॉग इन', href: '/login' },
          { label: 'अकाउंट बनाएं', href: '/signup' },
          { label: 'सेशन बुक करें', href: '/search' },
          { label: 'प्राइवेसी पॉलिसी', href: '/privacy' },
        ],
      },
      {
        heading: 'प्रदाता',
        links: [
          { label: 'डॉक्टर साइनअप', href: '/doctor-signup' },
          { label: 'प्रदाता डैशबोर्ड', href: '/provider/dashboard' },
          { label: 'उपलब्धता', href: '/provider/availability' },
          { label: 'सेवा की शर्तें', href: '/terms' },
        ],
      },
    ],
  },
} as const

export default function Footer({
  locale,
  localeSwitchPath,
}: {
  locale?: StaticLocale
  localeSwitchPath?: LocalizedStaticPath
} = {}) {
  const effectiveLocale = locale ?? 'en'
  const copy = FOOTER_COPY[effectiveLocale]
  const columns = copy.columns.map((column) => ({
    ...column,
    links: column.links.map((link) => {
      if (link.href === '/about' || link.href === '/faq' || link.href === '/how-it-works' || link.href === '/privacy' || link.href === '/terms') {
        return {
          ...link,
          href: locale ? getLocalizedStaticHref(locale, link.href) : link.href,
        }
      }

      return link
    }),
  }))

  return (
    <footer className="border-t border-[#244540]/10 bg-[#18312d] text-white">
      <div className="bp-shell py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="max-w-xl">
            <Link href="/" className="flex items-center gap-3">
              <BpLogo
                invert
                priority={false}
                size="footer"
              />
            </Link>

            <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/70">
              {copy.tagline}
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">{column.heading}</h3>
              <ul className="mt-6 space-y-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[15px] font-medium text-white/70 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-[13px] leading-6 text-white/55 md:flex md:items-center md:justify-between md:gap-6">
          <p className="max-w-3xl">
            {copy.disclaimer}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 md:mt-0">
            {locale && localeSwitchPath ? <LocaleSwitcher locale={locale} path={localeSwitchPath} /> : null}
            <span>{copy.copyright}</span>
            <Link href={locale ? getLocalizedStaticHref(locale, '/privacy') : '/privacy'} className="transition-colors hover:text-white">
              {copy.privacy}
            </Link>
            <Link href={locale ? getLocalizedStaticHref(locale, '/terms') : '/terms'} className="transition-colors hover:text-white">
              {copy.terms}
            </Link>
            <Link href={locale ? getLocalizedStaticHref(locale, '/faq') : '/faq'} className="transition-colors hover:text-white">
              {copy.faq}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}