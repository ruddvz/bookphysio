'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Menu, X, ArrowRight, Stethoscope } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { getLocalizedStaticHref, type LocalizedStaticPath, type StaticLocale } from '@/lib/i18n/static-pages'
import { cn } from '@/lib/utils'

const SPECIALTIES = [
  { label: 'Sports Physio',     href: '/search?specialty=Sports+Physio',     emoji: '🏃' },
  { label: 'Neuro Physio',      href: '/search?specialty=Neuro+Physio',      emoji: '🧠' },
  { label: 'Ortho Physio',      href: '/search?specialty=Ortho+Physio',      emoji: '🦴' },
  { label: 'Paediatric Physio', href: '/search?specialty=Paediatric+Physio', emoji: '👶' },
  { label: "Women's Health",    href: '/search?specialty=Womens+Health',      emoji: '🌸' },
  { label: 'Geriatric Physio',  href: '/search?specialty=Geriatric+Physio',  emoji: '🤝' },
  { label: 'Post-Surgery Rehab',href: '/search?specialty=Post-Surgery+Rehab',emoji: '🏥' },
  { label: 'Home Visit Physio', href: '/search?specialty=Home+Visit',         emoji: '🏠' },
]

const navLinks = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'For providers', href: '/doctor-signup' },
]

export default function Navbar({
  locale,
  localeSwitchPath,
}: {
  locale?: StaticLocale
  localeSwitchPath?: LocalizedStaticPath
} = {}) {
  const [browseOpen, setBrowseOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const effectiveLocale = locale ?? 'en'
  const searchHref = effectiveLocale === 'hi' ? '/hi/search' : '/search'
  const loginHref  = effectiveLocale === 'hi' ? '/hi/login'  : '/login'
  const howItWorksHref = locale ? getLocalizedStaticHref(locale, '/how-it-works') : '/how-it-works'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setBrowseOpen(false)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-[100] transition-all duration-300',
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-indigo-100/60 shadow-sm shadow-indigo-100/40'
            : 'bg-transparent'
        )}
      >
        <div className="bp-container">
          <div className="flex h-[68px] items-center justify-between gap-6">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 group"
              aria-label="BookPhysio home"
            >
              <BpLogo priority size="nav" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">

              {/* Browse dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setBrowseOpen(!browseOpen)}
                  aria-expanded={browseOpen}
                  aria-controls="browse-dropdown"
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150',
                    browseOpen
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/60'
                  )}
                >
                  Browse
                  <ChevronDown
                    size={15}
                    className={cn('transition-transform duration-200', browseOpen && 'rotate-180')}
                  />
                </button>

                {/* Mega dropdown */}
                {browseOpen && (
                  <div
                    id="browse-dropdown"
                    className="absolute left-0 top-full mt-2 w-[400px] bg-white rounded-2xl border border-indigo-100 shadow-2xl shadow-indigo-900/15 p-4 animate-slide-down"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300 px-2 mb-3">
                      Browse by Specialty
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {SPECIALTIES.map((s) => (
                        <Link
                          key={s.label}
                          href={effectiveLocale === 'hi' ? `/hi${s.href}` : s.href}
                          onClick={() => setBrowseOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-all duration-150"
                        >
                          <span className="text-base leading-none">{s.emoji}</span>
                          {s.label}
                        </Link>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-indigo-50">
                      <Link
                        href={searchHref}
                        onClick={() => setBrowseOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-indigo-50/50 hover:bg-indigo-100/50 transition-all group"
                      >
                        <span className="text-[13px] font-semibold text-indigo-600 group-hover:text-indigo-800">
                          View all physiotherapists →
                        </span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Static links */}
              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href === '/how-it-works' ? howItWorksHref : href}
                  className="px-4 py-2.5 rounded-lg text-[14px] font-medium text-slate-600 hover:text-indigo-700 hover:bg-indigo-50/60 transition-all duration-150"
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden lg:flex items-center gap-3">
              {locale && localeSwitchPath ? (
                <LocaleSwitcher locale={locale} path={localeSwitchPath} />
              ) : null}
              <Link
                href={loginHref}
                className="px-4 py-2 text-[14px] font-medium text-slate-600 hover:text-indigo-700 transition-colors"
              >
                Log in
              </Link>
              <Link
                href={searchHref}
                className="bp-btn bp-btn-primary bp-btn-sm"
              >
                Find care
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-indigo-100 bg-white text-slate-600 hover:text-indigo-700 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-[98] bg-slate-900/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="lg:hidden fixed inset-y-0 right-0 z-[99] w-[300px] bg-white shadow-2xl animate-slide-down flex flex-col">
            <div className="flex items-center justify-between px-6 h-[68px] border-b border-slate-100">
              <span className="text-[15px] font-bold text-slate-900">Menu</span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300 px-2 mb-3">
                Specialties
              </p>
              {SPECIALTIES.map((s) => (
                <Link
                  key={s.label}
                  href={effectiveLocale === 'hi' ? `/hi${s.href}` : s.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <span className="text-base">{s.emoji}</span>
                  {s.label}
                </Link>
              ))}

              <div className="h-px bg-slate-100 my-4" />

              <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-300 px-2 mb-3">
                Platform
              </p>
              <Link
                href={howItWorksHref}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                How it works
              </Link>
              <Link
                href="/doctor-signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-[14px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Stethoscope size={16} className="text-indigo-400" />
                For providers
              </Link>
            </nav>

            <div className="px-4 pb-8 space-y-3 border-t border-slate-100 pt-4">
              <Link
                href={loginHref}
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Log in
              </Link>
              <Link
                href={searchHref}
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-[14px] font-semibold transition-colors"
                style={{ background: 'linear-gradient(135deg, #8B9BD8, #7DCFC9)' }}
              >
                Find care
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}