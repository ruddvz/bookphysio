'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { StepConfirm } from './StepConfirm'
import { StepPayment } from './StepPayment'
import { StepSuccess } from './StepSuccess'
import { Check, Calendar, Clock, MapPin, ShieldCheck, User, ArrowLeft, Phone, Mail, Award, Sparkles, Building2, ChevronRight, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

type Step = 1 | 2 | 3
type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'pay_at_clinic'

interface DoctorInfo {
  name: string
  specialty: string
  location: string
  fee: number
  avatar_url?: string
}

interface PatientDetails {
  fullName: string
  phone: string
  email: string
  reason: string
}

interface BookingResult {
  appointmentId: string
  refNumber: string
  totalPaid: number
  paymentMethod: PaymentMethod
}

const STEPS = [
  { n: 1, label: 'Identify' },
  { n: 2, label: 'Vouch' },
  { n: 3, label: 'Success' },
]

export default function BookingInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const doctorId = params.id as string

  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const time = searchParams.get('time') ?? ''
  const visitType = searchParams.get('type') ?? 'in_clinic'
  const slotId = searchParams.get('slot_id') ?? ''

  const [step, setStep] = useState<Step>(1)
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null)
  const [doctor, setDoctor] = useState<DoctorInfo | null>(null)

  useEffect(() => {
    fetch(`/api/providers/${doctorId}`)
      .then((r) => r.json())
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((data: any) => {
        const nameWithTitle = data.full_name?.startsWith('Dr.') ? data.full_name : `Dr. ${data.full_name ?? ''}`
        const loc = data.locations?.[0]
        setDoctor({
          name: nameWithTitle,
          specialty: data.specialties?.[0]?.name ?? 'Physiotherapist',
          location: loc ? `${loc.address ?? ''}, ${loc.city ?? ''}`.replace(/^, /, '') : 'India',
          fee: data.consultation_fee_inr ?? 0,
          avatar_url: data.avatar_url,
        })
      })
      .catch(() => {
        setDoctor({ name: 'Doctor', specialty: 'Physiotherapist', location: 'India', fee: 0 })
      })
  }, [doctorId])

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#FBFCFD] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
           <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-[#00766C] animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-[#00766C]/20"><Activity size={24} /></div>
           </div>
           <div className="text-center">
              <p className="text-[18px] font-black text-[#333333] tracking-tight">Securing Your Session</p>
              <p className="text-[14px] font-bold text-gray-400 mt-1">Establishing high-fidelity connection...</p>
           </div>
        </main>
        <Footer />
      </div>
    )
  }

  const displayDate = new Date(date).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="min-h-screen bg-[#FBFCFD] flex flex-col selection:bg-[#00766C]/10 selection:text-[#00766C]">
      <Navbar />
      
      {/* ── Progress Interface ── */}
      <div className="bg-white border-b border-gray-100 sticky top-[72px] z-40 hidden md:block">
         <div className="max-w-[1280px] mx-auto px-12 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {STEPS.map((s, i) => (
                  <div key={s.n} className="flex items-center">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-[12px] text-[13px] font-black transition-all duration-500 border-2",
                        step === s.n ? "bg-[#00766C] text-white border-[#00766C] shadow-xl shadow-teal-900/10 scale-110" :
                        step > s.n ? "bg-[#00766C] text-white border-[#00766C]" :
                        "bg-white text-gray-300 border-gray-100"
                      )}>
                        {step > s.n ? (
                          <Check size={16} strokeWidth={4} className="animate-in zoom-in duration-300" />
                        ) : s.n}
                      </div>
                      <span className={cn(
                        "text-[11px] font-black uppercase tracking-[0.2em] transition-colors",
                        step >= s.n ? "text-[#333333]" : "text-gray-300"
                      )}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn(
                        "mx-6 h-[2px] w-12 transition-all duration-700 rounded-full",
                        step > s.n ? "bg-[#00766C]" : "bg-gray-100"
                      )} />
                    )}
                  </div>
                ))}
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
               <ShieldCheck size={16} className="text-emerald-500" />
               <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none">256-bit Secure Session</span>
            </div>
         </div>
      </div>

      <main className="flex-1 py-12 px-6 md:py-20 lg:px-12">
        <div className="max-w-[1280px] mx-auto">
          
          {/* Breadcrumb Back Button */}
          {step > 1 && step < 3 && (
            <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
              <button 
                onClick={() => setStep(step === 2 ? 1 : 2)}
                className="group flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-2xl text-[14px] font-black text-gray-400 hover:text-[#00766C] hover:border-teal-100 shadow-sm transition-all active:scale-95"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
                Return to previous step
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start">
            
            {/* LEFT COLUMN: Active Step Content */}
            <div className="min-w-0">
              {step === 1 && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                  <StepConfirm
                    doctor={doctor}
                    booking={{ date, time, visitType }}
                    onNext={(p) => { setPatient(p); setStep(2) }}
                  />
                </div>
              )}
              {step === 2 && patient && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                  <StepPayment
                    doctorId={doctorId}
                    slotId={slotId}
                    visitType={visitType}
                    feeInr={doctor.fee}
                    patient={patient}
                    onBack={() => setStep(1)}
                    onSuccess={(result) => { setBookingResult(result); setStep(3) }}
                  />
                </div>
              )}
              {step === 3 && bookingResult && (
                <div className="animate-in zoom-in-95 fade-in duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)]">
                  <StepSuccess
                    doctorName={doctor.name}
                    date={date}
                    time={time}
                    visitType={visitType}
                    location={doctor.location}
                    totalPaid={bookingResult.totalPaid}
                    paymentMethod={bookingResult.paymentMethod}
                    refNumber={bookingResult.refNumber}
                  />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Booking Summary (Ultra Premium) */}
            {step < 3 && (
              <aside className="sticky top-[160px] animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                <div className="bg-white rounded-[48px] border border-gray-100 shadow-[0_48px_80px_-32px_rgba(0,0,0,0.1)] overflow-hidden relative group/sidebar">
                  
                  {/* Backdrop Glow */}
                  <div className="absolute -top-32 -right-32 w-64 h-64 bg-teal-50 rounded-full blur-[100px] -z-0 group-hover:scale-110 transition-transform duration-1000"></div>

                  <div className="bg-[#00766C] p-8 text-white relative z-10">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-[20px] font-black tracking-tight uppercase">Order Review</h3>
                       <LayoutDashboard size={20} className="opacity-30" />
                    </div>
                    <p className="text-[13px] text-teal-100/60 font-bold tracking-widest uppercase">Summary of your session</p>
                  </div>
                  
                  <div className="p-8 space-y-10 relative z-10">
                    {/* Doctor Info (High Fidelity) */}
                    <div className="flex gap-5 items-center bg-gray-50/50 p-6 rounded-[32px] border border-gray-100">
                       <div className="relative">
                         {doctor.avatar_url ? (
                           <img src={doctor.avatar_url} className="w-20 h-20 rounded-[28px] object-cover border-4 border-white shadow-xl shadow-teal-900/5 transition-transform group-hover/sidebar:scale-105" alt="" />
                         ) : (
                           <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-[#E6F4F3] to-[#C7E9E6] text-[#00766C] flex items-center justify-center font-black text-2xl border-4 border-white shadow-xl">
                             {doctor.name[0]}
                           </div>
                         )}
                         <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg border border-gray-50">
                            <div className="w-6 h-6 bg-[#059669] rounded-lg flex items-center justify-center text-white"><Check size={14} strokeWidth={4} /></div>
                         </div>
                       </div>
                       <div>
                         <p className="text-[17px] font-black text-[#333333] leading-none mb-2">{doctor.name}</p>
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-teal-100 rounded-lg w-fit">
                            <Award size={12} className="text-[#00766C]" strokeWidth={3} />
                            <p className="text-[10px] font-black text-[#00766C] uppercase tracking-widest">{doctor.specialty.split(' ')[0]} Expert</p>
                         </div>
                       </div>
                    </div>

                    {/* Schedule (Luxury Matrix) */}
                    <div className="grid grid-cols-1 gap-6 px-2">
                       <div className="flex items-center gap-5 group/item">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover/item:text-[#00766C] group-hover/item:bg-teal-50 transition-all duration-300">
                             <Calendar size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none mb-2">Schedule</p>
                            <p className="text-[16px] font-black text-[#333333] tracking-tight">{displayDate}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-5 group/item">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover/item:text-[#00766C] group-hover/item:bg-teal-50 transition-all duration-300">
                             <Clock size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none mb-2">Duration</p>
                            <div className="flex items-center gap-2">
                               <p className="text-[16px] font-black text-[#333333] tracking-tight">{time}</p>
                               <span className="text-[11px] font-black text-[#059669] bg-emerald-50 px-2.5 py-1 rounded-lg">45 MIN</span>
                            </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-5 group/item">
                          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 group-hover/item:text-blue-500 group-hover/item:bg-blue-50 transition-all duration-300">
                             <MapPin size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none mb-2">Consultation Mode</p>
                            <p className="text-[16px] font-black text-[#333333] leading-none">{visitType.replace('_', ' ').toUpperCase()}</p>
                          </div>
                       </div>
                    </div>

                    {/* Patient Context Summary */}
                    {step === 2 && patient && (
                      <div className="pt-10 border-t border-gray-100 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00766C]">
                             <User size={20} strokeWidth={3} />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] leading-none mb-2">Authenticated For</p>
                             <p className="text-[16px] font-black text-[#333333] tracking-tight">{patient.fullName}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price Matrix (High Contrast) */}
                    <div className="pt-10 mt-4 border-t border-gray-100">
                       <div className="flex justify-between items-center mb-4 px-2">
                          <span className="text-[14px] font-black text-gray-300 uppercase tracking-widest">Base Session</span>
                          <span className="text-[16px] font-black text-[#333333]">₹{doctor.fee}</span>
                       </div>
                       <div className="flex justify-between items-center mb-8 px-2">
                          <span className="text-[14px] font-black text-gray-300 uppercase tracking-widest">Security Fee</span>
                          <span className="text-[13px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg">WAIVED</span>
                       </div>
                       <div className="flex justify-between items-center py-6 px-8 bg-[#333333] rounded-[28px] shadow-2xl shadow-gray-900/10 transform hover:scale-[1.02] transition-transform">
                          <span className="text-[14px] font-black text-white/40 uppercase tracking-widest">Pay Amount</span>
                          <span className="text-[26px] font-black text-white tracking-tighter">₹{doctor.fee}</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-[11px] font-black text-gray-300 uppercase tracking-[0.2em] pt-4">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                       Encrypted Transaction
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Activity({ size }: { size: number }) {
  return <Sparkles size={size} className="animate-pulse" />
}
