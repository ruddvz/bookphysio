'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { StepConfirm } from './StepConfirm'
import { StepPayment } from './StepPayment'
import { StepSuccess } from './StepSuccess'

type Step = 1 | 2 | 3
type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'pay_at_clinic'

interface DoctorInfo {
  name: string
  specialty: string
  location: string
  fee: number
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
  { n: 1, label: 'Confirm' },
  { n: 2, label: 'Payment' },
  { n: 3, label: 'Done' },
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
      .then((data: { full_name?: string; specialties?: { name: string }[]; locations?: { address?: string; city?: string }[]; consultation_fee_inr?: number }) => {
        const nameWithTitle = data.full_name?.startsWith('Dr.') ? data.full_name : `Dr. ${data.full_name ?? ''}`
        const loc = data.locations?.[0]
        setDoctor({
          name: nameWithTitle,
          specialty: data.specialties?.[0]?.name ?? 'Physiotherapist',
          location: loc ? `${loc.address ?? ''}, ${loc.city ?? ''}`.replace(/^, /, '') : 'India',
          fee: data.consultation_fee_inr ?? 0,
        })
      })
      .catch(() => {
        setDoctor({ name: 'Doctor', specialty: 'Physiotherapist', location: 'India', fee: 0 })
      })
  }, [doctorId])

  if (!doctor) {
    return (
      <div className="min-h-screen bg-[#F7F8F9] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-[#666666] text-[15px]">Loading…</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F7F8F9] flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="mx-auto max-w-lg">
          <div className="mb-8 flex items-center justify-center">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    step === s.n ? 'bg-[#00766C] text-white' :
                    step > s.n ? 'bg-[#00766C] text-white' :
                    'bg-[#E5E5E5] text-[#999]'
                  }`}>
                    {step > s.n ? (
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : s.n}
                  </div>
                  <span className={`text-[11px] font-medium leading-none ${step === s.n ? 'text-[#00766C]' : step > s.n ? 'text-[#00766C]' : 'text-[#999]'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`mx-3 mb-4 h-[2px] w-12 transition-colors ${step > s.n ? 'bg-[#00766C]' : 'bg-[#E5E5E5]'}`} />
                )}
              </div>
            ))}
          </div>
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
      </main>
      <Footer />
    </div>
  )
}
