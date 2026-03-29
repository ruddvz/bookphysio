'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'
import Footer from '@/components/Footer'
import { Home, Calendar, Inbox, BarChart3, Users, Megaphone, ChevronDown } from 'lucide-react'

const navItems = [
  { href: '/provider/dashboard', label: 'Home', icon: Home },
  { href: '/provider/calendar', label: 'Calendar', icon: Calendar },
  { href: '/provider/messages', label: 'Inbox', icon: Inbox },
  { href: '/provider/earnings', label: 'Performance', icon: BarChart3 },
  { href: '/provider/patients', label: 'Patients', icon: Users },
]

export default function ProviderLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="bg-[#F7F8F9] min-h-screen flex flex-col">
      {/* Provider Portal Navbar */}
      <header className="bg-white border-b border-[#E5E5E5] h-[72px] sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/provider/dashboard" className="flex items-center gap-2 no-underline group">
            <span className="text-[20px] font-bold text-[#00766C] tracking-tight group-hover:text-[#005A52] transition-colors">
              BookPhysio
            </span>
            <span className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-widest hidden md:inline">
              Provider
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[14px] font-medium no-underline transition-colors ${
                    isActive
                      ? 'text-[#00766C] bg-[#E6F4F3]'
                      : 'text-[#666666] hover:text-[#333333] hover:bg-[#F3F4F6]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden lg:inline">{label}</span>
                </Link>
              )
            })}

            {/* Provider Settings Dropdown */}
            <div className="ml-4 flex items-center gap-2 px-4 py-2 border border-[#E5E5E5] rounded-full text-[14px] font-medium cursor-pointer hover:bg-[#F9FAFB] transition-colors">
              <div className="w-7 h-7 rounded-full bg-[#00766C] text-white flex items-center justify-center text-[11px] font-bold">
                LP
              </div>
              <span className="hidden md:inline text-[#333333]">lokistr</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF]" />
            </div>
          </nav>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}
