'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { StepConfirm } from './StepConfirm'
import { StepPayment } from './StepPayment'
import { StepSuccess } from './StepSuccess'
import { Check, Calendar, Clock, MapPin, ShieldCheck, User, ArrowLeft, Award, Sparkles, LayoutDashboard } from 'lucide-react'
import Image from 'next/image'
import { formatIndiaDateInput } from '@/lib/india-date'
import { cn } from '@/lib/utils'
import { getVisitTypeConsultationFee } from '@/lib/booking/policy'
import { formatPublicProviderLocation } from '@/lib/providers/public'
import { BOOKING_COPY, type StaticLocale } from '@/lib/i18n/dynamic-pages'

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
  homeVisitAddress: string
}

interface BookingResult {
  appointmentId: string
  refNumber: string
  totalPaid: number
  gstAmount: number
  paymentMethod: PaymentMethod
}

export default function BookingInner({ locale }: { locale?: StaticLocale } = {}) {
  const t = BOOKING_COPY[locale ?? 'en']
  const STEPS = [
    { n: 1, label: t.stepLabels[0] },
    { n: 2, label: t.stepLabels[1] },
    { n: 3, label: t.stepLabels[2] },
  ]
  const params = useParams()
  const searchParams = useSearchParams()
  const doctorId = params.id as string

  const date = searchParams.get('date') ?? formatIndiaDateInput(new Date())
  const time = searchParams.get('time') ?? ''
  const visitType = searchParams.get('type') ?? 'in_clinic'
  const slotId = searchParams.get('slot_id') ?? ''
  const locationId = searchParams.get('location_id') ?? ''

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
        const loc = data.locations?.find((location: { id?: string }) => location.id === locationId) ?? data.locations?.[0]
        setDoctor({
          name: nameWithTitle,
          specialty: data.specialties?.[0]?.name ?? 'Physiotherapist',
          location: loc ? formatPublicProviderLocation(loc) : 'India',
          fee: getVisitTypeConsultationFee(data.consultation_fee_inr ?? 0, visitType),
          avatar_url: data.avatar_url,
        })
      })
      .catch(() => {
        setDoctor({ name: 'Doctor', specialty: 'Physiotherapist', location: 'India', fee: 0 })
      })
  }, [doctorId, locationId, visitType])

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#FBFCFD] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
           <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-bp-border border-t-bp-accent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-bp-accent/20"><Activity size={24} /></div>
           </div>
           <div className="text-center">
              <p className="text-[18px] font-bold text-bp-primary tracking-tight">{t.loadingTitle}</p>
              <p className="text-[14px] font-bold text-bp-body/40 mt-1">{t.loadingSubtitle}</p>
           </div>
        </main>
        <Footer />
      </div>
    )
  }

  const bookingLocation = visitType === 'home_visit'
    ? patient?.homeVisitAddress || doctor.location
    : doctor.location
  const amountLabel = 'Amount Due'

  const displayDate = new Date(`${date}T00:00:00+05:30`).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Kolkata',
  })

  return (
    <div className="min-h-screen bg-[#FBFCFD] flex flex-col selection:bg-bp-accent/10 selection:text-bp-accent">
      <Navbar />
      
      {/* ── Progress Interface ── */}
      <div className="bg-white border-b border-bp-border sticky top-[72px] z-40 hidden md:block">
         <div className="max-w-[1280px] mx-auto px-12 py-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {STEPS.map((s, i) => (
                  <div key={s.n} className="flex items-center">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-[18px] text-[15px] font-bold transition-all duration-700 border-2",
                        step === s.n ? "bg-bp-accent text-white border-bp-accent shadow-[0_12px_24px_-8px_rgba(0,118,108,0.4)] scale-110" :
                        step > s.n ? "bg-bp-accent text-white border-bp-accent" :
                        "bg-white text-gray-200 border-bp-border"
                      )}>
                        {step > s.n ? (
                          <Check size={18} strokeWidth={4} className="animate-in zoom-in duration-500" />
                        ) : s.n}
                      </div>
                      <span className={cn(
                        "text-[12px] font-bold uppercase tracking-[0.25em] transition-all duration-700",
                        step >= s.n ? "text-bp-primary" : "text-gray-200"
                      )}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={cn(
                        "mx-6 h-[2px] w-12 transition-all duration-700 rounded-full",
                        step > s.n ? "bg-bp-accent" : "bg-bp-surface"
                      )} />
                    )}
                  </div>
                ))}
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-bp-surface rounded-xl border border-bp-border">
               <ShieldCheck size={16} className="text-emerald-500" />
              <span className="text-[11px] font-bold text-bp-body/40 uppercase tracking-widest leading-none">{t.protectedFlow}</span>
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
                className="group flex items-center gap-3 px-6 py-3 bg-white border border-bp-border rounded-2xl text-[14px] font-bold text-bp-body/40 hover:text-bp-accent hover:border-bp-accent/20 shadow-sm transition-all active:scale-95"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                {t.returnToPrevious}
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
                    locationId={locationId || undefined}
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
                    location={bookingLocation}
                    totalPaid={bookingResult.totalPaid}
                    gstAmount={bookingResult.gstAmount}
                    paymentMethod={bookingResult.paymentMethod}
                    refNumber={bookingResult.refNumber}
                  />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Booking Summary (Ultra Premium) */}
            {step < 3 && (
              <aside className="sticky top-[160px] animate-in fade-in slide-in-from-right-8 duration-1000 delay-200">
                <div className="bg-white rounded-[48px] border border-bp-border shadow-[0_48px_80px_-32px_rgba(0,0,0,0.1)] overflow-hidden relative group/sidebar">
                  
                  {/* Backdrop Glow */}
                  <div className="absolute -top-32 -right-32 w-64 h-64 bg-bp-accent/10 rounded-full blur-[100px] -z-0 group-hover:scale-110 transition-transform duration-1000"></div>

                  <div className="bg-bp-accent p-8 text-white relative z-10">
                    <div className="flex items-center justify-between mb-4">
                       <h3 className="text-[20px] font-bold tracking-tight uppercase">Order Review</h3>
                       <LayoutDashboard size={20} className="opacity-30" />
                    </div>
                    <p className="text-[13px] text-white/60 font-bold tracking-widest uppercase">Summary of your session</p>
                  </div>
                  
                  <div className="p-8 space-y-10 relative z-10">
                    {/* Doctor Info (High Fidelity) */}
                    <div className="flex gap-5 items-center bg-bp-surface/50 p-6 rounded-[32px] border border-bp-border">
                       <div className="relative">
                         {doctor.avatar_url ? (
                           <Image src={doctor.avatar_url} width={80} height={80} className="w-20 h-20 rounded-[28px] object-cover border-4 border-white shadow-xl shadow-bp-primary/5 transition-transform group-hover/sidebar:scale-105" alt="" />
                         ) : (
                           <div className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-bp-accent/10 to-bp-accent/20 text-bp-accent flex items-center justify-center font-bold text-2xl border-4 border-white shadow-xl">
                             {doctor.name[0]}
                           </div>
                         )}
                         <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-lg border border-bp-border/50">
                            <div className="w-6 h-6 bg-[#059669] rounded-lg flex items-center justify-center text-white"><Check size={14} strokeWidth={4} /></div>
                         </div>
                       </div>
                       <div>
                         <p className="text-[17px] font-bold text-bp-primary leading-none mb-2">{doctor.name}</p>
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-bp-accent/20 rounded-lg w-fit">
                            <Award size={12} className="text-bp-accent" strokeWidth={3} />
                            <p className="text-[10px] font-bold text-bp-accent uppercase tracking-widest">{doctor.specialty.split(' ')[0]} Expert</p>
                         </div>
                       </div>
                    </div>

                    {/* Schedule (Luxury Matrix) */}
                    <div className="grid grid-cols-1 gap-6 px-2">
                       <div className="flex items-center gap-5 group/item">
                          <div className="w-12 h-12 bg-bp-surface rounded-2xl flex items-center justify-center text-bp-body/30 group-hover/item:text-bp-accent group-hover/item:bg-bp-accent/10 transition-all duration-300">
                             <Calendar size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2">Schedule</p>
                            <p className="text-[16px] font-bold text-bp-primary tracking-tight">{displayDate}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-5 group/item">
                          <div className="w-12 h-12 bg-bp-surface rounded-2xl flex items-center justify-center text-bp-body/30 group-hover/item:text-bp-accent group-hover/item:bg-bp-accent/10 transition-all duration-300">
                             <Clock size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2">Duration</p>
                            <div className="flex items-center gap-2">
                               <p className="text-[16px] font-bold text-bp-primary tracking-tight">{time}</p>
                               <span className="text-[11px] font-bold text-[#059669] bg-emerald-50 px-2.5 py-1 rounded-lg">45 MIN</span>
                            </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-5 group/item">
                          <div className="w-12 h-12 bg-bp-surface rounded-2xl flex items-center justify-center text-bp-body/30 group-hover/item:text-bp-accent group-hover/item:bg-bp-accent/10 transition-all duration-300">
                             <MapPin size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2">Consultation Mode</p>
                            <p className="text-[16px] font-bold text-bp-primary leading-none">{visitType.replace('_', ' ').toUpperCase()}</p>
                          </div>
                       </div>
                    </div>

                    {/* Patient Context Summary */}
                    {step === 2 && patient && (
                      <div className="pt-10 border-t border-bp-border animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="space-y-4">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 bg-bp-accent/10 rounded-2xl flex items-center justify-center text-bp-accent">
                               <User size={20} strokeWidth={3} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2">Patient Details</p>
                               <p className="text-[16px] font-bold text-bp-primary tracking-tight">{patient.fullName}</p>
                            </div>
                          </div>
                          {visitType === 'home_visit' && patient.homeVisitAddress ? (
                            <div className="flex items-start gap-5">
                              <div className="w-12 h-12 bg-bp-secondary/10 rounded-2xl flex items-center justify-center text-bp-secondary">
                                 <MapPin size={20} strokeWidth={3} />
                              </div>
                              <div>
                                <p className="text-[10px] font-bold text-bp-body/30 uppercase tracking-[0.2em] leading-none mb-2">Visit Address</p>
                                <p className="text-[15px] font-bold text-bp-primary tracking-tight leading-relaxed">{patient.homeVisitAddress}</p>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    )}

                    {/* Price Matrix (High Contrast) */}
                    <div className="pt-10 mt-4 border-t border-bp-border">
                       <div className="flex justify-between items-center mb-4 px-2">
                          <span className="text-[14px] font-bold text-bp-body/30 uppercase tracking-widest">Consultation</span>
                          <span className="text-[16px] font-bold text-bp-primary">₹{doctor.fee.toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between items-center mb-4 px-2">
                          <span className="text-[14px] font-bold text-bp-body/30 uppercase tracking-widest">GST (18%)</span>
                          <span className="text-[16px] font-bold text-bp-primary">₹{Math.round(doctor.fee * 0.18).toLocaleString('en-IN')}</span>
                       </div>
                       <div className="flex justify-between items-center mb-8 px-2">
                          <span className="text-[14px] font-bold text-bp-body/30 uppercase tracking-widest">Platform Fee</span>
                          <span className="text-[13px] font-bold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-lg">WAIVED</span>
                       </div>
                       <div className="flex justify-between items-center py-6 px-8 bg-bp-primary rounded-[28px] shadow-2xl shadow-gray-900/10 transform hover:scale-[1.02] transition-transform">
                          <span className="text-[14px] font-bold text-white/40 uppercase tracking-widest">{amountLabel}</span>
                          <span className="text-[26px] font-bold text-white tracking-tighter">₹{(doctor.fee + Math.round(doctor.fee * 0.18)).toLocaleString('en-IN')}</span>
                       </div>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] pt-4">
                       <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        Encrypted Booking Request
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
