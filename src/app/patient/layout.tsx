'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useState } from 'react'
import {
  Home,
  Calendar,
  Inbox,
  User,
  Bell,
  LogOut,
  Sparkles,
  Menu,
  X,
  Heart,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/patient/dashboard', label: 'Dashboard', icon: Home },
  { href: '/patient/appointments', label: 'Appointments', icon: Calendar },
  { href: '/patient/messages', label: 'Messages', icon: Inbox },
  { href: '/patient/motio', label: 'Motio AI', icon: Sparkles },
  { href: '/patient/profile', label: 'My Health', icon: User },
]

export default function PatientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.phone ?? 'Patient'
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('') || '?'

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  return (
    <div className="flex min-h-screen bg-bp-surface font-sans selection:bg-bp-accent/10 selection:text-bp-accent">
      
      {/* ── Compact Sidebar Navigation (Desktop) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[80px] bg-white/60 backdrop-blur-3xl border-r border-white z-50 flex-col items-center py-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] ring-1 ring-bp-primary/5">
        {/* Branding Icon */}
        <Link href="/patient/dashboard" className="mb-10 group">
          <div className="w-12 h-12 bg-bp-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-bp-accent/20 group-hover:scale-105 transition-transform duration-300">
            <Heart size={24} strokeWidth={3} fill="currentColor" className="animate-pulse" />
          </div>
        </Link>

        {/* Primary Nav */}
        <nav className="flex-1 w-full px-3 space-y-4">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                title={label}
                className={cn(
                  "flex items-center justify-center w-full h-14 rounded-2xl transition-all duration-300 group relative",
                  isActive 
                    ? "bg-bp-accent/10 text-bp-accent shadow-sm" 
                    : "text-bp-body hover:bg-bp-surface hover:text-bp-primary"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 3 : 2} />
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-bp-accent rounded-l-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Action Belt */}
        <div className="w-full px-3 space-y-4 mt-auto">
          <button 
            title="Notifications"
            className="w-full h-14 rounded-2xl bg-bp-surface border border-bp-border flex items-center justify-center text-bp-body/40 hover:text-bp-accent transition-all relative group"
          >
            <Bell size={22} />
            <div className="absolute top-4 right-4 w-2 h-2 bg-bp-secondary border-2 border-white rounded-full transition-transform group-hover:scale-125"></div>
          </button>
          
          <Link 
            href="/patient/profile" 
            title="Profile"
            className="w-full h-14 rounded-full bg-bp-primary text-white flex items-center justify-center text-[12px] font-bold shadow-lg shadow-bp-primary/20 hover:scale-105 transition-transform"
          >
            {initials}
          </Link>

          <button
            onClick={handleSignOut}
            title="Sign Out"
            className="w-full h-14 flex items-center justify-center rounded-2xl bg-white border border-bp-border text-bp-body hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all active:scale-95 shadow-sm"
          >
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      {/* ── Mobile Control Bar ── */}
      <header className="lg:hidden fixed top-0 inset-x-0 h-[72px] bg-white/80 backdrop-blur-2xl border-b border-white z-50 px-6 flex items-center justify-between shadow-[0_4px_20px_-8px_rgba(0,0,0,0.06)] ring-1 ring-bp-primary/5">
        <Link href="/patient/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-bp-accent rounded-[12px] flex items-center justify-center text-white shadow-lg shadow-bp-accent/20">
            <Heart size={20} strokeWidth={3} fill="currentColor" />
          </div>
          <span className="text-[18px] font-bold text-bp-primary tracking-tighter uppercase tracking-widest text-[12px]">Dashboard</span>
        </Link>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-11 h-11 rounded-2xl bg-bp-surface flex items-center justify-center border border-bp-border active:scale-90 transition-transform"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[60] animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-bp-primary/95 backdrop-blur-md" onClick={() => setIsMobileMenuOpen(false)}></div>
          <nav className="relative h-full flex flex-col p-10 pt-32 space-y-4">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-5 p-6 rounded-3xl text-[20px] font-bold transition-all",
                    isActive ? "bg-white text-bp-primary shadow-2xl" : "text-white/60"
                  )}
                >
                  <Icon size={26} strokeWidth={3} />
                  {label}
                </Link>
              )
            })}
            <div className="h-px bg-white/10 my-8"></div>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-3 p-5 rounded-3xl bg-bp-accent text-white text-[18px] font-bold shadow-xl shadow-bp-accent/20 active:scale-95 transition-transform"
            >
              <LogOut size={24} />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* ── Main Dashboard Content ── */}
      <main className={cn(
        "flex-1 transition-all duration-500 bg-bp-surface",
        "lg:ml-[80px] pt-[72px] lg:pt-0"
      )}>
        <div className="min-h-full">
          {children}
        </div>
      </main>
    </div>
  )
}
