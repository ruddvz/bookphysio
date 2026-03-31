'use client'

import { useRouter } from 'next/navigation'
import { Calendar, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBookingBarProps {
  doctorId: string
  fee: number
  doctorName: string
}

export default function MobileBookingBar({ doctorId, fee, doctorName }: MobileBookingBarProps) {
  const router = useRouter()

  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[60] animate-in slide-in-from-bottom-12 duration-1000 ease-out">
      <div className="bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/10 rounded-[32px] p-4 flex items-center justify-between shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
        <div className="pl-3">
          <div className="flex items-center gap-1.5 mb-0.5">
             <span className="text-[22px] font-black text-white tracking-tighter">₹{fee}</span>
             <span className="text-[10px] text-white/40 font-black uppercase tracking-widest pt-1">/ Session</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <p className="text-[11px] text-white/50 font-black uppercase tracking-widest truncate max-w-[120px]">{doctorName.replace('Dr. ', '')}</p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => {
            // Scroll to BookingCard section
            const el = document.getElementById('booking-card-section')
            if (el) {
               el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            } else {
               // Fallback if section ID isn't found
               window.scrollTo({ top: 500, behavior: 'smooth' })
            }
          }}
          className="group relative h-14 bg-[#00766C] hover:bg-[#005A52] text-white px-7 rounded-[22px] transition-all flex items-center justify-center gap-2.5 overflow-hidden active:scale-95 shadow-xl shadow-teal-900/40"
        >
          <div className="relative z-10 flex items-center gap-2 font-black text-[15px] tracking-tight">
             Select Slot
             <ChevronRight size={18} strokeWidth={3} className="group-hover:translate-x-1 transition-transform" />
          </div>
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine transition-transform duration-1000"></div>
        </button>
      </div>
      
      {/* Strategic Mobile Hint */}
      <div className="mt-4 text-center">
         <p className="text-[10px] font-black text-gray-400/50 uppercase tracking-[0.25em] flex items-center justify-center gap-2">
            <Zap size={10} className="text-teal-500" />
            Instant Confirmation Available
         </p>
      </div>
    </div>
  )
}
