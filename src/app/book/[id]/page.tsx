'use client'

import { useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { StepConfirm } from './StepConfirm'
import { StepPayment } from './StepPayment'
import { StepSuccess } from './StepSuccess'
import { calcGst } from '@/components/PriceDisplay'

type Step = 1 | 2 | 3
type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'pay_at_clinic'

// Mock doctor — replace with API fetch when backend is live
const MOCK_DOCTORS: Record<string, { name: string; specialty: string; location: string; fee: number }> = {
  '1': { name: 'Dr. Priya Sharma', specialty: 'Sports Physiotherapist', location: 'Andheri West, Mumbai', fee: 700 },
  '2': { name: 'Dr. Rohit Mehta',  specialty: 'Orthopedic Physiotherapist', location: 'Bandra, Mumbai', fee: 800 },
  '3': { name: 'Dr. Ananya Krishnan', specialty: 'Neurological Physiotherapist', location: 'Koramangala, Bangalore', fee: 900 },
}

const STEPS = [
  { n: 1, label: 'Confirm' },
  { n: 2, label: 'Payment' },
  { n: 3, label: 'Done'    },
]

interface PatientDetails {
  fullName: string
  phone: string
  email: string
  reason: string
}

export default function BookPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const id = params.id as string

  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]
  const time = searchParams.get('time') ?? '9:00 AM'
  const visitType = searchParams.get('type') ?? 'in_clinic'

  const doctor = MOCK_DOCTORS[id] ?? MOCK_DOCTORS['1']

  const [step, setStep] = useState<Step>(1)
  const [patient, setPatient] = useState<PatientDetails | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi')

  const gst = calcGst(doctor.fee)
  const total = doctor.fee + gst
  const refNumber = `BP-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`

  return (
    <div className="min-h-screen bg-[#F7F8F9] flex flex-col">
      <Navbar />

      <main className="flex-1 py-8 px-4">
        <div className="mx-auto max-w-lg">
          {/* Progress bar */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  step === s.n ? 'bg-[#00766C] text-white' :
                  step > s.n  ? 'bg-[#E6F4F3] text-[#00766C]' :
                  'bg-[#E5E5E5] text-[#666]'
                }`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className={`text-sm font-medium ${step === s.n ? 'text-[#00766C]' : 'text-[#999]'}`}>
                  {s.label}
                </span>
                {i < STEPS.length - 1 && <span className="mx-1 text-[#E5E5E5]">──</span>}
              </div>
            ))}
          </div>

          {/* Step content */}
          {step === 1 && (
            <StepConfirm
              doctor={doctor}
              booking={{ date, time, visitType }}
              onNext={(p) => { setPatient(p); setStep(2) }}
            />
          )}
          {step === 2 && (
            <StepPayment
              feeInr={doctor.fee}
              onBack={() => setStep(1)}
              onNext={(m) => { setPaymentMethod(m); setStep(3) }}
            />
          )}
          {step === 3 && (
            <StepSuccess
              doctorName={doctor.name}
              date={date}
              time={time}
              visitType={visitType}
              location={doctor.location}
              totalPaid={total}
              paymentMethod={paymentMethod}
              refNumber={refNumber}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
