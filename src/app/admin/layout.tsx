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
      
      {/* Sidebar Navigation */}
      <aside className="sticky top-0 flex flex-col w-[260px] h-screen bg-white border-r border-bp-border shadow-sm shrink-0">
        
        {/* Logo Area */}
        <div className="px-6 py-6 border-b border-bp-border">
          <Link href="/admin" className="flex items-center gap-2 group outline-none">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-bp-accent text-white font-bold text-center leading-none">
              BP
            </div>
            <span className="text-[20px] font-bold tracking-tight text-bp-primary group-hover:text-bp-accent transition-colors">
              BookPhysio <span className="text-bp-accent font-semibold">Admin</span>
            </span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col flex-1 gap-1 px-4 py-6 overflow-y-auto">
          <p className="px-2 mb-2 text-[12px] font-semibold tracking-wider text-bp-body/60 uppercase">
            Platform
          </p>
          
          {navLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[15px] font-medium transition-all duration-200 outline-none
                  ${isActive 
                    ? 'bg-bp-accent/10 text-bp-accent shadow-sm' 
                    : 'text-bp-body hover:bg-[#F9FAFB] hover:text-bp-primary'
                  }
                `}
              >
                <link.icon className={`w-5 h-5 ${isActive ? 'text-bp-accent' : 'text-bp-body/60'}`} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-bp-border space-y-2">
          <button className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-bp-body hover:bg-[#F9FAFB] hover:text-bp-primary transition-colors outline-none cursor-pointer">
            <Settings className="w-5 h-5 text-bp-body/60" />
            Settings
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-[#DC2626] hover:bg-[#FEF2F2] transition-colors outline-none cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-[#DC2626]/80" />
            Log out
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
