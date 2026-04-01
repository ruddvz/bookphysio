import Link from 'next/link'
import { ArrowRight, Heart, MapPin, ShieldCheck } from 'lucide-react'

const COLUMNS = [
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
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0F1720] text-white">
      <div className="bp-shell py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#00766C] text-white shadow-[0_16px_28px_-20px_rgba(0,118,108,0.7)]">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                  <path d="M6 11H9L10.5 7L13.5 15L15 11H18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-[20px] font-semibold tracking-[-0.03em]">BookPhysio</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/45">India-first physio booking</p>
              </div>
            </div>

            <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/65">
              A calmer way to find physiotherapy care. Search by condition, compare verified providers, and book the session that fits.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-[#0F1720] transition-all hover:bg-[#F0F4F4]"
              >
                Start searching
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/doctor-signup"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[14px] font-semibold text-white transition-all hover:border-[#00766C]/50 hover:bg-white/10"
              >
                Join as provider
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-2 text-[13px] text-white/60">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <ShieldCheck size={14} className="text-[#8DD4CD]" />
                Verified providers
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <MapPin size={14} className="text-[#8DD4CD]" />
                Home visits
              </span>
            </div>
          </div>

          {COLUMNS.map((column) => (
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
            BookPhysio is a booking platform. We do not provide medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.
          </p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 md:mt-0">
            <span>© 2026 BookPhysio.in</span>
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms
            </Link>
            <Link href="/faq" className="transition-colors hover:text-white">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}