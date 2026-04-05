'use client';

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, FileCheck, BarChart3, LogOut, Settings } from 'lucide-react'
import { ReactNode } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()

  async function handleSignOut() {
    signOut()
    router.push('/')
  }

  const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/listings', label: 'Provider Approvals', icon: FileCheck },
    { href: '/admin/users', label: 'User Management', icon: Users },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <div className="flex min-h-screen bg-bp-surface text-bp-primary font-sans">
      
      {/* Sidebar Navigation (Compact) */}
      <aside className="sticky top-0 flex flex-col w-[80px] h-screen bg-white border-r border-bp-border shadow-sm shrink-0 items-center py-8">
        
        {/* Logo Area */}
        <Link href="/admin" className="mb-12 group outline-none">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-bp-primary text-white font-bold text-[14px] shadow-lg shadow-bp-primary/20 group-hover:scale-105 transition-transform">
            BP
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex flex-col flex-1 w-full gap-4 px-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                title={link.label}
                className={`flex items-center justify-center w-full h-14 rounded-2xl transition-all duration-200 outline-none
                  ${isActive 
                    ? 'bg-bp-accent/10 text-bp-accent shadow-sm' 
                    : 'text-bp-body hover:bg-bp-surface hover:text-bp-primary'
                  }
                `}
              >
                <link.icon className={`w-5.5 h-5.5 ${isActive ? 'text-bp-accent' : 'text-bp-body/60'}`} />
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="w-full px-3 mt-auto space-y-4">
          <button title="Settings" className="flex items-center justify-center w-full h-14 rounded-2xl text-bp-body hover:bg-bp-surface hover:text-bp-primary transition-colors outline-none cursor-pointer">
            <Settings className="w-5.5 h-5.5 text-bp-body/60" />
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            title="Log Out"
            className="flex items-center justify-center w-full h-14 rounded-2xl text-red-500 hover:bg-red-50 transition-colors outline-none cursor-pointer border border-transparent hover:border-red-100"
          >
            <LogOut className="w-5.5 h-5.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-w-0 px-8 py-10 lg:px-12">
        <div className="max-w-[1200px] mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>

    </div>
  )
}
