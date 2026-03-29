'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Footer from '@/components/Footer'
import { ReactNode } from 'react'
import { Home, CalendarDays, MessageSquare, ChevronDown } from 'lucide-react'

const navItems = [
  { href: '/patient/dashboard', label: 'Home', icon: Home },
  { href: '/patient/appointments', label: 'Appointments', icon: CalendarDays },
  { href: '/patient/messages', label: 'Messages', icon: MessageSquare },
]

export default function PatientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="bg-[#F7F8F9] min-h-screen flex flex-col">
      {/* Authenticated Navbar for Patient */}
      <header className="bg-white border-b border-[#E5E5E5] h-[72px] sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1142px] mx-auto px-6 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center no-underline group">
            <span className="text-[20px] font-bold text-[#00766C] tracking-tight group-hover:text-[#005A52] transition-colors">
              BookPhysio
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
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
            
            {/* User Dropdown Profile */}
            <div className="ml-3 w-9 h-9 rounded-full bg-[#00766C] text-white flex items-center justify-center text-[13px] font-bold cursor-pointer hover:bg-[#005A52] transition-colors">
              RV
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </div>
  )
}
