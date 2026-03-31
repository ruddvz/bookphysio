'use client'

import Link from 'next/link'
import { CheckCircle2, Calendar, MapPin, Clock, CreditCard, Download, ExternalLink, ArrowRight, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  try {
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
  } catch (e) {
    return ''
  }
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
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  const methodLabel: Record<string, string> = {
    upi: 'UPI', card: 'Credit/Debit Card', netbanking: 'Net Banking', pay_at_clinic: 'Pay at Clinic',
  }

  function handleAddToCalendar() {
    const ics = buildIcs({
      title: `Physiotherapy with ${doctorName}`,
      date,
      time,
      location,
      description: `BookPhysio appointment. Ref: ${refNumber}. Visit Type: ${visitType}.`,
    })
    if (ics) downloadIcs(`appointment-${refNumber}.ics`, ics)
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700 max-w-[500px] mx-auto text-center">
      {/* Success Animation Header */}
      <div className="relative mb-10 pt-4">
        <div className="absolute inset-0 bg-teal-50 rounded-full scale-150 opacity-20 blur-3xl animate-pulse" />
        <div className="relative flex flex-col items-center">
          <div className="w-24 h-24 bg-[#00766C] rounded-full flex items-center justify-center shadow-2xl shadow-teal-100 ring-8 ring-teal-50">
             <CheckCircle2 size={48} className="text-white" strokeWidth={3} />
          </div>
          <h2 className="text-[32px] font-black text-[#333333] tracking-tight mt-8">Booking Confirmed!</h2>
          <p className="text-gray-500 font-bold mt-2">Your session with {doctorName} is scheduled.</p>
        </div>
      </div>

      {/* Digital Receipt / Ticket */}
      <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden mb-8">
         <div className="p-8 space-y-6 text-left">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">Booking Reference</p>
                 <p className="text-[18px] font-black text-[#333333] tracking-tight">{refNumber}</p>
               </div>
               <div className="px-3 py-1 bg-teal-50 text-[#00766C] text-[12px] font-black rounded-full uppercase tracking-widest">
                  Confirmed
               </div>
            </div>

            <div className="h-px w-full border-t border-dashed border-gray-200" />

            <div className="space-y-4">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><Calendar size={20} /></div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Date</p>
                    <p className="text-[15px] font-black text-[#333333]">{displayDate}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><Clock size={20} /></div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Time Slot</p>
                    <p className="text-[15px] font-black text-[#333333]">{time}</p>
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-xl text-gray-400"><MapPin size={20} /></div>
                  <div>
                    <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Location</p>
                    <p className="text-[15px] font-black text-[#333333]">{location}</p>
                  </div>
               </div>
            </div>

            <div className="h-px w-full border-t border-dashed border-gray-200" />

            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-400"><CreditCard size={16} /></div>
                  <p className="text-[14px] font-bold text-gray-500">{methodLabel[paymentMethod] ?? paymentMethod}</p>
               </div>
               <p className="text-[20px] font-black text-[#333333]">₹{totalPaid}</p>
            </div>
         </div>

         {/* Ticket Cutouts */}
         <div className="absolute left-0 top-[42%] -translate-x-1/2 w-8 h-8 bg-[#F9FBFC] rounded-full border border-gray-100 shadow-inner" />
         <div className="absolute right-0 top-[42%] translate-x-1/2 w-8 h-8 bg-[#F9FBFC] rounded-full border border-gray-100 shadow-inner" />
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
         <button 
          onClick={handleAddToCalendar}
          className="flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-gray-100 text-[#333333] font-black rounded-2xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
         >
           <Calendar size={18} className="text-[#00766C]" />
           Calendar
         </button>
         <button className="flex items-center justify-center gap-2 py-4 px-6 bg-white border-2 border-gray-100 text-[#333333] font-black rounded-2xl hover:bg-gray-50 active:scale-95 transition-all shadow-sm">
           <Download size={18} className="text-[#00766C]" />
           Receipt
         </button>
      </div>

      <div className="space-y-4">
        <Link
          href="/patient/appointments"
          className="w-full flex items-center justify-center gap-3 py-5 bg-[#00766C] text-white text-[18px] font-black rounded-2xl shadow-xl shadow-teal-100 hover:bg-[#005A52] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Manage Appointment
          <ArrowRight size={20} />
        </Link>
        
        <div className="flex items-center justify-center gap-6 pt-4">
           <button className="flex items-center gap-2 text-[14px] font-black text-gray-400 hover:text-[#00766C] transition-colors">
              <Share2 size={16} /> Share Details
           </button>
           <Link href="/search" className="flex items-center gap-2 text-[14px] font-black text-gray-400 hover:text-[#00766C] transition-colors">
              <ExternalLink size={16} /> Find Another
           </Link>
        </div>
      </div>
      
      <p className="mt-12 text-[12px] font-bold text-gray-300 uppercase tracking-widest text-center px-12 leading-relaxed">
        A confirmation SMS and email have been sent to your registered contact details.
      </p>
    </div>
  )
}
