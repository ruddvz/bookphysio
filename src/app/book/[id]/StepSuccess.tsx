'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { CheckCircle2, Calendar, MapPin, Clock, CreditCard, Download, ExternalLink, ArrowRight, Share2, Sparkles, Building2, Check, LayoutDashboard, Fingerprint } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  buildIndiaCalendarEventRange,
  escapeIcsText,
  formatIndiaDate,
  parseIndiaDate,
} from '@/lib/india-date'

interface StepSuccessProps {
  doctorName: string
  date: string
  time: string
  visitType: string
  location: string
  totalPaid: number
  gstAmount: number
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
    const { start, end } = buildIndiaCalendarEventRange({
      date: props.date,
      time: props.time,
      durationMinutes: 60,
    })

    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//BookPhysio//bookphysio.in//EN',
      'BEGIN:VEVENT',
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${escapeIcsText(props.title)}`,
      `LOCATION:${escapeIcsText(props.location)}`,
      `DESCRIPTION:${escapeIcsText(props.description)}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
  } catch {
    return ''
  }
}

function escapeReceiptHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
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
  doctorName, date, time, visitType, location, totalPaid, gstAmount, paymentMethod, refNumber,
}: StepSuccessProps) {
  useEffect(() => {
    const duration = 2.5 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#00766C', '#059669', '#FEED5A', '#FFC794']
      })
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#00766C', '#059669', '#FEED5A', '#FFC794']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }, [])

  const baseFee = totalPaid - gstAmount
  const isPayAtClinic = paymentMethod === 'pay_at_clinic'
  const displayDate = formatIndiaDate(parseIndiaDate(date), {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
  const locationLabel = visitType === 'home_visit' ? 'Visit Address' : 'Clinic Site'
  const calendarLocation = visitType === 'home_visit' ? `Home visit address: ${location}` : location
  const statusLabel = 'Confirmed'
  const receiptTitle = isPayAtClinic ? 'Booking Confirmation' : 'Digital Receipt'
  const amountLabel = isPayAtClinic ? 'Amount Due' : 'Total Paid'
  const heroTitle = 'Confirmed.'
  const heroCopy = isPayAtClinic
    ? `Your session with ${doctorName} is confirmed. Payment will be collected during the visit.`
    : `Your medical consultation with ${doctorName} has been confirmed.`

  const methodLabel: Record<string, string> = {
    upi: 'UPI', card: 'Card', netbanking: 'Net Banking', pay_at_clinic: 'Pay at Clinic',
  }

  function handleDownloadReceipt() {
    const receiptValues = {
      receiptTitle: escapeReceiptHtml(receiptTitle),
      refNumber: escapeReceiptHtml(refNumber),
      statusLabel: escapeReceiptHtml(statusLabel),
      doctorName: escapeReceiptHtml(doctorName),
      displayDate: escapeReceiptHtml(displayDate),
      time: escapeReceiptHtml(time),
      visitType: escapeReceiptHtml(visitType.replace('_', ' ').toUpperCase()),
      locationLabel: escapeReceiptHtml(locationLabel),
      location: escapeReceiptHtml(location),
      paymentMethod: escapeReceiptHtml(methodLabel[paymentMethod] ?? paymentMethod),
      amountLabel: escapeReceiptHtml(amountLabel.toUpperCase()),
    }
    const receiptHtml = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>BookPhysio Receipt - ${receiptValues.refNumber}</title>
<style>
  body { font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 24px; color: #333; }
  .header { text-align: center; border-bottom: 2px solid #00766C; padding-bottom: 20px; margin-bottom: 24px; }
  .header h1 { color: #00766C; font-size: 24px; margin: 0 0 4px; }
  .header p { color: #666; font-size: 13px; margin: 0; }
  .ref { font-size: 18px; font-weight: 700; letter-spacing: 1px; margin: 12px 0; }
  .status { display: inline-block; background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
  .details { margin: 24px 0; }
  .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
  .row:last-child { border-bottom: none; }
  .label { color: #999; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; }
  .value { font-weight: 700; font-size: 14px; }
  .total-row { background: #333; color: #fff; padding: 16px; border-radius: 12px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center; }
  .total-row .label { color: #999; }
  .total-row .value { font-size: 24px; }
  .footer { text-align: center; margin-top: 32px; color: #999; font-size: 11px; }
</style></head><body>
  <div class="header">
    <h1>BookPhysio.in</h1>
    <p>${receiptValues.receiptTitle}</p>
    <div class="ref">${receiptValues.refNumber}</div>
    <span class="status">${receiptValues.statusLabel}</span>
  </div>
  <div class="details">
    <div class="row"><span class="label">Doctor</span><span class="value">${receiptValues.doctorName}</span></div>
    <div class="row"><span class="label">Date</span><span class="value">${receiptValues.displayDate}</span></div>
    <div class="row"><span class="label">Time</span><span class="value">${receiptValues.time}</span></div>
    <div class="row"><span class="label">Visit Type</span><span class="value">${receiptValues.visitType}</span></div>
    <div class="row"><span class="label">${receiptValues.locationLabel}</span><span class="value">${receiptValues.location}</span></div>
    <div class="row"><span class="label">Payment</span><span class="value">${receiptValues.paymentMethod}</span></div>
  </div>
  <div class="details">
    <div class="row"><span class="label">Consultation Fee</span><span class="value">₹${baseFee.toLocaleString('en-IN')}</span></div>
    <div class="row"><span class="label">GST (18%)</span><span class="value">₹${gstAmount.toLocaleString('en-IN')}</span></div>
    <div class="total-row"><span class="label">${receiptValues.amountLabel}</span><span class="value">₹${totalPaid.toLocaleString('en-IN')}</span></div>
  </div>
  <div class="footer"><p>Thank you for choosing BookPhysio.in</p><p>For support: help@bookphysio.in</p></div>
</body></html>`
    const blob = new Blob([receiptHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${refNumber}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleAddToCalendar() {
    const ics = buildIcs({
      title: `Physiotherapy with ${doctorName}`,
      date,
      time,
      location: calendarLocation,
      description: `BookPhysio appointment. Ref: ${refNumber}. Visit Type: ${visitType}.`,
    })
    if (ics) downloadIcs(`appointment-${refNumber}.ics`, ics)
  }

  return (
    <div className="animate-in fade-in zoom-in-95 duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] max-w-[560px] mx-auto text-center px-6">
      
      {/* ── Celebration Iconography ── */}
      <div className="relative mb-14 pt-8">
        <div className="absolute inset-0 bg-bp-accent rounded-full scale-150 opacity-10 blur-3xl animate-pulse" />
        <div className="relative flex flex-col items-center">
          <div className="w-32 h-32 bg-bp-accent rounded-[48px] flex items-center justify-center shadow-[0_32px_64px_-16px_rgba(0,118,108,0.4)] ring-[16px] ring-bp-accent/10 transform rotate-[6deg] animate-in zoom-in duration-1000 ease-out">
             <Check size={64} className="text-white" strokeWidth={4} />
          </div>
          
          <div className="mt-12 space-y-3">
             <h2 className="text-[48px] md:text-[64px] font-black text-bp-primary tracking-tighter leading-none">{heroTitle}</h2>
             <p className="text-[18px] text-bp-body/40 font-bold max-w-sm mx-auto">{heroCopy}</p>
          </div>
        </div>
      </div>

      {/* ── High-Fidelity Clinical Receipt ── */}
      <div className="relative bg-white rounded-[48px] border border-bp-border shadow-[0_48px_80px_-32px_rgba(0,0,0,0.1)] overflow-hidden mb-12 transform hover:scale-[1.01] transition-transform duration-500 group">
         
         {/* Receipt Top Section */}
         <div className="bg-bp-surface p-10 space-y-10 text-left relative z-10">
            <div className="flex justify-between items-start">
               <div>
                 <p className="text-[10px] font-black text-bp-body/30 uppercase tracking-[0.25em] mb-2">Verification Ref</p>
                 <div className="flex items-center gap-2">
                    <p className="text-[22px] font-black text-bp-primary tracking-tighter uppercase">{refNumber}</p>
                    <Fingerprint size={16} className="text-bp-accent/30" />
                 </div>
               </div>
              <div className="px-5 py-2 bg-emerald-50 text-[#059669] text-[12px] font-black rounded-2xl uppercase tracking-[0.1em] border border-emerald-100/50 shadow-sm shadow-emerald-900/5 pulse">
                {statusLabel}
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-[20px] flex items-center justify-center text-bp-body/30 border border-bp-border shadow-sm"><Calendar size={20} /></div>
                  <div>
                    <p className="text-[9px] font-black text-bp-body/30 uppercase tracking-widest leading-none mb-1.5">Consult Date</p>
                    <p className="text-[15px] font-black text-bp-primary tracking-tight">{displayDate.split(',')[1]}</p>
                  </div>
               </div>
               
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-[20px] flex items-center justify-center text-bp-body/30 border border-bp-border shadow-sm"><Clock size={20} /></div>
                  <div>
                    <p className="text-[9px] font-black text-bp-body/30 uppercase tracking-widest leading-none mb-1.5">Timeline</p>
                    <p className="text-[15px] font-black text-bp-primary tracking-tight">{time}</p>
                  </div>
               </div>

               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-[20px] flex items-center justify-center text-bp-body/30 border border-bp-border shadow-sm"><MapPin size={20} /></div>
                  <div>
                    <p className="text-[9px] font-black text-bp-body/30 uppercase tracking-widest leading-none mb-1.5">{locationLabel}</p>
                    <p className="text-[15px] font-black text-bp-primary tracking-tight truncate max-w-[150px]">{location.split(',')[0]}</p>
                  </div>
               </div>

               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 bg-white rounded-[20px] flex items-center justify-center text-bp-body/30 border border-bp-border shadow-sm"><Building2 size={20} /></div>
                  <div>
                    <p className="text-[9px] font-black text-bp-body/30 uppercase tracking-widest leading-none mb-1.5">Consult Type</p>
                    <p className="text-[15px] font-black text-bp-primary tracking-tight uppercase">{visitType.replace('_', ' ')}</p>
                  </div>
               </div>
            </div>

            <div className="pt-8 border-t border-dashed border-bp-border space-y-4">
               <div className="flex justify-between items-center px-2">
                  <span className="text-[13px] font-black text-bp-body/30 uppercase tracking-widest">Consultation</span>
                  <span className="text-[15px] font-black text-bp-primary">₹{baseFee.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center px-2">
                  <span className="text-[13px] font-black text-bp-body/30 uppercase tracking-widest">GST (18%)</span>
                  <span className="text-[15px] font-black text-bp-primary">₹{gstAmount.toLocaleString('en-IN')}</span>
               </div>
               <div className="flex justify-between items-center bg-bp-surface/50 p-6 rounded-[32px] border border-bp-border mt-4">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-bp-body/40 border border-bp-border shadow-sm"><CreditCard size={20} /></div>
                     <p className="text-[14px] font-black text-bp-body/40 tracking-widest uppercase">{methodLabel[paymentMethod] ?? paymentMethod}</p>
                  </div>
                  <div className="text-right">
                  <p className="text-[10px] font-black text-bp-body/30 uppercase tracking-widest mb-1 pr-1">{amountLabel}</p>
                     <p className="text-[28px] font-black text-bp-primary tracking-tighter">₹{totalPaid.toLocaleString('en-IN')}</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Ticket Cutouts & Perforation */}
         <div className="absolute left-0 top-[38%] -translate-x-1/2 w-10 h-10 bg-[#FBFCFD] rounded-full border border-bp-border/50 shadow-inner z-20" />
         <div className="absolute right-0 top-[38%] translate-x-1/2 w-10 h-10 bg-[#FBFCFD] rounded-full border border-bp-border/50 shadow-inner z-20" />
         <div className="absolute left-10 right-10 top-[38%] translate-y-4 border-t-2 border-dashed border-bp-border/50 z-0 opacity-50" />
         
         {/* Decorative Shine */}
         <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-2000 pointer-events-none"></div>
      </div>

      {/* ── Primary Engagement Grid ── */}
      <div className="grid grid-cols-2 gap-6 mb-10 text-[14px]">
         <button 
          onClick={handleAddToCalendar}
          className="h-20 flex flex-col items-center justify-center gap-1 bg-white border-2 border-bp-border text-bp-primary font-black rounded-3xl hover:bg-[#FBFCFD] hover:border-bp-accent/20 active:scale-95 transition-all shadow-sm group/btn"
         >
           <span className="text-[10px] text-bp-body/30 uppercase tracking-widest leading-none mb-1">Stay Notified</span>
           <div className="flex items-center gap-2">
              <Calendar size={18} className="text-bp-accent" />
              Sync Calendar
           </div>
         </button>
         
         <button
          type="button"
          onClick={handleDownloadReceipt}
          className="h-20 flex flex-col items-center justify-center gap-1 bg-white border-2 border-bp-border text-bp-primary font-black rounded-3xl hover:bg-[#FBFCFD] hover:border-bp-accent/20 active:scale-95 transition-all shadow-sm group/btn"
         >
            <span className="text-[10px] text-bp-body/30 uppercase tracking-widest leading-none mb-1">Proof Of Booking</span>
            <div className="flex items-center gap-2">
               <Download size={18} className="text-bp-accent" />
            {isPayAtClinic ? 'Booking Summary' : 'Digital Receipt'}
            </div>
         </button>
      </div>

      {/* ── Governance & Next Steps ── */}
      <div className="bg-[#111111] rounded-[48px] p-12 text-left relative overflow-hidden mb-12 group/protocol">
         <div className="absolute top-0 right-0 p-12 opacity-10 text-white group-hover/protocol:scale-110 transition-transform duration-1000">
            <Sparkles size={160} />
         </div>
         
         <div className="relative z-10 space-y-10">
            <div>
               <p className="text-[10px] font-black text-bp-accent/70 uppercase tracking-[0.3em] mb-4">Protocol Active</p>
               <h3 className="text-[32px] font-black text-white tracking-tighter">What happens now?</h3>
            </div>

            <div className="space-y-6">
               <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-bp-accent flex items-center justify-center text-white shrink-0 font-black text-[14px]">01</div>
                  <div>
                  <h4 className="text-[16px] font-black text-white mb-1">Booking Recorded</h4>
                  <p className="text-[14px] font-bold text-bp-body/40 leading-relaxed">Your appointment details are now saved and available from the patient dashboard below.</p>
                  </div>
               </div>
               
               <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-white shrink-0 font-black text-[14px]">02</div>
                  <div>
                <h4 className="text-[16px] font-black text-white mb-1">{isPayAtClinic ? 'Payment on Arrival' : 'Prepare for Arrival'}</h4>
                <p className="text-[14px] font-bold text-bp-body/40 leading-relaxed">{isPayAtClinic ? 'Please settle the consultation amount directly with the provider during the visit and keep any previous reports, scans, or prescriptions handy.' : 'Please arrive a few minutes early and keep any previous reports, scans, or prescriptions handy for the clinician.'}</p>
                  </div>
               </div>

               <div className="flex gap-6">
                  <div className="w-10 h-10 rounded-2xl bg-[#1A1A1A] border border-white/10 flex items-center justify-center text-white shrink-0 font-black text-[14px]">03</div>
                  <div>
                    <h4 className="text-[16px] font-black text-white mb-1">Session Dashboard</h4>
                  <p className="text-[14px] font-bold text-bp-body/40 leading-relaxed">Use your patient portal anytime to review appointment details, reschedule within policy, or download your receipt.</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="space-y-6">
        <Link
          href="/patient/appointments"
          className="group relative h-24 w-full flex items-center justify-center bg-bp-accent text-white rounded-[32px] shadow-2xl shadow-bp-primary/10 hover:shadow-bp-primary/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-500 overflow-hidden"
        >
          <div className="relative z-10 flex items-center justify-center gap-4 text-[22px] font-black tracking-tighter">
             Manage Appointment
             <LayoutDashboard size={24} strokeWidth={3} className="group-hover:rotate-12 transition-transform" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine transition-transform duration-1000"></div>
        </Link>
        
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-4">
           <button className="flex items-center gap-3 text-[13px] font-black text-bp-body/40 hover:text-bp-primary transition-colors group/share">
              <Share2 size={18} className="text-bp-accent group-hover:scale-110 transition-transform" /> 
              Share with Family
           </button>
           <Link href="/search" className="flex items-center gap-3 text-[13px] font-black text-bp-body/40 hover:text-bp-primary transition-colors group/find">
              <ExternalLink size={18} className="text-bp-accent group-hover:rotate-12 transition-transform" /> 
              Find Extra Sessions
           </Link>
        </div>
      </div>
      
      <div className="mt-16 flex flex-col items-center gap-4">
         <div className="w-12 h-1.5 bg-bp-surface rounded-full" />
         <p className="text-[11px] font-black text-bp-body/30 uppercase tracking-[0.3em] px-12 leading-loose text-center max-w-[400px]">
           Appointment details are now available in your patient dashboard.
           <span className="text-emerald-500 ml-2">Booking {statusLabel.toLowerCase()}.</span>
         </p>
      </div>
    </div>
  )
}
