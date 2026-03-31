'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ChevronDown, Menu, X, HelpCircle, LayoutGrid, UserPlus, LogIn, Sparkles } from 'lucide-react'

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

  const closeMobile = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-[#E5E5E5]/60 h-20">
      <div className="max-w-[1142px] mx-auto px-6 md:px-[60px] h-full flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0 group" aria-label="BookPhysio home">
          <div className="relative">
            <svg width="40" height="40" viewBox="0 0 36 36" fill="none" aria-hidden="true" className="shrink-0 transition-transform group-hover:scale-105">
              <rect width="36" height="36" rx="12" fill="#00766C" className="fill-[#00766C] group-hover:fill-[#005A52] transition-colors"/>
              <path d="M10 18C10 13.58 13.58 10 18 10C20.21 10 22.21 10.9 23.66 12.34L21.54 14.46C20.63 13.55 19.38 13 18 13C15.24 13 13 15.24 13 18C13 20.76 15.24 23 18 23C20.03 23 21.78 21.82 22.63 20.1H18V17.1H26V18C26 22.42 22.42 26 18 26C13.58 26 10 22.42 10 18Z" fill="white"/>
            </svg>
          </div>
          <span className="text-[24px] font-black text-[#333333] ml-3 tracking-tighter group-hover:text-[#00766C] transition-colors">
            BookPhysio
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2" aria-label="Main navigation">
          {/* Browse dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setBrowseOpen((prev) => !prev)}
              aria-expanded={browseOpen}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 text-[15px] font-black transition-all rounded-full hover:bg-gray-50',
                browseOpen ? 'text-[#00766C] bg-teal-50/50' : 'text-[#333333]'
              )}
            >
              Browse
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", browseOpen && "rotate-180")} />
            </button>

            {browseOpen && (
              <div className="absolute left-0 top-full mt-2 bg-white border border-[#E5E5E5]/60 rounded-2xl shadow-2xl min-w-[240px] z-[110] p-2 animate-in fade-in zoom-in-95 duration-200">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 py-2">Specialties</p>
                {SPECIALTIES.map((specialty) => (
                  <Link
                    key={specialty}
                    href={`/search?specialty=${encodeURIComponent(specialty)}`}
                    className="flex items-center justify-between px-4 py-3 text-[14px] font-bold text-[#333333] rounded-xl hover:text-[#00766C] hover:bg-teal-50/50 transition-all group"
                    onClick={() => setBrowseOpen(false)}
                  >
                    {specialty}
                    <Sparkles className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link href="/help" className="px-4 py-2.5 text-[15px] font-black text-[#333333] hover:text-[#00766C] hover:bg-gray-50 rounded-full transition-all">
            Help
          </Link>

          <Link href="/list-practice" className="hidden lg:inline-flex px-4 py-2.5 text-[15px] font-black text-[#333333] hover:text-[#00766C] hover:bg-gray-50 rounded-full transition-all">
            List your practice
          </Link>
        </nav>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4 pl-4 border-l border-gray-100">
          <Link href="/login" className="text-[15px] font-black text-[#333333] hover:text-[#00766C] transition-colors flex items-center gap-1 group">
            Log in
            <ChevronDown className="w-4 h-4 text-gray-300 group-hover:text-[#00766C] transition-colors" />
          </Link>
          <Link href="/signup" className="px-7 py-3 bg-[#00766C] text-white text-[15px] font-black rounded-full hover:bg-[#005A52] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-teal-100/50">
            Sign up
          </Link>
        </div>

        {/* Mobile menu trigger */}
        <button
          className="md:hidden p-2.5 text-[#333333] bg-gray-50 rounded-xl active:scale-90 transition-transform"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-white z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col p-8 gap-8 overflow-y-auto max-h-[calc(100vh-80px)]">
            <div className="space-y-6">
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Discover</p>
               <Link onClick={closeMobile} href="/search" className="flex items-center gap-4 text-[20px] font-black text-[#333333]">
                 <div className="p-2.5 bg-teal-50 rounded-xl"><LayoutGrid className="w-6 h-6 text-[#00766C]" /></div>
                 Browse Specialties
               </Link>
               <Link onClick={closeMobile} href="/help" className="flex items-center gap-4 text-[20px] font-black text-[#333333]">
                 <div className="p-2.5 bg-teal-50 rounded-xl"><HelpCircle className="w-6 h-6 text-[#00766C]" /></div>
                 Help Center
               </Link>
            </div>

            <div className="h-px bg-gray-100"></div>

            <div className="space-y-6">
               <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Account</p>
               <Link onClick={closeMobile} href="/login" className="flex items-center gap-4 text-[20px] font-black text-[#333333]">
                 <div className="p-2.5 bg-gray-50 rounded-xl"><LogIn className="w-6 h-6 text-gray-400" /></div>
                 Log In
               </Link>
               <Link onClick={closeMobile} href="/signup" className="flex items-center gap-4 text-[20px] font-black text-[#333333]">
                 <div className="p-2.5 bg-[#00766C] rounded-xl"><UserPlus className="w-6 h-6 text-white" /></div>
                 Create Account
               </Link>
            </div>

            <div className="mt-auto pt-8">
               <Link onClick={closeMobile} href="/signup?type=provider" className="block w-full text-center py-5 bg-[#F9FAFB] border border-gray-100 text-[#333333] font-black rounded-2xl text-[16px] active:scale-95 transition-transform">
                  List your practice on <span className="text-[#00766C]">BookPhysio</span>
               </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
