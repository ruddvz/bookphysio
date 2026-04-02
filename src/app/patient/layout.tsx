'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Footer from '@/components/Footer'
import { ReactNode, useState, useEffect } from 'react'
import { Home, CalendarDays, MessageSquare, LogOut, Bell, User, Menu, X, ChevronRight, Activity } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/patient/dashboard', label: 'Overview', icon: Home },
  { href: '/patient/appointments', label: 'My Sessions', icon: CalendarDays },
  { href: '/patient/messages', label: 'Messages', icon: MessageSquare },
]

export default function PatientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const [isSidebarOpen, setSidebarOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const displayName = (user?.user_metadata?.full_name as string | undefined) ?? user?.phone ?? 'Member'
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
    <div className="bg-bp-surface min-h-screen flex flex-col font-sans selection:bg-bp-accent/5 selection:text-bp-accent">
      
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[280px] bg-bp-primary flex-col z-[60] shadow-2xl shadow-bp-primary/20">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 no-underline group focus:outline-none focus:ring-2 focus:ring-bp-accent/50 rounded-lg">
             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-bp-primary shadow-lg group-hover:scale-105 transition-transform">
                <Activity size={22} strokeWidth={3} />
             </div>
            <span className="text-[22px] font-bold text-white tracking-tighter">
              BookPhysio
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          <div className="px-5 mb-4 opacity-40">
             <p className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Patient Hub</p>
          </div>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center justify-between px-5 py-4 rounded-2xl text-[15px] font-bold transition-all duration-300 group relative overflow-hidden",
                  isActive
                    ? "bg-white/15 text-white shadow-lg backdrop-blur-md"
                    : "text-white/50 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                   <span className="absolute left-0 top-0 bottom-0 w-1 bg-bp-accent rounded-r-full shadow-[2px_0_12px_rgba(18,179,160,0.5)]"></span>
                )}
                <div className="flex items-center gap-4">
                  <Icon size={20} strokeWidth={isActive ? 3 : 2} className={cn(isActive ? "text-bp-accent scale-110" : "group-hover:scale-110 transition-transform")} />
                  <span className="tracking-tight">{label}</span>
                </div>
                {isActive && <div className="w-1.5 h-1.5 rounded-full bg-bp-accent shadow-[0_0_8px_rgba(18,179,160,0.8)] animate-pulse"></div>}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 mt-auto">
           <div className="bg-white/10 backdrop-blur-xl rounded-[32px] p-5 border border-white/5 shadow-inner">
              <div className="flex items-center gap-3 mb-5">
                 <div className="w-11 h-11 rounded-2xl bg-bp-accent text-white flex items-center justify-center text-[15px] font-bold border-2 border-white/10 shadow-lg shadow-bp-accent/20">
                    {initials}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-bold text-white truncate leading-none mb-1.5">{displayName}</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">Verified Patient</p>
                 </div>
              </div>
              <button
                onClick={handleSignOut}
                className="group w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white/50 text-[13px] font-bold hover:bg-white hover:text-bp-primary hover:border-white transition-all active:scale-95 shadow-sm"
              >
                <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
                Sign Out
              </button>
           </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className={cn(
        "lg:hidden fixed top-0 inset-x-0 h-[72px] z-50 transition-all duration-300 border-b",
        scrolled ? "bg-white/80 backdrop-blur-xl border-bp-border shadow-sm" : "bg-white border-transparent"
      )}>
        <div className="px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
             <div className="w-8 h-8 bg-bp-primary rounded-lg flex items-center justify-center text-white">
                <Activity size={18} strokeWidth={3} />
             </div>
             <span className="text-[18px] font-bold text-bp-primary tracking-tighter">BookPhysio</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-xl bg-bp-surface flex items-center justify-center text-bp-primary active:scale-90 transition-all border border-bp-border"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Nav Overlay ── */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[100] pt-[72px] animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-bp-primary/95 backdrop-blur-xl" onClick={() => setSidebarOpen(false)}></div>
           <nav className="relative p-8 space-y-4">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center justify-between p-5 rounded-2xl text-[18px] font-bold transition-all",
                      isActive ? "bg-white text-bp-primary shadow-2xl" : "text-white/60"
                    )}
                  >
                    <div className="flex items-center gap-4">
                       <Icon size={24} strokeWidth={3} />
                       {label}
                    </div>
                    {isActive && <ChevronRight size={20} strokeWidth={3} className="text-bp-accent" />}
                  </Link>
                )
              })}
              <div className="h-px bg-white/10 my-8"></div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-3 p-5 rounded-3xl bg-bp-accent text-white text-[18px] font-black shadow-xl shadow-bp-accent/20 active:scale-95 transition-transform"
              >
                <LogOut size={24} />
                Sign Out
              </button>
           </nav>
        </div>
      )}

      {/* ── Top Control Bar (Desktop Only) ── */}
      <div className="hidden lg:flex fixed top-0 right-0 left-[280px] h-[80px] bg-white/70 backdrop-blur-md border-b border-bp-surface z-40 items-center justify-between px-10">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-bp-accent rounded-full animate-pulse shadow-[0_0_8px_rgba(18,179,160,0.6)]"></div>
            <p className="text-[13px] font-black text-bp-primary uppercase tracking-widest">Safe & Secured Session</p>
         </div>
         <div className="flex items-center gap-4">
            <button
              type="button"
              title="Open notifications"
              aria-label="Open notifications"
              className="w-11 h-11 rounded-2xl bg-bp-surface border border-bp-border flex items-center justify-center text-bp-body/40 hover:text-bp-primary transition-colors relative"
            >
               <Bell size={20} />
               <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 border-2 border-white rounded-full"></div>
            </button>
            <div className="h-8 w-px bg-bp-border"></div>
            <button className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-bp-surface transition-colors">
               <div className="w-9 h-9 rounded-full bg-bp-accent/10 border border-bp-accent/20 flex items-center justify-center text-bp-accent font-black text-[13px]">
                  {initials}
               </div>
               <span className="text-[14px] font-black text-bp-primary">{displayName}</span>
            </button>
         </div>
      </div>

      {/* ── Main Content Area ── */}
      <main className={cn(
        "flex-1 transition-all duration-500 bg-bp-surface",
        "lg:ml-[280px] lg:pt-[80px] pt-[72px]"
      )}>
        <div className="min-h-full">
           {children}
        </div>
      </main>

      {/* Sticky Bottom Nav for Mobile — fixed convenience */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-[84px] bg-bp-primary/95 backdrop-blur-xl border-t border-white/5 z-50 flex items-center justify-around px-8 pb-4 pt-3">
         {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
               <Link 
                  key={href} 
                  href={href} 
                  className={cn(
                     "flex flex-col items-center gap-1.5 transition-all",
                     isActive ? "text-white" : "text-white/40"
                  )}
               >
                  <div className={cn(
                     "w-12 h-9 rounded-2xl flex items-center justify-center transition-all",
                     isActive ? "bg-white/15 shadow-inner" : "bg-transparent"
                  )}>
                     <Icon size={22} strokeWidth={isActive ? 3 : 2} className={cn(isActive && "text-bp-accent")} />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
               </Link>
            )
         })}
      </nav>

      <Footer />
    </div>
  )
}
