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
  const { user, loading } = useAuth()
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
    const { createClient } = await import('@/lib/supabase/client')
    await createClient().auth.signOut()
    router.push('/')
  }

  return (
    <div className="bg-[#FCFDFD] min-h-screen flex flex-col font-sans selection:bg-[#00766C]/10 selection:text-[#00766C]">
      
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[280px] bg-white border-r border-gray-100 flex-col z-[60] shadow-[1px_0_10px_rgba(0,0,0,0.02)]">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 no-underline group">
             <div className="w-10 h-10 bg-[#00766C] rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-900/10 group-hover:scale-105 transition-transform">
                <Activity size={22} strokeWidth={3} />
             </div>
            <span className="text-[22px] font-black text-[#333333] tracking-tighter">
              BookPhysio
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          <div className="px-4 mb-4">
             <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Main Menu</p>
          </div>
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center justify-between px-4 py-3.5 rounded-2xl text-[15px] font-bold transition-all duration-300 group",
                  isActive
                    ? "bg-[#00766C] text-white shadow-xl shadow-teal-900/10"
                    : "text-gray-500 hover:text-[#333333] hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                  <span>{label}</span>
                </div>
                {isActive && <ChevronRight size={16} strokeWidth={3} className="text-white/50" />}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto">
           <div className="bg-gray-50 rounded-3xl p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-full bg-[#00766C] text-white flex items-center justify-center text-[13px] font-black border-2 border-white shadow-sm">
                    {initials}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-black text-[#333333] truncate leading-none mb-1">{displayName}</p>
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest truncate">Patient Account</p>
                 </div>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-gray-100 text-gray-600 text-[13px] font-bold hover:bg-gray-100 hover:text-red-600 transition-all active:scale-95 shadow-sm"
              >
                <LogOut size={16} />
                Sign Out
              </button>
           </div>
        </div>
      </aside>

      {/* ── Mobile Top Bar ── */}
      <header className={cn(
        "lg:hidden fixed top-0 inset-x-0 h-[72px] z-50 transition-all duration-300 border-b",
        scrolled ? "bg-white/80 backdrop-blur-xl border-gray-100 shadow-sm" : "bg-white border-transparent"
      )}>
        <div className="px-6 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
             <div className="w-8 h-8 bg-[#00766C] rounded-lg flex items-center justify-center text-white">
                <Activity size={18} strokeWidth={3} />
             </div>
             <span className="text-[18px] font-black text-[#333333] tracking-tighter">BookPhysio</span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#333333] active:scale-90 transition-all border border-gray-100"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* ── Mobile Nav Overlay ── */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 pt-[72px] animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-white/95 backdrop-blur-md"></div>
           <nav className="relative p-8 space-y-4">
              {navItems.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-2xl text-[18px] font-black transition-all",
                      isActive ? "bg-[#00766C] text-white shadow-xl shadow-teal-900/10" : "text-gray-500"
                    )}
                  >
                    <Icon size={24} strokeWidth={3} />
                    {label}
                  </Link>
                )
              })}
              <div className="h-px bg-gray-100 my-8"></div>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-3 p-5 rounded-2xl bg-gray-50 text-red-600 text-[18px] font-black border border-red-50"
              >
                <LogOut size={24} />
                Sign Out
              </button>
           </nav>
        </div>
      )}

      {/* ── Top Control Bar (Desktop Only) ── */}
      <div className="hidden lg:flex fixed top-0 right-0 left-[280px] h-[80px] bg-white/70 backdrop-blur-md border-b border-gray-100 z-40 items-center justify-between px-10">
         <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <p className="text-[13px] font-black text-[#333333] uppercase tracking-widest">Safe & Secured Session</p>
         </div>
         <div className="flex items-center gap-4">
            <button className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#00766C] transition-colors relative">
               <Bell size={20} />
               <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></div>
            </button>
            <div className="h-8 w-px bg-gray-100"></div>
            <button className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-gray-50 transition-colors">
               <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-[#00766C] font-black text-[13px]">
                  {initials}
               </div>
               <span className="text-[14px] font-black text-[#333333]">{displayName}</span>
            </button>
         </div>
      </div>

      {/* ── Main Content Area ── */}
      <main className={cn(
        "flex-1 transition-all duration-500",
        "lg:ml-[280px] lg:pt-[80px] pt-[72px]"
      )}>
        <div className="min-h-full">
           {children}
        </div>
      </main>

      {/* Sticky Bottom Nav for Mobile — fixed convenience */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 h-[80px] bg-white/80 backdrop-blur-xl border-t border-gray-100 z-50 flex items-center justify-around px-6 pb-2">
         {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
               <Link 
                  key={href} 
                  href={href} 
                  className={cn(
                     "flex flex-col items-center gap-1 transition-all",
                     isActive ? "text-[#00766C]" : "text-gray-400"
                  )}
               >
                  <div className={cn(
                     "w-12 h-8 rounded-full flex items-center justify-center transition-all",
                     isActive ? "bg-teal-50" : "bg-transparent"
                  )}>
                     <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
               </Link>
            )
         })}
      </nav>

      {/* Only show small footer in dashboard */}
      <footer className="lg:ml-[280px] py-10 px-10 border-t border-gray-50 bg-[#FCFDFD]">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-30">
            <span className="text-[12px] font-bold tracking-widest uppercase">© 2026 BookPhysio Technology</span>
            <div className="flex gap-8">
               <span className="text-[12px] font-bold tracking-widest uppercase">Privacy</span>
               <span className="text-[12px] font-bold tracking-widest uppercase">Terms</span>
               <span className="text-[12px] font-bold tracking-widest uppercase">Support</span>
            </div>
         </div>
      </footer>
    </div>
  )
}
