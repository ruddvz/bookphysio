'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { ChevronDown, HelpCircle, LayoutGrid, LogIn, Menu, Sparkles, UserPlus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const SPECIALTIES = [
  'Sports Physio',
  'Neuro Physio',
  'Ortho Physio',
  'Paediatric Physio',
  "Women's Health",
  'Geriatric Physio',
]

export default function Navbar() {
  const [browseOpen, setBrowseOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    <header className="sticky top-0 z-[100] w-full border-b border-[#E6E8EC] bg-white/90 backdrop-blur-md">
      <div className="bp-shell flex h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 text-[#111827]" aria-label="BookPhysio home">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#00766C] text-white shadow-[0_14px_24px_-18px_rgba(0,118,108,0.8)]">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
              <path d="M6 11H9L10.5 7L13.5 15L15 11H18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-[18px] font-semibold tracking-[-0.03em] md:text-[20px]">BookPhysio</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setBrowseOpen((previous) => !previous)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-medium transition-colors hover:bg-[#F4F7F7]',
                browseOpen ? 'bg-[#E6F4F3] text-[#005A52]' : 'text-slate-700'
              )}
            >
              Browse
              <ChevronDown className={cn('h-4 w-4 transition-transform', browseOpen && 'rotate-180')} />
            </button>

            {browseOpen && (
              <div className="absolute left-0 top-full mt-3 w-[280px] overflow-hidden rounded-[24px] border border-[#E6E8EC] bg-white p-2 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.24)]">
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Specialties</p>
                {SPECIALTIES.map((specialty) => (
                  <Link
                    key={specialty}
                    href={`/search?specialty=${encodeURIComponent(specialty)}`}
                    className="flex items-center justify-between rounded-[16px] px-3 py-3 text-[14px] font-medium text-slate-700 transition-colors hover:bg-[#F6FAF9] hover:text-[#005A52]"
                    onClick={() => setBrowseOpen(false)}
                  >
                    {specialty}
                    <Sparkles className="h-3.5 w-3.5 text-slate-300" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/how-it-works" className="rounded-full px-4 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:bg-[#F4F7F7] hover:text-[#005A52]">
            How it works
          </Link>
          <Link href="/doctor-signup" className="rounded-full px-4 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:bg-[#F4F7F7] hover:text-[#005A52]">
            For providers
          </Link>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[14px] font-medium text-slate-700 transition-colors hover:bg-[#F4F7F7] hover:text-[#005A52]">
            Log in
          </Link>
          <Link href="/signup" className="inline-flex items-center gap-2 rounded-full bg-[#00766C] px-5 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[#005A52]">
            Sign up
          </Link>
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#E6E8EC] bg-white text-slate-700 transition-all hover:border-[#00766C]/30 hover:text-[#005A52] lg:hidden"
          onClick={() => setMobileMenuOpen((previous) => !previous)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-[#E6E8EC] bg-white lg:hidden">
          <nav className="bp-shell flex flex-col gap-4 py-5">
            <div className="space-y-2">
              <Link onClick={closeMobile} href="/search" className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-[15px] font-medium text-slate-700 transition-colors hover:bg-[#F4F7F7] hover:text-[#005A52]">
                <LayoutGrid className="h-5 w-5 text-[#00766C]" />
                Browse Specialties
              </Link>
              <Link onClick={closeMobile} href="/how-it-works" className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-[15px] font-medium text-slate-700 transition-colors hover:bg-[#F4F7F7] hover:text-[#005A52]">
                <HelpCircle className="h-5 w-5 text-[#00766C]" />
                How it works
              </Link>
            </div>

            <div className="h-px bg-[#E6E8EC]" />

            <div className="space-y-2">
              <Link onClick={closeMobile} href="/login" className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-[15px] font-medium text-slate-700 transition-colors hover:bg-[#F4F7F7] hover:text-[#005A52]">
                <LogIn className="h-5 w-5 text-slate-400" />
                Log in
              </Link>
              <Link onClick={closeMobile} href="/signup" className="flex items-center gap-3 rounded-[18px] bg-[#00766C] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#005A52]">
                <UserPlus className="h-5 w-5" />
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}