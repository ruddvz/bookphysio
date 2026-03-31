'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { StepConfirm } from './StepConfirm'
import { StepPayment } from './StepPayment'
import { StepSuccess } from './StepSuccess'
import { Check, Calendar, Clock, MapPin, ShieldCheck, User, ArrowLeft, Phone, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

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
  { n: 1, label: 'Details' },
  { n: 2, label: 'Payment' },
  { n: 3, label: 'Complete' },
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
      <div className="min-h-screen bg-[#F9FBFC] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-400 font-bold flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-[#00766C] border-t-transparent rounded-full animate-spin" />
            Preparing your session...
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
    <div className="min-h-screen bg-[#F9FBFC] flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-6">
        <div className="max-w-[1142px] mx-auto">
          
          {/* Stepper Header */}
          <div className="flex flex-col items-center mb-12">
             <div className="flex items-center gap-4">
                {STEPS.map((s, i) => (
                  <div key={s.n} className="flex items-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full text-sm font-black transition-all border-2",
                        step === s.n ? "bg-[#00766C] text-white border-[#00766C] shadow-lg shadow-teal-100" :
                        step > s.n ? "bg-[#00766C] text-white border-[#00766C]" :
                        "bg-white text-gray-300 border-gray-200"
                      )}>
                        {step > s.n ? (
                          <Check size={20} strokeWidth={3} />
                        ) : s.n}
                      </div>
                      <span className={cn(
                        "text-[11px] font-black uppercase tracking-widest",
                        step >= s.n ? "text-[#00766C]" : "text-gray-300"
                      )}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn(
                        "mx-4 mb-6 h-[2px] w-12 md:w-20 transition-all rounded-full",
                        step > s.n ? "bg-[#00766C]" : "bg-gray-100"
                      )} />
                    )}
                  </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 items-start">
            
            {/* LEFT COLUMN: Active Step */}
            <div className="min-w-0">
               {step === 2 && (
                 <button 
                  onClick={() => setStep(1)}
                  className="mb-6 flex items-center gap-2 text-[14px] font-black text-gray-400 hover:text-[#00766C] transition-colors"
                 >
                   <ArrowLeft size={16} /> Back to Details
                 </button>
               )}

              {step === 1 && (
                <StepConfirm
                  doctor={doctor}
                  booking={{ date, time, visitType }}
                  onNext={(p) => { setPatient(p); setStep(2) }}
                />
              )}
              {step === 2 && patient && (
                <StepPayment
                  doctorId={doctorId}
                  slotId={slotId}
                  visitType={visitType}
                  feeInr={doctor.fee}
                  patient={patient}
                  onBack={() => setStep(1)}
                  onSuccess={(result) => { setBookingResult(result); setStep(3) }}
                />
              )}
              {step === 3 && bookingResult && (
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
              )}
            </div>

            {/* RIGHT COLUMN: Booking Summary (Sticky) */}
            {step < 3 && (
              <aside className="sticky top-32">
                <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
                  <div className="bg-[#00766C] p-6 text-white">
                    <h3 className="text-[18px] font-black tracking-tight">Booking Summary</h3>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {/* Doctor Info */}
                    <div className="flex gap-4 items-center border-b border-gray-50 pb-6">
                       {doctor.avatar_url ? (
                         <img src={doctor.avatar_url} className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-100" alt="" />
                       ) : (
                         <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#00766C] flex items-center justify-center font-black text-xl">
                           {doctor.name[0]}
                         </div>
                       )}
                       <div>
                         <p className="font-black text-[#333333] leading-tight">{doctor.name}</p>
                         <p className="text-[13px] font-bold text-[#00766C] mt-0.5">{doctor.specialty}</p>
                       </div>
                    </div>

                    {/* Schedule */}
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                             <Calendar size={18} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Date</p>
                            <p className="text-[14px] font-black text-[#333333]">{displayDate}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                             <Clock size={18} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Time</p>
                            <p className="text-[14px] font-black text-[#333333]">{time}</p>
                          </div>
                       </div>

                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                             <MapPin size={18} />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Location</p>
                            <p className="text-[14px] font-black text-[#333333] truncate max-w-[200px]">{doctor.location}</p>
                          </div>
                       </div>
                    </div>

                    {/* Patient Summary (Step 2 Only) */}
                    {step === 2 && patient && (
                      <div className="pt-6 border-t border-gray-50 space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-teal-50 rounded-lg text-[#00766C]">
                             <User size={18} />
                          </div>
                          <div>
                             <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Patient</p>
                             <p className="text-[14px] font-black text-[#333333]">{patient.fullName}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="pt-6 mt-4 border-t border-gray-100">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[14px] font-bold text-gray-400">Consultation Fee</span>
                          <span className="text-[16px] font-black text-[#333333]">₹{doctor.fee}</span>
                       </div>
                       <div className="flex justify-between items-center mb-4">
                          <span className="text-[14px] font-bold text-gray-400">Booking Charges</span>
                          <span className="text-[14px] font-bold text-[#059669]">FREE</span>
                       </div>
                       <div className="flex justify-between items-center py-4 px-4 bg-teal-50/50 rounded-2xl">
                          <span className="text-[15px] font-black text-[#00766C]">Total to Pay</span>
                          <span className="text-[22px] font-black text-[#00766C]">₹{doctor.fee}</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[12px] font-bold text-gray-400 uppercase tracking-tight pt-2">
                       <ShieldCheck size={14} className="text-[#059669]" />
                       Secure 256-bit SSL Booking
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
