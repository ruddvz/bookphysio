import Link from 'next/link'
import { ArrowRight, Heart, MapPin, ShieldCheck } from 'lucide-react'
import BpLogo from '@/components/BpLogo'

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
    <footer className="border-t border-[#244540]/10 bg-[#18312d] text-white">
      <div className="bp-shell py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div className="max-w-xl">
            <Link href="/" className="flex items-center gap-3">
              <BpLogo
                invert
                priority={false}
              />
            </Link>

            <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/70">
              A sharper way to find physiotherapy care. Start with the search, compare verified providers, and book with clarity.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-[14px] font-semibold text-[#18312d] transition-all hover:bg-white"
              >
                Start searching
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/doctor-signup"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[14px] font-semibold text-white transition-all hover:border-[#dcefe9]/50 hover:bg-white/10"
              >
                Join as provider
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-2 text-[13px] text-white/60">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <ShieldCheck size={14} className="text-[#dcefe9]" />
                Verified providers
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <MapPin size={14} className="text-[#dcefe9]" />
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