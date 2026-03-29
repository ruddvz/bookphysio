'use client'

import Link from 'next/link'
import { VisitTypeBadge } from '@/components/VisitTypeBadge'

interface StepSuccessProps {
  doctorName: string
  date: string
  time: string
  visitType: string
  location: string
  totalPaid: number
  paymentMethod: string
  refNumber: string
}

export function StepSuccess({
  doctorName, date, time, visitType, location, totalPaid, paymentMethod, refNumber,
}: StepSuccessProps) {
  const displayDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })

  const methodLabel: Record<string, string> = {
    upi: 'UPI', card: 'Card', netbanking: 'Net Banking', pay_at_clinic: 'Pay at Clinic',
  }

  return (
    <div className="text-center space-y-6">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
          <span className="text-4xl">✅</span>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#1A1A1A]">Booking Confirmed!</h2>
        <p className="mt-1 text-sm text-[#666]">Ref: {refNumber}</p>
      </div>

      {/* Booking details card */}
      <div className="rounded-[8px] border border-[#E5E5E5] bg-white p-5 text-left space-y-3">
        <p className="font-semibold text-[#1A1A1A]">{doctorName}</p>
        <p className="text-sm text-[#666]">📅 {displayDate} · {time}</p>
        <div className="flex items-center gap-2">
          <VisitTypeBadge type={visitType} />
          <span className="text-sm text-[#666]">· {location}</span>
        </div>
        <p className="text-sm text-[#666]">
          ₹{totalPaid.toLocaleString('en-IN')} paid via {methodLabel[paymentMethod] ?? paymentMethod}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => {/* calendar integration placeholder */}}
          className="flex-1 rounded-[24px] border border-[#00766C] py-2.5 text-sm font-medium text-[#00766C] hover:bg-[#E6F4F3] transition-colors"
        >
          Add to Calendar
        </button>
        <Link
          href="/patient/appointments"
          className="flex-1 rounded-[24px] bg-[#00766C] py-2.5 text-sm font-medium text-white text-center hover:bg-[#005A52] transition-colors"
        >
          View Appointments
        </Link>
      </div>

      <Link href="/search" className="block text-sm text-[#00766C] hover:underline">
        Find another physiotherapist →
      </Link>
    </div>
  )
}
