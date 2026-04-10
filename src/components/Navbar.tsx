'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Baby,
  Bone,
  Brain,
  ChevronDown,
  Dumbbell,
  Flower2,
  HeartPulse,
  Menu,
  Ribbon,
  Stethoscope,
  Users,
  X,
} from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { getLocalizedStaticHref, type LocalizedStaticPath, type StaticLocale } from '@/lib/i18n/static-pages'
import { SPECIALTIES } from '@/lib/specialties'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Bone,
  Brain,
  HeartPulse,
  Dumbbell,
  Baby,
  Flower2,
  Ribbon,
  Users,
}

const navLinks = [
  { label: 'How it works', href: '/how-it-works' },
  { label: 'For doctors', href: '/doctor-signup' },
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
  const [mobileSpecialtiesOpen, setMobileSpecialtiesOpen] = useState(false)
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

                {/* Mega dropdown — 4-column grid of title cards */}
                {browseOpen && (
                  <div
                    id="browse-dropdown"
                    className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[540px] bg-white rounded-2xl border border-slate-200 shadow-2xl shadow-slate-900/10 p-5 animate-slide-down"
                  >
                    <div className="flex items-center justify-between px-1 mb-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        Specialties
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                        NCAHP recognised
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {SPECIALTIES.map((s) => {
                        const Icon = ICON_MAP[s.icon] ?? Stethoscope
                        return (
                          <Link
                            key={s.slug}
                            href={`/specialties/${s.slug}`}
                            onClick={() => setBrowseOpen(false)}
                            className="group flex items-start gap-3 rounded-xl border border-transparent px-3.5 py-3 transition-all duration-150 hover:bg-slate-50 hover:border-slate-200"
                          >
                            <div className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                              s.tint.bg, s.tint.text,
                            )}>
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-slate-800 group-hover:text-indigo-700 transition-colors leading-tight">
                                {s.label}
                              </p>
                              <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                                {s.tagline}
                              </p>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <Link
                        href={searchHref}
                        onClick={() => setBrowseOpen(false)}
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 transition-all group"
                      >
                        <span className="text-[13px] font-semibold text-slate-600 group-hover:text-indigo-700">
                          Browse all physiotherapists
                        </span>
                        <ArrowRight size={14} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
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
                href="/doctor-signup"
                className="px-4 py-2 text-[14px] font-medium text-slate-600 hover:text-indigo-700 transition-colors"
              >
                For doctors
              </Link>
              <Link
                href={loginHref}
                className="bp-btn bp-btn-primary bp-btn-sm"
              >
                Sign in
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
            <div className="flex items-center justify-end px-6 h-[68px] border-b border-slate-100">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
              {/* Browse specialties — collapsible */}
              <button
                type="button"
                onClick={() => setMobileSpecialtiesOpen(o => !o)}
                className="w-full flex items-center justify-between px-3 py-3 rounded-xl text-[14px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Browse specialties</span>
                <ChevronDown
                  size={15}
                  className={cn('text-slate-400 transition-transform duration-200', mobileSpecialtiesOpen && 'rotate-180')}
                />
              </button>

              {mobileSpecialtiesOpen && (
                <div className="space-y-0.5 pl-1">
                  {SPECIALTIES.map((s) => {
                    const Icon = ICON_MAP[s.icon] ?? Stethoscope
                    return (
                      <Link
                        key={s.slug}
                        href={`/specialties/${s.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-700 transition-colors"
                      >
                        <div className={cn('flex h-7 w-7 items-center justify-center rounded-lg shrink-0', s.tint.bg, s.tint.text)}>
                          <Icon size={14} />
                        </div>
                        {s.label}
                      </Link>
                    )
                  })}
                </div>
              )}

              <div className="h-px bg-slate-100 my-2" />

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
                For doctors
              </Link>
            </nav>

            <div className="px-4 pb-8 border-t border-slate-100 pt-4">
              <Link
                href={loginHref}
                onClick={() => setMobileOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white text-[14px] font-semibold transition-colors"
                style={{ background: 'linear-gradient(135deg, #8B9BD8, #7DCFC9)' }}
              >
                Sign in
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  )
}
