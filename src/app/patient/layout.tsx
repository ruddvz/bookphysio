'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import {
  LayoutDashboard, Calendar, MessageSquare,
  User, Bell, LogOut, Menu, X, ChevronRight, Search,
  CreditCard, HelpCircle,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import BpLogo from '@/components/BpLogo'

const navItems = [
  { href: '/patient/dashboard',      label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/patient/appointments',   label: 'Appointments',  icon: Calendar },
  { href: '/patient/messages',       label: 'Messages',      icon: MessageSquare },
  { href: '/patient/payments',       label: 'Payments',      icon: CreditCard },
  { href: '/patient/profile',        label: 'Profile',       icon: User },
]

export default function PatientLayout({ children }: { children: ReactNode }) {
  const pathname    = usePathname()
  const router      = useRouter()
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.phone ?? 'Patient'
  const initials    = displayName.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('') || '?'

  const handleSignOut = async () => {
    try { await signOut() } catch (e) { console.error(e) } finally { router.push('/') }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-slate-200/80 flex-col z-50">

        {/* Logo */}
        <div className="px-6 h-16 flex items-center border-b border-slate-100">
          <Link href="/patient/dashboard">
            <BpLogo size="nav" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1" aria-label="Patient navigation">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150',
                  active
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon size={18} className={active ? 'text-blue-600' : 'text-slate-400'} />
                {label}
                {active && (
                  <ChevronRight size={14} className="ml-auto text-blue-400" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-slate-100 space-y-1">
          <Link
            href="/patient/notifications"
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors",
              pathname === '/patient/notifications'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            )}
          >
            <Bell size={18} className={pathname === '/patient/notifications' ? 'text-blue-600' : 'text-slate-400'} />
            Notifications
          </Link>
          <button
            type="button"
            onClick={() => { void handleSignOut() }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} className="text-slate-400" />
            Sign out
          </button>
        </div>

        {/* User card */}
        <div className="px-3 pb-4">
          <Link
            href="/patient/profile"
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-[13px] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 truncate">{displayName}</div>
              <div className="text-[11px] text-slate-400">Patient</div>
            </div>
            <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </Link>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        <Link href="/patient/dashboard" className="flex-1">
          <BpLogo size="nav" />
        </Link>
        <Link href="/search" className="w-9 h-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600">
          <Search size={16} />
        </Link>
        <Link href="/patient/profile" className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-[12px] font-bold">
          {initials}
        </Link>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="lg:hidden fixed inset-y-0 left-0 z-[70] w-[280px] bg-white shadow-xl flex flex-col">
            <div className="px-6 h-14 flex items-center border-b border-slate-100">
              <BpLogo size="nav" />
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors',
                      active ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50'
                    )}
                  >
                    <Icon size={18} className={active ? 'text-blue-600' : 'text-slate-400'} />
                    {label}
                  </Link>
                )
              })}
            </nav>
            <div className="px-3 pb-6 border-t border-slate-100 pt-3 space-y-1">
              <Link
                href="/patient/notifications"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-slate-600 hover:bg-slate-50"
              >
                <Bell size={18} className="text-slate-400" />
                Notifications
              </Link>
              <button
                type="button"
                onClick={() => { setMobileOpen(false); void handleSignOut() }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-[260px] pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
