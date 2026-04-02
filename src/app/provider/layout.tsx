'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode, useState, useEffect } from 'react'
import Footer from '@/components/Footer'
import { Home, Calendar, Inbox, BarChart3, Users, Settings, Activity, Bell, LogOut, Search, ChevronRight, Menu, X, Clock, Sparkles } from 'lucide-react'
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
   const { user, loading, signOut } = useAuth()
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
    <div className="bg-[#FCFDFD] min-h-screen flex flex-col font-sans selection:bg-[#00766C]/10 selection:text-[#00766C]">
      
      {/* ── Practitioner Sidebar (Desktop) ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-[240px] bg-[#333333] flex-col z-[60] shadow-[10px_0_40px_rgba(0,0,0,0.05)]">
        <div className="p-8">
           <Link href="/provider/dashboard" className="flex items-center gap-3 group no-underline">
              <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                 <Activity size={20} strokeWidth={3} />
              </div>
              <span className="text-[20px] font-black text-white tracking-tighter">Practitioner</span>
           </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
           <div className="px-4 mb-4">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Management</p>
           </div>
           {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + '/')
              return (
                 <Link
                    key={href}
                    href={href}
                    className={cn(
                       "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[14px] font-black transition-all duration-300 group",
                       isActive 
                          ? "bg-white text-[#333333] shadow-xl shadow-teal-900/10" 
                          : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                 >
                    <Icon size={18} strokeWidth={isActive ? 3 : 2} className={cn("transition-colors", isActive ? "text-[#00766C]" : "text-white/30")} />
                    <span>{label}</span>
                 </Link>
              )
           })}
        </nav>

        <div className="p-4 mt-auto">
           <div className="bg-white/5 rounded-3xl p-5 border border-white/5 group hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-9 h-9 rounded-full bg-teal-500 text-white flex items-center justify-center text-[12px] font-black border-2 border-white/10">
                    {initials}
                 </div>
                 <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black text-white truncate leading-none mb-1">{displayName}</p>
                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest truncate">Verified Provider</p>
                 </div>
              </div>
              <button
                 onClick={handleSignOut}
                 className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 text-[12px] font-black hover:bg-white/10 hover:text-white transition-all active:scale-95"
              >
                 <LogOut size={14} />
                 End Session
              </button>
           </div>
        </div>
      </aside>

      {/* ── Top Bar Control Center (Desktop Only) ── */}
      <div className="hidden lg:flex fixed top-0 right-0 left-[240px] h-[80px] bg-white/70 backdrop-blur-md border-b border-gray-100 z-40 items-center justify-between px-10">
         <div className="flex items-center gap-6">
            <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400 group-focus-within:text-[#00766C] transition-colors" />
               </div>
               <input 
                  type="text" 
                  placeholder="Universal patient search..."
                  className="bg-gray-50/50 border border-transparent focus:border-teal-100 focus:bg-white font-bold text-[14px] text-[#333333] placeholder:text-gray-400 pl-12 pr-6 py-2.5 rounded-2xl w-[320px] outline-none transition-all"
               />
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-600">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[11px] font-black uppercase tracking-widest leading-none">Practice In-Person</span>
            </div>
            <div className="h-8 w-px bg-gray-100 ml-2"></div>
                  <button
                     type="button"
                     title="Open notifications"
                     aria-label="Open notifications"
                     className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-[#00766C] transition-colors relative"
                  >
               <Bell size={20} />
               <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#FF6B35] border-2 border-white rounded-full animate-bounce"></div>
            </button>
            <Link href="/provider/profile" className="flex items-center gap-3 px-2 py-1 rounded-full hover:bg-gray-50 transition-colors">
               <div className="w-9 h-9 rounded-full bg-gray-800 text-white flex items-center justify-center text-[12px] font-black">
                  {initials}
               </div>
            </Link>
         </div>
      </div>

      {/* ── Mobile Navigation ── */}
      <header className={cn(
        "lg:hidden fixed top-0 inset-x-0 h-[72px] z-50 transition-all duration-300 border-b",
        scrolled ? "bg-white/80 backdrop-blur-xl border-gray-100 shadow-sm" : "bg-white border-transparent"
      )}>
        <div className="px-6 h-full flex items-center justify-between">
           <Link href="/provider/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
                 <Activity size={18} strokeWidth={3} />
              </div>
              <span className="text-[18px] font-black text-[#333333] tracking-tighter">Practitioner</span>
           </Link>
           <button 
             onClick={() => setSidebarOpen(!isSidebarOpen)}
             className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#333333] border border-gray-100"
           >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
           </button>
        </div>
      </header>

      {/* Mobile nav overlay */}
      {isSidebarOpen && (
         <div className="lg:hidden fixed inset-0 z-50 pt-[72px] animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-[#333333]/95 backdrop-blur-md"></div>
            <nav className="relative p-8 space-y-4">
               {navItems.map(({ href, label, icon: Icon }) => {
                  const isActive = pathname === href || pathname.startsWith(href + '/')
                  return (
                     <Link
                        key={href}
                        href={href}
                        onClick={() => setSidebarOpen(false)}
                        className={cn(
                           "flex items-center gap-5 p-5 rounded-3xl text-[20px] font-black transition-all",
                           isActive ? "bg-white text-[#333333] shadow-xl" : "text-white/60"
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
                  className="w-full flex items-center justify-center gap-4 p-5 rounded-3xl bg-white/5 text-red-400 text-[20px] font-black border border-white/5"
               >
                  <LogOut size={24} />
                  Log Out
               </button>
            </nav>
         </div>
      )}

      {/* ── Results/Main Area ── */}
      <main className={cn(
        "flex-1 transition-all duration-500",
        "lg:ml-[240px] lg:pt-[80px] pt-[72px]"
      )}>
         <div className="min-h-full">
            {children}
         </div>
      </main>

      {/* Mobile Persistent Floating Bottom Nav */}
      <nav className="lg:hidden fixed bottom-6 inset-x-6 h-[72px] bg-[#333333] rounded-[32px] shadow-2xl z-50 flex items-center justify-around px-6">
         {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/')
            return (
               <Link 
                  key={href} 
                  href={href} 
                  className={cn(
                     "flex flex-col items-center gap-1 transition-all",
                     isActive ? "text-teal-400" : "text-white/30"
                  )}
               >
                  <div className={cn(
                     "w-12 h-9 rounded-full flex items-center justify-center transition-all",
                     isActive ? "bg-white/5" : "bg-transparent"
                  )}>
                     <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">{label === 'Overview' ? 'Home' : label}</span>
               </Link>
            )
         })}
      </nav>

      <footer className="lg:ml-[240px] py-12 px-10 border-t border-gray-100 bg-[#FCFDFD]">
         <div className="flex flex-col md:flex-row items-center justify-between gap-6 opacity-30 group">
            <div className="flex items-center gap-3">
               <Activity size={16} />
               <span className="text-[11px] font-black tracking-[0.2em] uppercase">© 2026 Practical Intelligence Hub</span>
            </div>
            <div className="flex gap-10">
               {['Security', 'Guidelines', 'Compliance', 'Help'].map((item) => (
                  <span key={item} className="text-[11px] font-black tracking-[0.2em] uppercase hover:text-[#00766C] transition-colors cursor-pointer">{item}</span>
               ))}
            </div>
         </div>
      </footer>
    </div>
  )
}
