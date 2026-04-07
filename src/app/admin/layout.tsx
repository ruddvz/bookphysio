'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import {
  LayoutDashboard, ListChecks, Users, BarChart3,
  ChevronRight, LogOut, Shield, Menu, X, Settings,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import BpLogo from '@/components/BpLogo'

const navItems = [
  { href: '/admin',            label: 'Overview',   icon: LayoutDashboard, exact: true },
  { href: '/admin/listings',   label: 'Approvals',  icon: ListChecks },
  { href: '/admin/users',      label: 'Users',      icon: Users },
  { href: '/admin/analytics',  label: 'Analytics',  icon: BarChart3 },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { user, signOut } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? 'Admin'
  const initials    = displayName.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('') || '?'

  const handleSignOut = async () => {
    try { await signOut() } catch (e) { console.error(e) } finally { router.push('/') }
  }

  return (
    <div className="flex min-h-screen bg-[#F1F3F5]">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[260px] bg-slate-900 flex-col z-50">

        {/* Logo */}
        <div className="px-6 h-16 flex items-center border-b border-slate-700/50">
          <Link href="/admin" className="flex items-center gap-3">
            <BpLogo size="nav" />
          </Link>
        </div>

        {/* Admin badge */}
        <div className="px-5 py-3 border-b border-slate-700/50">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-[11px] font-bold uppercase tracking-wider">
            <Shield size={11} />
            Admin Panel
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all duration-150',
                  active
                    ? 'bg-white/10 text-white font-semibold'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                )}
              >
                <Icon size={18} className={active ? 'text-amber-400' : 'text-slate-500'} />
                {label}
                {active && <ChevronRight size={14} className="ml-auto text-amber-400/60" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-700/50">
          <button
            type="button"
            onClick={() => { void handleSignOut() }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={18} className="text-slate-500" />
            Sign out
          </button>
        </div>

        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-slate-700/50">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-white text-[13px] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-white truncate">{displayName}</div>
              <div className="text-[11px] text-amber-400/80 font-medium">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 h-14 bg-slate-900 border-b border-slate-700/50 flex items-center px-4 gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 rounded-lg border border-slate-600 flex items-center justify-center text-slate-300"
        >
          {mobileOpen ? <X size={16} /> : <Menu size={16} />}
        </button>
        <Link href="/admin" className="flex-1 flex items-center gap-2">
          <BpLogo size="nav" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">Admin</span>
        </Link>
        <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-[11px] font-bold">
          {initials}
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="lg:hidden fixed inset-y-0 left-0 z-[70] w-[280px] bg-slate-900 shadow-xl flex flex-col">
            <div className="px-6 h-14 flex items-center border-b border-slate-700/50">
              <BpLogo size="nav" />
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navItems.map(({ href, label, icon: Icon, exact }) => {
                const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-colors',
                      active ? 'bg-white/10 text-white font-semibold' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                    )}
                  >
                    <Icon size={18} className={active ? 'text-amber-400' : 'text-slate-500'} />
                    {label}
                  </Link>
                )
              })}
            </nav>
            <div className="px-3 pb-6 border-t border-slate-700/50 pt-3">
              <button
                type="button"
                onClick={() => { setMobileOpen(false); void handleSignOut() }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium text-red-400 hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}

      <main className="flex-1 lg:ml-[260px] pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  )
}
