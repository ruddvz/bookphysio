'use client'

import { ChevronRight, Zap } from 'lucide-react'

interface MobileBookingBarProps {
  fee: number
  feeLabel: string
  doctorName: string
}

export default function MobileBookingBar({ fee, feeLabel, doctorName }: MobileBookingBarProps) {
  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-[420px] z-[60] animate-in slide-in-from-bottom-12 duration-1000 ease-out pointer-events-none">
      <div className="bg-[#111111]/95 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2.5 flex items-center justify-between shadow-[0_32px_96px_-16px_rgba(0,0,0,0.6)] pointer-events-auto relative overflow-hidden group">
        
        {/* ── Background Detail ── */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-bp-primary/20 rounded-full blur-[40px] -z-0"></div>
        
        <div className="pl-5 relative z-10">
          <div className="flex items-baseline gap-1.5 leading-none">
             <span className="text-[24px] font-bold text-white tracking-tighter">₹{fee.toLocaleString('en-IN')}</span>
             <span className="text-[10px] text-white/30 font-bold uppercase tracking-widest leading-none mb-1">{feeLabel}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 leading-none">
             <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             <p className="text-[11px] text-white/50 font-bold uppercase tracking-widest truncate max-w-[120px]">{doctorName.replace('Dr. ', '')}</p>
          </div>
        </div>
        
        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('booking-card-section')
            if (el) {
               el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            } else {
               window.scrollTo({ top: 400, behavior: 'smooth' })
            }
          }}
          className="relative h-[60px] bg-bp-accent text-white px-8 rounded-[24px] transition-all duration-500 flex items-center justify-center gap-2 overflow-hidden active:scale-95 shadow-xl shadow-bp-accent/20 font-bold text-[15px] tracking-tight group/btn"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:animate-shimmer" />
          
          <span className="relative z-10 flex items-center gap-1.5">
             Book Now
             <ChevronRight size={18} strokeWidth={3} className="group-hover/btn:translate-x-1.5 transition-transform duration-500" />
          </span>
        </button>
      </div>
      
      <div className="mt-4 flex items-center justify-center gap-2 text-[9px] font-bold text-bp-body/30 uppercase tracking-[0.3em] pointer-events-auto bg-white/40 backdrop-blur-sm self-center px-4 py-1.5 rounded-full border border-black/[0.03] mx-auto w-fit">
         <Zap size={10} className="text-bp-accent" />
         Official Medical Channel
      </div>
    </div>
  )
}
