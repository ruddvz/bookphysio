'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useState, useEffect } from 'react'

import { Home, Calendar, Inbox, BarChart3, Users, Activity, Bell, LogOut, Search, Menu, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/provider/dashboard', label: 'Overview', icon: Home },
  { href: '/provider/calendar', label: 'Calendar', icon: Calendar },
  { href: '/provider/messages', label: 'Messages', icon: Inbox },
  { href: '/provider/earnings', label: 'Performance', icon: BarChart3 },
  { href: '/provider/patients', label: 'Patients', icon: Users },
]

export default function ProviderLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
   const { user, signOut } = useAuth()
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.phone ?? 'Practitioner'
  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('') || '?'

  async function handleSignOut() {
      signOut()
    router.push('/')
  }

  return (
    <div className="bg-bp-surface min-h-screen flex flex-col font-sans selection:bg-bp-accent/10 selection:text-bp-accent">
      
      {/* ── Practitioner Sidebar (Compact) ── */}
      <aside className={cn(
        "hidden lg:flex fixed left-0 top-0 bottom-0 w-[80px] bg-white flex-col z-[60] border-r border-bp-border shadow-sm transition-all duration-300 items-center py-8"
      )}>
        <Link href="/provider/dashboard" className="mb-10 group no-underline">
          <div className="w-12 h-12 bg-bp-accent rounded-2xl flex items-center justify-center text-white shadow-lg shadow-bp-accent/20 group-hover:scale-105 transition-transform">
            <Activity size={24} strokeWidth={3} />
          </div>
        </Link>

        <nav className="flex-1 w-full px-3 space-y-4">
           {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                 <Link
                    key={href}
                    href={href}
                    title={label}
                    className={cn(
                       "flex items-center justify-center w-full h-14 rounded-2xl transition-all duration-300 group",
                       isActive 
                          ? "bg-bp-accent/10 text-bp-accent shadow-sm" 
                          : "text-bp-body hover:text-bp-primary hover:bg-bp-surface"
                    )}
                 >
                    <Icon size={22} strokeWidth={isActive ? 3 : 2} className={cn("transition-colors", isActive ? "text-bp-accent" : "text-bp-body/30 group-hover:text-bp-primary")} />
                 </Link>
              )
           })}
        </nav>

        <div className="w-full px-3 mt-auto space-y-4">
           <button
              title="Notifications"
              className="w-full h-14 rounded-2xl bg-bp-surface border border-bp-border flex items-center justify-center text-bp-body/40 hover:text-bp-accent transition-colors relative"
           >
              <Bell size={22} />
              <div className="absolute top-4 right-4 w-2 h-2 bg-bp-secondary border-2 border-white rounded-full"></div>
           </button>

           <Link href="/provider/profile" title="Profile Settings" className="w-full h-14 rounded-full bg-bp-primary text-white flex items-center justify-center text-[12px] font-bold shadow-lg shadow-bp-primary/10 hover:scale-105 transition-transform">
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

      {/* ── Top Bar Removed in favor of Compact Sidebar ── */}

      {/* ── Mobile Navigation ── */}
      <header className={cn(
        "lg:hidden fixed top-0 inset-x-0 h-[72px] z-50 transition-all duration-300 border-b",
        scrolled ? "bg-white/80 backdrop-blur-xl border-bp-border shadow-sm" : "bg-white border-transparent"
      )}>
        <div className="px-6 h-full flex items-center justify-between">
           <Link href="/provider/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-bp-accent rounded-lg flex items-center justify-center text-white shadow-lg shadow-bp-accent/20">
                 <Activity size={18} strokeWidth={3} />
              </div>
              <span className="text-[18px] font-bold text-bp-primary tracking-tighter">Practitioner</span>
           </Link>
           <button 
             onClick={() => setSidebarOpen(!isSidebarOpen)}
             className="w-10 h-10 rounded-xl bg-bp-surface flex items-center justify-center text-bp-primary border border-bp-border"
           >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {isSidebarOpen && (
         <div className="lg:hidden fixed inset-0 z-50 pt-[72px] animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-bp-primary/95 backdrop-blur-md"></div>
            <nav className="relative p-8 space-y-4">
               {navItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || pathname.startsWith(href + '/')
                  return (
                     <Link
                        key={href}
                        href={href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                           "flex items-center gap-5 p-5 rounded-3xl text-[20px] font-bold transition-all",
                           isActive ? "bg-white text-bp-primary shadow-xl" : "text-white/60"
                        )}
                     >
                        <Icon size={24} strokeWidth={3} />
                        {label}
                     </Link>
                  )
               })}
               <div className="h-px bg-white/10 my-10"></div>
               <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-4 p-5 rounded-3xl bg-white/5 text-red-400 text-[20px] font-bold border border-white/5"
               >
                  <LogOut size={24} />
                  Log Out
               </button>
            </nav>
         </div>
      )}

      {/* ── Main Area ── */}
      <main className={cn(
        "flex-1 transition-all duration-300 bg-bp-surface min-h-screen",
        "lg:ml-[80px] pt-[72px] lg:pt-0"
      )}>
         <div className="min-h-full">
            {children}
         </div>
      </main>

      {/* Mobile Persistent Floating Bottom Nav */}
      <nav className="lg:hidden fixed bottom-6 inset-x-6 h-[72px] bg-bp-primary rounded-[32px] shadow-2xl z-50 flex items-center justify-around px-6">
         {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
               <Link 
                  key={href} 
                  href={href} 
                  className={cn(
                     "flex flex-col items-center gap-1 transition-all",
                     isActive ? "text-bp-accent/70" : "text-white/30"
                  )}
               >
                  <div className={cn(
                     "w-12 h-9 rounded-full flex items-center justify-center transition-all",
                     isActive ? "bg-white/5" : "bg-transparent"
                  )}>
                     <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-widest">{label === 'Overview' ? 'Home' : label}</span>
               </Link>
            )
         })}
      </nav>

      <footer className="lg:ml-[80px] py-12 px-10 border-t border-bp-border bg-bp-surface">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 group">
            <div className="flex items-center gap-3">
               <Activity size={16} />
               <span className="text-[11px] font-bold tracking-[0.2em] uppercase">© 2026 Practical Intelligence Hub</span>
            </div>
            <div className="flex gap-10">
               {['Security', 'Guidelines', 'Compliance', 'Help'].map((item) => (
                  <span key={item} className="text-[11px] font-bold tracking-[0.2em] uppercase hover:text-bp-accent transition-colors cursor-pointer">{item}</span>
               ))}
            </div>
         </div>
      </footer>
    </div>
  )
}
