'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ChevronDown, Menu, X, HelpCircle, LayoutGrid, UserPlus, LogIn } from 'lucide-react'

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
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setBrowseOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close mobile menu when clicking a link
  const closeMobile = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#E5E5E5] h-20">
      <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0" aria-label="BookPhysio home">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="shrink-0">
            <rect width="36" height="36" rx="10" fill="#00766C"/>
            <path d="M10 18C10 13.58 13.58 10 18 10C20.21 10 22.21 10.9 23.66 12.34L21.54 14.46C20.63 13.55 19.38 13 18 13C15.24 13 13 15.24 13 18C13 20.76 15.24 23 18 23C20.03 23 21.78 21.82 22.63 20.1H18V17.1H26V18C26 22.42 22.42 26 18 26C13.58 26 10 22.42 10 18Z" fill="white"/>
          </svg>
          <span className="text-[22px] font-bold text-[#333333] ml-2.5 tracking-tight">
            BookPhysio
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {/* Browse dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setBrowseOpen((prev) => !prev)}
              aria-expanded={browseOpen}
              className={cn(
                'flex items-center gap-1 px-3 py-2 text-[16px] font-medium transition-colors hover:text-[#00766C]',
                browseOpen ? 'text-[#00766C] underline' : 'text-[#333333]'
              )}
            >
              Browse
              <ChevronDown className={cn("w-4 h-4 transition-transform", browseOpen && "rotate-180")} />
            </button>

            {browseOpen && (
              <div className="absolute left-0 top-full mt-1 bg-white border border-[#E5E5E5] rounded-[8px] shadow-lg min-w-[200px] z-[100] py-1">
                {SPECIALTIES.map((specialty) => (
                  <Link
                    key={specialty}
                    href={`/search?specialty=${encodeURIComponent(specialty)}`}
                    className="block px-4 py-2.5 text-[15px] text-[#333333] hover:text-[#00766C] hover:bg-[#E6F4F3] transition-colors"
                    onClick={() => setBrowseOpen(false)}
                  >
                    {specialty}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/help" className="px-3 py-2 text-[16px] font-medium text-[#333333] hover:text-[#00766C] transition-colors">
            Help
          </Link>

          <Link href="/list-practice" className="hidden lg:inline-flex px-3 py-2 text-[16px] font-medium text-[#333333] hover:text-[#00766C] transition-colors">
            List your practice
          </Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-[16px] font-medium text-[#333333] hover:text-[#00766C] transition-colors flex items-center gap-1">
            Log in
            <ChevronDown className="w-4 h-4" />
          </Link>
          <Link href="/signup" className="px-6 py-2.5 bg-[#00766C] text-white text-[16px] font-semibold rounded-[24px] hover:bg-[#005A52] transition-colors">
            Sign up
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          className="md:hidden p-2 text-[#333333] focus:outline-none"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-white z-[100] animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col p-6 gap-6">
            <div className="space-y-4">
               <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest">Discover</p>
               <Link onClick={closeMobile} href="/search" className="flex items-center gap-3 text-[18px] font-semibold text-[#333333]">
                 <LayoutGrid className="w-5 h-5 text-[#00766C]" />
                 Browse Specialties
               </Link>
               <Link onClick={closeMobile} href="/help" className="flex items-center gap-3 text-[18px] font-semibold text-[#333333]">
                 <HelpCircle className="w-5 h-5 text-[#00766C]" />
                 Help Center
               </Link>
            </div>

            <div className="h-px bg-[#F3F4F6]"></div>

            <div className="space-y-4">
               <p className="text-[12px] font-bold text-[#9CA3AF] uppercase tracking-widest">Account</p>
               <Link onClick={closeMobile} href="/login" className="flex items-center gap-3 text-[18px] font-semibold text-[#333333]">
                 <LogIn className="w-5 h-5 text-[#00766C]" />
                 Log In
               </Link>
               <Link onClick={closeMobile} href="/signup" className="flex items-center gap-3 text-[18px] font-semibold text-[#333333]">
                 <UserPlus className="w-5 h-5 text-[#00766C]" />
                 Create Account
               </Link>
            </div>

            <div className="mt-auto pb-10">
               <Link onClick={closeMobile} href="/signup?type=provider" className="block w-full text-center py-4 bg-[#E6F4F3] text-[#00766C] font-bold rounded-[12px] text-[16px]">
                  List your practice on BookPhysio
               </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
