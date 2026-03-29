'use client'

import { useState } from 'react'
import { Avatar } from '@/components/Avatar'
import { PriceDisplay } from '@/components/PriceDisplay'
import { VisitTypeBadge } from '@/components/VisitTypeBadge'

interface Doctor {
  name: string
  specialty: string
  avatar?: string | null
  location: string
  fee: number
}

interface BookingDetails {
  date: string
  time: string
  visitType: string
}

interface PatientDetails {
  fullName: string
  phone: string
  email: string
  reason: string
}

interface StepConfirmProps {
  doctor: Doctor
  booking: BookingDetails
  onNext: (patient: PatientDetails) => void
}

export function StepConfirm({ doctor, booking, onNext }: StepConfirmProps) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!fullName.trim()) e.fullName = 'Full name is required'
    if (!phone.match(/^\+91[6-9]\d{9}$/)) e.phone = 'Enter a valid +91 mobile number'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onNext({ fullName, phone, email, reason })
  }

  const displayDate = new Date(booking.date).toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short',
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Appointment summary */}
      <div className="rounded-[8px] border border-[#E5E5E5] bg-white p-4">
        <div className="flex items-start gap-4">
          <Avatar name={doctor.name} src={doctor.avatar} size={56} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[#1A1A1A]">{doctor.name}</p>
            <p className="text-sm text-[#666]">{doctor.specialty}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-[#666]">
              <span>📅 {displayDate} · {booking.time}</span>
              <span>📍 {doctor.location}</span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <VisitTypeBadge type={booking.visitType} />
              <PriceDisplay amountInr={doctor.fee} suffix="/session" size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Patient details */}
      <div className="rounded-[8px] border border-[#E5E5E5] bg-white p-4 space-y-4">
        <h3 className="font-semibold text-[#1A1A1A]">Your details</h3>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Rahul Verma"
            className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C]"
          />
          {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-1">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="flex">
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-[#E5E5E5] bg-[#F5F5F5] px-3 text-sm text-[#666]">+91</span>
            <input
              type="tel"
              value={phone.replace('+91', '')}
              onChange={(e) => setPhone('+91' + e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="98765 43210"
              className="w-full rounded-r-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C]"
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-1">Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rahul@example.com"
            className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333] mb-1">Reason for visit (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Brief description of your condition..."
            rows={3}
            className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C] resize-none"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full rounded-[24px] bg-[#00766C] py-3 text-sm font-semibold text-white hover:bg-[#005A52] transition-colors"
      >
        Continue to Payment →
      </button>
    </form>
  )
}
