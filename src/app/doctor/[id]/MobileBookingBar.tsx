'use client'

import { useRouter } from 'next/navigation'

interface MobileBookingBarProps {
  doctorId: string
  fee: number
  doctorName: string
}

export default function MobileBookingBar({ doctorId, fee, doctorName }: MobileBookingBarProps) {
  const router = useRouter()

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E5E5E5] px-4 py-3 flex items-center justify-between shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      <div>
        <span className="text-[18px] font-bold text-[#333333]">₹{fee}</span>
        <span className="text-[13px] text-[#666666] ml-1">/ session</span>
        <p className="text-[11px] text-[#999999]">{doctorName}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          // Scroll to BookingCard on mobile
          const el = document.getElementById('booking-card-section')
          el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }}
        className="bg-[#00766C] hover:bg-[#005A52] text-white text-[14px] font-semibold px-5 py-2.5 rounded-full transition-colors"
      >
        Book Session
      </button>
    </div>
  )
}
