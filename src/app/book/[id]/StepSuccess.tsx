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

function buildIcs(props: {
  title: string
  date: string
  time: string
  location: string
  description: string
}): string {
  const [year, month, day] = props.date.split('-').map(Number)
  const [hourStr, minuteStr] = props.time.replace(/[ap]m/i, '').trim().split(':')
  const isPm = /pm/i.test(props.time)
  let hour = parseInt(hourStr, 10)
  const minute = parseInt(minuteStr ?? '0', 10)
  if (isPm && hour !== 12) hour += 12
  if (!isPm && hour === 12) hour = 0

  const pad = (n: number) => String(n).padStart(2, '0')
  const dtStart = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`
  const dtEnd = `${year}${pad(month)}${pad(day)}T${pad(hour + 1)}${pad(minute)}00`

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BookPhysio//bookphysio.in//EN',
    'BEGIN:VEVENT',
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${props.title}`,
    `LOCATION:${props.location}`,
    `DESCRIPTION:${props.description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

function downloadIcs(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
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

  function handleAddToCalendar() {
    const ics = buildIcs({
      title: `Physiotherapy with ${doctorName}`,
      date,
      time,
      location,
      description: `BookPhysio appointment. Ref: ${refNumber}. ${visitType === 'home_visit' ? 'Home visit.' : visitType === 'online' ? 'Online session.' : 'In-clinic visit.'}`,
    })
    downloadIcs('bookphysio-appointment.ics', ics)
  }

  return (
    <div className="text-center space-y-6">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E6F4F3]">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-label="Booking confirmed">
            <circle cx="20" cy="20" r="20" fill="#00766C" />
            <path d="M12 20.5L17.5 26L28 15" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
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
          onClick={handleAddToCalendar}
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
