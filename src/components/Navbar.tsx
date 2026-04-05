'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, HelpCircle, LayoutGrid, LogIn, Menu, Sparkles, Stethoscope, UserPlus, X } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { getLocalizedStaticHref, type LocalizedStaticPath, type StaticLocale } from '@/lib/i18n/static-pages'
import { cn } from '@/lib/utils'

const SPECIALTIES = [
  {
    searchValue: 'Sports Physio',
    labels: { en: 'Sports Physio', hi: 'स्पोर्ट्स फिजियो' },
  },
  {
    searchValue: 'Neuro Physio',
    labels: { en: 'Neuro Physio', hi: 'न्यूरो फिजियो' },
  },
  {
    searchValue: 'Ortho Physio',
    labels: { en: 'Ortho Physio', hi: 'ऑर्थो फिजियो' },
  },
  {
    searchValue: 'Paediatric Physio',
    labels: { en: 'Paediatric Physio', hi: 'पीडियाट्रिक फिजियो' },
  },
  {
    searchValue: "Women's Health",
    labels: { en: "Women's Health", hi: 'महिला स्वास्थ्य' },
  },
  {
    searchValue: 'Geriatric Physio',
    labels: { en: 'Geriatric Physio', hi: 'जेरियाट्रिक फिजियो' },
  },
] as const

const NAVBAR_COPY = {
  en: {
    homeLabel: 'BookPhysio home',
    browse: 'Browse',
    specialties: 'Specialties',
    howItWorks: 'How it works',
    forProviders: 'For providers',
    logIn: 'Log in',
    findCare: 'Find care',
    mobileBrowse: 'Browse Specialties',
  },
  hi: {
    homeLabel: 'BookPhysio होम',
    browse: 'ब्राउज़',
    specialties: 'विशेषज्ञताएं',
    howItWorks: 'यह कैसे काम करता है',
    forProviders: 'फिजियोथेरेपिस्ट्स के लिए',
    logIn: 'लॉग इन',
    findCare: 'देखभाल खोजें',
    mobileBrowse: 'विशेषज्ञताएं ब्राउज़ करें',
  },
} as const

export default function Navbar({
  locale,
  localeSwitchPath,
}: {
  locale?: StaticLocale
  localeSwitchPath?: LocalizedStaticPath
} = {}) {
  const [browseOpen, setBrowseOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const effectiveLocale = locale ?? 'en'
  const copy = NAVBAR_COPY[effectiveLocale]
  const howItWorksHref = locale ? getLocalizedStaticHref(locale, '/how-it-works') : '/how-it-works'

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setBrowseOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const closeMobile = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-[100] w-full border-b border-bp-border bg-white/80 backdrop-blur-md selection:bg-bp-accent/10 selection:text-bp-accent">
      <div className="bp-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center text-bp-primary" aria-label={copy.homeLabel}>
          <BpLogo priority size="nav" />
        </Link>

        <nav className="hidden items-center gap-1.5 lg:flex" aria-label="Main navigation">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setBrowseOpen((previous) => !previous)}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold transition-all',
                browseOpen ? 'bg-bp-accent/10 text-bp-accent ring-1 ring-bp-accent/20' : 'text-bp-body/60 hover:bg-bp-surface hover:text-bp-primary'
              )}
            >
              {copy.browse}
              <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', browseOpen && 'rotate-180')} />
            </button>

            {browseOpen && (
              <div className="absolute left-0 top-full mt-3 w-[280px] overflow-hidden rounded-2xl border border-bp-border bg-white p-2 shadow-2xl shadow-bp-primary/10 animate-in zoom-in-95 duration-200">
                <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bp-body/40 mb-1">{copy.specialties}</p>
                {SPECIALTIES.map((specialty) => (
                  <Link
                    key={specialty.searchValue}
                    href={`/search?specialty=${encodeURIComponent(specialty.searchValue)}`}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-[14px] font-bold text-bp-body/70 transition-all hover:bg-bp-surface hover:text-bp-accent"
                    onClick={() => setBrowseOpen(false)}
                  >
                    {specialty.labels[effectiveLocale]}
                    <Sparkles className="h-3.5 w-3.5 text-bp-accent/30" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href={howItWorksHref} className="rounded-xl px-5 py-2.5 text-[14px] font-bold text-bp-body/60 transition-all hover:bg-bp-surface hover:text-bp-primary">
            {copy.howItWorks}
          </Link>
          <Link href="/doctor-signup" className="rounded-xl px-5 py-2.5 text-[14px] font-bold text-bp-body/60 transition-all hover:bg-bp-surface hover:text-bp-primary">
            {copy.forProviders}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {locale && localeSwitchPath ? <LocaleSwitcher locale={locale} path={localeSwitchPath} /> : null}
          <Link href="/login" className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-bold text-bp-body/60 transition-all hover:bg-bp-surface hover:text-bp-primary">
            {copy.logIn}
          </Link>
          <Link href="/search" className="inline-flex items-center gap-2 rounded-xl bg-bp-primary px-6 py-3 text-[14px] font-bold text-white transition-all hover:bg-bp-accent hover:shadow-xl hover:shadow-bp-primary/10 active:scale-[0.98]">
            {copy.findCare}
          </Link>
        </div>

        {mobileMenuOpen ? (
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-bp-border bg-white text-bp-body transition-all hover:border-bp-accent/30 hover:text-bp-accent lg:hidden shadow-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Toggle menu"
            aria-controls="mobile-navigation"
            aria-expanded="true"
          >
            <X className="h-5 w-5" strokeWidth={3} />
          </button>
        ) : (
          <button
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border-2 border-bp-border bg-white text-bp-body transition-all hover:border-bp-accent/30 hover:text-bp-accent lg:hidden shadow-sm"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Toggle menu"
            aria-controls="mobile-navigation"
            aria-expanded="false"
          >
            <Menu className="h-5 w-5" strokeWidth={3} />
          </button>
        )}
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-bp-border bg-white lg:hidden animate-in slide-in-from-top-4 duration-300">
          <nav id="mobile-navigation" className="bp-shell flex flex-col gap-6 py-8">
            {locale && localeSwitchPath ? <LocaleSwitcher locale={locale} path={localeSwitchPath} className="w-fit" /> : null}
            <div className="grid gap-2">
              <Link onClick={closeMobile} href="/search" className="flex items-center gap-4 rounded-2xl px-5 py-4 text-[16px] font-bold text-bp-body hover:bg-bp-surface transition-all">
                <LayoutGrid className="h-5 w-5 text-bp-accent" />
                {copy.mobileBrowse}
              </Link>
              <Link onClick={closeMobile} href={howItWorksHref} className="flex items-center gap-4 rounded-2xl px-5 py-4 text-[16px] font-bold text-bp-body hover:bg-bp-surface transition-all">
                <HelpCircle className="h-5 w-5 text-bp-accent" />
                {copy.howItWorks}
              </Link>
              <Link onClick={closeMobile} href="/doctor-signup" className="flex items-center gap-4 rounded-2xl px-5 py-4 text-[16px] font-bold text-bp-body hover:bg-bp-surface transition-all">
                <Stethoscope className="h-5 w-5 text-bp-accent" />
                {copy.forProviders}
              </Link>
            </div>

            <div className="h-px bg-bp-border" />

            <div className="grid gap-3">
              <Link onClick={closeMobile} href="/login" className="flex items-center gap-4 rounded-2xl px-5 py-4 text-[16px] font-bold text-bp-body hover:bg-bp-surface transition-all">
                <LogIn className="h-5 w-5 text-bp-body/40" />
                {copy.logIn}
              </Link>
              <Link onClick={closeMobile} href="/search" className="flex items-center gap-4 rounded-2xl bg-bp-primary px-5 py-5 text-[16px] font-bold text-white transition-all shadow-xl shadow-bp-primary/10">
                <UserPlus className="h-5 w-5" />
                {copy.findCare}
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}