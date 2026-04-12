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
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const effectiveLocale = locale ?? 'en'
  const searchHref = effectiveLocale === 'hi' ? '/hi/search' : '/search'
  const loginHref = effectiveLocale === 'hi' ? '/hi/login' : '/login'
  const signupHref = effectiveLocale === 'hi' ? '/hi/signup' : '/signup'
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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-[100] transition-all duration-300',
          scrolled
            ? 'bg-white/90 backdrop-blur-xl border-b border-[#00766C]/10 shadow-sm shadow-[#00766C]/10'
            : 'bg-transparent'
        )}
      >
        <div className="bp-container">
          <div className="flex h-[68px] items-center justify-between gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 shrink-0 group"
              aria-label="BookPhysio home"
            >
              <BpLogo priority size="nav" />
            </Link>

            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setBrowseOpen(!browseOpen)}
                  aria-expanded={browseOpen}
                  aria-controls="browse-dropdown"
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150',
                    browseOpen
                      ? 'bg-[#E6F4F3] text-[#00766C]'
                      : 'text-slate-600 hover:text-[#00766C] hover:bg-[#E6F4F3]/60'
                  )}
                >
                  Specialties
                  <ChevronDown
                    size={15}
                    className={cn('transition-transform duration-200', browseOpen && 'rotate-180')}
                  />
                </button>

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
                            href={`/specialty/${s.slug}`}
                            onClick={() => setBrowseOpen(false)}
                            className="group flex items-start gap-3 rounded-xl border border-transparent px-3.5 py-3 transition-all duration-150 hover:bg-slate-50 hover:border-slate-200"
                          >
                            <div className={cn(
                              'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                              s.tint.bg,
                              s.tint.text,
                            )}>
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-semibold text-slate-800 group-hover:text-[#00766C] transition-colors leading-tight">
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
                        className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 hover:bg-[#E6F4F3] transition-all group"
                      >
                        <span className="text-[13px] font-semibold text-slate-600 group-hover:text-[#00766C]">
                          Browse all physiotherapists
                        </span>
                        <ArrowRight size={14} className="text-slate-400 group-hover:text-[#00766C] group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {navLinks.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href === '/how-it-works' ? howItWorksHref : href}
                  className="px-4 py-2.5 rounded-lg text-[14px] font-medium text-slate-600 hover:text-[#00766C] hover:bg-[#E6F4F3]/60 transition-all duration-150"
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              {locale && localeSwitchPath ? (
                <LocaleSwitcher locale={locale} path={localeSwitchPath} />
              ) : null}
              <Link
                href={signupHref}
                className="px-4 py-2 text-[14px] font-medium text-slate-600 hover:text-[#00766C] transition-colors"
              >
                Sign up
              </Link>
              <Link
                href={loginHref}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#00766C] px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-[#005A52]"
              >
                Sign in
                <ArrowRight size={13} />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl border border-[#00766C]/20 bg-white text-slate-600 hover:text-[#00766C] transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[99] flex flex-col overflow-hidden animate-fade-in"
          style={{ background: 'linear-gradient(155deg, #F0EEFF 0%, #E8F8F7 40%, #FFF5F8 75%, #FFF8F0 100%)' }}
        >
          <div
            className="absolute -top-24 -left-24 w-[400px] h-[400px] rounded-full opacity-40 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #C4B5E8 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-16 -right-16 w-[320px] h-[320px] rounded-full opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #7DCFC9 0%, transparent 70%)' }}
          />
          <div
            className="absolute inset-0 opacity-[0.035] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, #8B9BD8 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          <div className="relative z-10 flex items-center justify-between px-6 h-[68px] shrink-0">
            <Link href="/" onClick={() => setMobileOpen(false)} aria-label="BookPhysio home">
              <BpLogo size="nav" />
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-[#00766C]/20 bg-white/70 backdrop-blur-sm text-slate-600 hover:text-[#00766C] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="relative z-10 flex-1 overflow-y-auto px-5 pt-2 pb-4" aria-label="Mobile navigation">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-1 text-[#00766C]">
              Specialties
            </p>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {SPECIALTIES.map((s) => {
                const Icon = ICON_MAP[s.icon] ?? Stethoscope
                return (
                  <Link
                    key={s.slug}
                    href={`/specialty/${s.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'group flex items-center gap-3 rounded-2xl border bg-white/65 backdrop-blur-sm px-3.5 py-3 transition-all duration-150 hover:bg-white/90 hover:shadow-sm',
                      s.tint.border,
                    )}
                  >
                    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', s.tint.bg, s.tint.text)}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[13px] font-semibold text-slate-700 group-hover:text-[#00766C] transition-colors leading-tight">
                      {s.label}
                    </span>
                  </Link>
                )
              })}
            </div>

            <Link
              href={searchHref}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between px-4 py-3 mb-4 rounded-2xl bg-white/50 border border-[#00766C]/20 text-[13px] font-semibold text-slate-600 hover:bg-white/80 hover:text-[#00766C] transition-all group"
            >
              Browse all physiotherapists
              <ArrowRight size={14} className="text-slate-400 group-hover:text-[#00766C] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <div className="h-px bg-[#00766C]/10 mb-4" />

            <div className="space-y-1.5">
              <Link
                href={howItWorksHref}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium text-slate-700 bg-white/50 hover:bg-white/80 hover:text-[#00766C] transition-all"
              >
                How it works
              </Link>
              <Link
                href="/doctor-signup"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl text-[14px] font-medium text-slate-700 bg-white/50 hover:bg-white/80 hover:text-[#00766C] transition-all"
              >
                <Stethoscope size={16} className="text-[#00766C]" />
                For providers
              </Link>
            </div>
          </nav>

          <div className="relative z-10 shrink-0 px-5 pb-10 pt-3 space-y-3">
            <Link
              href={signupHref}
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-[#00766C] text-white text-[15px] font-bold active:scale-[0.98] transition-transform hover:bg-[#005A52]"
            >
              Sign up
              <ArrowRight size={16} />
            </Link>
            <Link
              href={loginHref}
              onClick={() => setMobileOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-full border border-[#00766C]/20 bg-white/60 text-[15px] font-bold text-slate-700 active:scale-[0.98] transition-transform hover:text-[#00766C]"
            >
              Sign in
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
