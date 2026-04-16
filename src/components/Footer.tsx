import Link from 'next/link'
import BpLogo from '@/components/BpLogo'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { getLocalizedStaticHref, type LocalizedStaticPath, type StaticLocale } from '@/lib/i18n/static-pages'
import { ShieldCheck, Heart } from 'lucide-react'

const columns = [
  {
    heading: 'Platform',
    links: [
      { label: 'Search physios', href: '/search' },
      { label: 'How it works',   href: '/how-it-works' },
      { label: 'About us',       href: '/about' },
      { label: 'FAQ',            href: '/faq' },
    ],
  },
  {
    heading: 'Patients',
    links: [
      { label: 'Log in',         href: '/login' },
      { label: 'Create account', href: '/signup' },
      { label: 'Book a session', href: '/search' },
      { label: 'Privacy policy', href: '/privacy' },
    ],
  },
  {
    heading: 'Providers',
    links: [
      { label: 'Join as physio',       href: '/doctor-signup' },
      { label: 'Provider dashboard',   href: '/provider/dashboard' },
      { label: 'Manage availability',  href: '/provider/availability' },
      { label: 'Terms of service',     href: '/terms' },
    ],
  },
]

const STATIC_PATHS = ['/about', '/faq', '/how-it-works', '/privacy', '/terms'] as const

export default function Footer({
  locale,
  localeSwitchPath,
}: {
  locale?: StaticLocale
  localeSwitchPath?: LocalizedStaticPath
} = {}) {
  const currentYear = new Date().getFullYear()

  function localizeHref(href: string) {
    if (locale && STATIC_PATHS.includes(href as typeof STATIC_PATHS[number])) {
      return getLocalizedStaticHref(locale, href as typeof STATIC_PATHS[number])
    }
    return href
  }

  return (
    <footer className="bg-[#0B0B0F] text-white border-t border-white/5">
      {/* Main content */}
      <div className="bp-container py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">

          {/* Brand column */}
          <div>
            <Link href="/" className="inline-block mb-5">
              <BpLogo invert priority={false} size="footer" />
            </Link>
            <p className="text-slate-400 text-[14px] leading-7 max-w-xs">
              A focused booking platform for physiotherapy in India. Find IAP-verified physiotherapists for a clinic visit or a session at home.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-2 mt-6">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--sq-xs)] bg-white/5 border border-white/8 text-slate-400 text-[12px] font-medium">
                <ShieldCheck size={12} className="text-indigo-400" />
                IAP Verified
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--sq-xs)] bg-white/5 border border-white/8 text-slate-400 text-[12px] font-medium">
                <Heart size={12} className="text-rose-400" />
                Made for India
              </div>
            </div>
          </div>

          {/* Link columns */}
          {columns.map(col => (
            <div key={col.heading}>
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-5">
                {col.heading}
              </h3>
              <ul className="space-y-3">
                {col.links.map(link => (
                  <li key={link.label}>
                    <Link
                      href={localizeHref(link.href)}
                      className="text-[14px] text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="bp-container py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-[12px] max-w-xl">
            BookPhysio is a booking platform. We do not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.
          </p>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            {locale && localeSwitchPath ? (
              <LocaleSwitcher locale={locale} path={localeSwitchPath} />
            ) : null}
            <span className="text-slate-600 text-[12px]">© {currentYear} BookPhysio.in</span>
            <Link href={localizeHref('/privacy')} className="text-slate-500 text-[12px] hover:text-white transition-colors">Privacy</Link>
            <Link href={localizeHref('/terms')}   className="text-slate-500 text-[12px] hover:text-white transition-colors">Terms</Link>
            <Link href={localizeHref('/faq')}     className="text-slate-500 text-[12px] hover:text-white transition-colors">FAQ</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
