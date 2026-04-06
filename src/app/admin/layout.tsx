'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import {
  LayoutDashboard, ListChecks, Users, BarChart3,
  ChevronRight, LogOut, Shield,
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

  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? 'Admin'
  const initials    = displayName.split(' ').slice(0, 2).map((w: string) => w[0]?.toUpperCase() ?? '').join('') || '?'

  const handleSignOut = async () => {
    try { await signOut() } catch (e) { console.error(e) } finally { router.push('/') }
  }

  return (
    <div className="flex min-h-screen bg-slate-50">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[240px] bg-white border-r border-slate-100 flex-col z-50">

        <div className="px-5 h-16 flex items-center border-b border-slate-100">
          <Link href="/admin">
            <BpLogo size="nav" />
          </Link>
        </div>

        {/* Admin badge */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-100 rounded-lg text-red-700 text-[11px] font-bold uppercase tracking-wider">
            <Shield size={11} />
            Admin Panel
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : (pathname === href || pathname.startsWith(href + '/'))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150',
                  active
                    ? 'bg-red-50 text-red-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon size={17} className={active ? 'text-red-600' : 'text-slate-400'} />
                {label}
                {active && <ChevronRight size={13} className="ml-auto text-red-400" />}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => { void handleSignOut() }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={17} className="text-slate-400" />
            Sign out
          </button>
        </div>

        <div className="px-3 pb-4">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center text-white text-[13px] font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-slate-900 truncate">{displayName}</div>
              <div className="text-[11px] text-red-500 font-medium">Administrator</div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-[240px] min-h-screen">
        {children}
      </main>
    </div>
  )
}
