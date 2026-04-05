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
    <header className="sticky top-0 z-[100] w-full border-b border-[#ddd3c6] bg-[#fffaf4]/90 backdrop-blur-md">
      <div className="bp-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center text-[#18312d]" aria-label={copy.homeLabel}>
          <BpLogo priority size="nav" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setBrowseOpen((previous) => !previous)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition-colors hover:bg-[#F4F7F7]',
                browseOpen ? 'bg-[#dcefe9] text-[#18312d]' : 'text-[#4f5e5a]'
              )}
            >
              {copy.browse}
              <ChevronDown className={cn('h-4 w-4 transition-transform', browseOpen && 'rotate-180')} />
            </button>

            {browseOpen && (
              <div className="absolute left-0 top-full mt-3 w-[280px] overflow-hidden rounded-[24px] border border-[#ddd3c6] bg-[#fffaf4] p-2 shadow-[0_24px_50px_-30px_rgba(24,49,45,0.24)]">
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7d8a85]">{copy.specialties}</p>
                {SPECIALTIES.map((specialty) => (
                  <Link
                    key={specialty.searchValue}
                    href={`/search?specialty=${encodeURIComponent(specialty.searchValue)}`}
                    className="flex items-center justify-between rounded-[16px] px-3 py-3 text-[14px] font-medium text-[#4f5e5a] transition-colors hover:bg-white hover:text-[#0f7668]"
                    onClick={() => setBrowseOpen(false)}
                  >
                    {specialty.labels[effectiveLocale]}
                    <Sparkles className="h-3.5 w-3.5 text-slate-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href={howItWorksHref} className="rounded-full px-4 py-2 text-[14px] font-medium text-[#4f5e5a] transition-colors hover:bg-white hover:text-[#0f7668]">
            {copy.howItWorks}
          </Link>
          <Link href="/doctor-signup" className="rounded-full px-4 py-2 text-[14px] font-medium text-[#4f5e5a] transition-colors hover:bg-white hover:text-[#0f7668]">
            {copy.forProviders}
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {locale && localeSwitchPath ? <LocaleSwitcher locale={locale} path={localeSwitchPath} /> : null}
          <Link href="/login" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium text-[#4f5e5a] transition-colors hover:bg-white hover:text-[#0f7668]">
            {copy.logIn}
          </Link>
          <Link href="/search" className="inline-flex items-center gap-2 rounded-full bg-[#18312d] px-5 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[#0f7668]">
            {copy.findCare}
          </Link>
        </div>

        {mobileMenuOpen ? (
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#ddd3c6] bg-white text-[#4f5e5a] transition-all hover:border-[#0f7668]/30 hover:text-[#0f7668] lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Toggle menu"
            aria-controls="mobile-navigation"
            aria-expanded="true"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#ddd3c6] bg-white text-[#4f5e5a] transition-all hover:border-[#0f7668]/30 hover:text-[#0f7668] lg:hidden"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Toggle menu"
            aria-controls="mobile-navigation"
            aria-expanded="false"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#ddd3c6] bg-[#fffaf4] lg:hidden">
          <nav id="mobile-navigation" className="bp-shell flex flex-col gap-4 py-5">
            {locale && localeSwitchPath ? <LocaleSwitcher locale={locale} path={localeSwitchPath} className="w-fit" /> : null}
            <div className="space-y-2">
              <Link onClick={closeMobile} href="/search" className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-[15px] font-medium text-[#4f5e5a] transition-colors hover:bg-white hover:text-[#0f7668]">
                <LayoutGrid className="h-5 w-5 text-[#0f7668]" />
                {copy.mobileBrowse}
              </Link>
              <Link onClick={closeMobile} href={howItWorksHref} className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-[15px] font-medium text-[#4f5e5a] transition-colors hover:bg-white hover:text-[#0f7668]">
                <HelpCircle className="h-5 w-5 text-[#0f7668]" />
                {copy.howItWorks}
              </Link>
              <Link onClick={closeMobile} href="/doctor-signup" className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-[15px] font-medium text-[#4f5e5a] transition-colors hover:bg-white hover:text-[#0f7668]">
                <Stethoscope className="h-5 w-5 text-[#0f7668]" />
                {copy.forProviders}
              </Link>
            </div>

            <div className="h-px bg-[#ddd3c6]" />

            <div className="space-y-2">
              <Link onClick={closeMobile} href="/login" className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-[15px] font-medium text-[#4f5e5a] transition-colors hover:bg-white hover:text-[#0f7668]">
                <LogIn className="h-5 w-5 text-[#7d8a85]" />
                {copy.logIn}
              </Link>
              <Link onClick={closeMobile} href="/search" className="flex items-center gap-3 rounded-[18px] bg-[#18312d] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#0f7668]">
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