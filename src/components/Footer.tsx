import Link from 'next/link'
import { ArrowRight, MapPin, ShieldCheck } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { getLocalizedStaticHref, type LocalizedStaticPath, type StaticLocale } from '@/lib/i18n/static-pages'

const FOOTER_COPY = {
  en: {
    tagline: 'A sharper way to find physiotherapy care. Start with the search, compare verified providers, and book with clarity.',
    startSearching: 'Start searching',
    joinAsProvider: 'Join as provider',
    verifiedProviders: 'Verified providers',
    homeVisits: 'Home visits',
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
    startSearching: 'खोज शुरू करें',
    joinAsProvider: 'प्रदाता के रूप में जुड़ें',
    verifiedProviders: 'सत्यापित प्रदाता',
    homeVisits: 'होम विज़िट्स',
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
    <footer className="border-t border-bp-border bg-white selection:bg-bp-accent/10 selection:text-bp-accent">
      <div className="bp-shell py-20 md:py-24">
        <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-xl">
            <Link href="/" className="flex items-center gap-3">
              <BpLogo
                priority={false}
                size="footer"
              />
            </Link>

            <p className="mt-8 max-w-lg text-[16px] leading-8 text-bp-body/60 font-medium tracking-tight">
              {copy.tagline}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/search"
                className="inline-flex items-center gap-3 rounded-2xl bg-bp-primary px-7 py-4 text-[15px] font-bold text-white transition-all hover:bg-bp-accent active:scale-[0.98] shadow-xl shadow-bp-primary/10"
              >
                {copy.startSearching}
                <ArrowRight size={18} strokeWidth={3} />
              </Link>
              <Link
                href="/doctor-signup"
                className="inline-flex items-center gap-3 rounded-2xl border-2 border-bp-border bg-white px-7 py-4 text-[15px] font-bold text-bp-primary transition-all hover:border-bp-accent/30 hover:bg-bp-surface active:scale-[0.98]"
              >
                {copy.joinAsProvider}
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2.5 rounded-xl border border-bp-border bg-bp-surface/50 px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest text-bp-primary/60">
                <ShieldCheck size={16} className="text-bp-accent" />
                {copy.verifiedProviders}
              </span>
              <span className="inline-flex items-center gap-2.5 rounded-xl border border-bp-border bg-bp-surface/50 px-4 py-2.5 text-[12px] font-bold uppercase tracking-widest text-bp-primary/60">
                <MapPin size={16} className="text-bp-accent" />
                {copy.homeVisits}
              </span>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-bp-primary/40">{column.heading}</h3>
              <ul className="mt-8 space-y-5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[15px] font-bold text-bp-body/70 transition-all hover:text-bp-accent hover:translate-x-1 inline-block">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-20 border-t border-bp-border pt-10 text-[13px] leading-7 text-bp-body/40 md:flex md:items-center md:justify-between md:gap-10">
          <p className="max-w-3xl font-medium italic">
            {copy.disclaimer}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 md:mt-0 font-bold shrink-0">
            {locale && localeSwitchPath ? <LocaleSwitcher locale={locale} path={localeSwitchPath} /> : null}
            <span className="text-bp-primary/60">{copy.copyright}</span>
            <Link href={locale ? getLocalizedStaticHref(locale, '/privacy') : '/privacy'} className="transition-colors hover:text-bp-accent">
              {copy.privacy}
            </Link>
            <Link href={locale ? getLocalizedStaticHref(locale, '/terms') : '/terms'} className="transition-colors hover:text-bp-accent">
              {copy.terms}
            </Link>
            <Link href={locale ? getLocalizedStaticHref(locale, '/faq') : '/faq'} className="transition-colors hover:text-bp-accent">
              {copy.faq}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}