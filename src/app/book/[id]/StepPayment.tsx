'use client'

import { useState } from 'react'
import { useRouter, usePathname, useSearchParams as useBookingSearchParams } from 'next/navigation'
import { CreditCard, Smartphone, Building2, Wallet, ShieldCheck, CheckCircle2, X, Lock, MoveRight, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'pay_at_clinic'

interface PatientDetails {
  fullName: string
  phone: string
  email: string
  reason: string
  homeVisitAddress: string
  painLocation: string
  painDuration: string
}

interface BookingResult {
  appointmentId: string
  refNumber: string
  totalPaid: number
  gstAmount: number
  paymentMethod: PaymentMethod
}

interface StepPaymentProps {
  doctorId: string
  slotId: string
  locationId?: string
  visitType: string
  feeInr: number
  patient: PatientDetails
  onBack: () => void
  onSuccess: (result: BookingResult) => void
}

const PAYMENT_MODES = [
  { id: 'pay_at_clinic' as const, label: 'Pay at Clinic', icon: Wallet, description: 'Reserve now and settle during the visit', badge: 'Available', available: true },
  { id: 'upi' as const, label: 'UPI Payments', icon: Smartphone, description: 'Online checkout will open soon', badge: 'Soon', available: false },
  { id: 'card' as const, label: 'Cards', icon: CreditCard, description: 'Visa, Mastercard, RuPay', badge: 'Soon', available: false },
  { id: 'netbanking' as const, label: 'Net Banking', icon: Building2, description: 'All major Indian banks', badge: 'Soon', available: false },
]

export function StepPayment({ doctorId, slotId, locationId, visitType, feeInr, patient, onSuccess }: StepPaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>('pay_at_clinic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsAuth, setNeedsAuth] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const bookingSearch = useBookingSearchParams()

  const gstAmount = Math.round(feeInr * 0.18)
  const total = feeInr + gstAmount
  const canPay = !loading && method === 'pay_at_clinic'

  function extractApiError(errorPayload: unknown): string {
    if (typeof errorPayload === 'string') {
      return errorPayload
    }

    if (
      typeof errorPayload === 'object' &&
      errorPayload !== null &&
      'fieldErrors' in errorPayload &&
      typeof (errorPayload as { fieldErrors?: unknown }).fieldErrors === 'object'
    ) {
      const fieldErrors = Object.values((errorPayload as { fieldErrors: Record<string, string[] | undefined> }).fieldErrors)
        .flat()
        .filter((value): value is string => typeof value === 'string' && value.length > 0)

      if (fieldErrors.length > 0) {
        return fieldErrors[0]
      }
    }

    if (
      typeof errorPayload === 'object' &&
      errorPayload !== null &&
      'formErrors' in errorPayload &&
      Array.isArray((errorPayload as { formErrors?: unknown }).formErrors)
    ) {
      const formError = (errorPayload as { formErrors: unknown[] }).formErrors.find(
        (value): value is string => typeof value === 'string' && value.length > 0,
      )

      if (formError) {
        return formError
      }
    }

    return 'Unable to complete this booking right now.'
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const noteParts: string[] = []
      if (patient.reason.trim()) noteParts.push(patient.reason.trim())
      if (patient.painLocation) noteParts.push(`Pain area: ${patient.painLocation}`)
      if (patient.painDuration) noteParts.push(`Duration: ${patient.painDuration}`)
      const combinedNotes = noteParts.join(' | ')

      const apptRes = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: doctorId,
          availability_id: slotId,
          ...(locationId ? { location_id: locationId } : {}),
          visit_type: visitType,
          patient_address: visitType === 'home_visit' ? patient.homeVisitAddress : undefined,
          ...(combinedNotes ? { notes: combinedNotes } : {}),
        }),
      })

      if (!apptRes.ok) {
        const data = await apptRes.json() as { error?: unknown }
        if (apptRes.status === 401) {
          setNeedsAuth(true)
          setError('Please sign in to confirm this booking.')
          return
        }
        setError(extractApiError(data.error))
        return
      }

      const appt = await apptRes.json() as { id: string }

      if (method === 'pay_at_clinic') {
        const refNumber = `BP-${appt.id.slice(0, 6).toUpperCase()}`
        onSuccess({ appointmentId: appt.id, refNumber, totalPaid: total, gstAmount, paymentMethod: method })
        return
      }

      setError('Online payments are not available yet. Please use Pay at Clinic.')
    } catch {
      setError('Unstable network connection detected.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
           <div className="w-12 h-12 bg-emerald-50 rounded-[18px] flex items-center justify-center text-[#059669] border border-emerald-100">
              <Lock size={24} strokeWidth={2.5} />
           </div>
           <div>
              <h2 className="text-[32px] md:text-[40px] font-bold text-bp-primary tracking-tighter leading-none">Booking Checkout</h2>
              <p className="text-[14px] text-bp-body/40 font-bold mt-1 tracking-widest uppercase">Clinic payment currently enabled</p>
           </div>
        </div>
      </div>

      <form onSubmit={handlePay} className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          {PAYMENT_MODES.map((mode) => {
            const isSelected = method === mode.id
            const Icon = mode.icon
            return (
              <label 
                key={mode.id}
                className={cn(
                  "group relative flex items-center gap-6 p-6 rounded-[32px] border-2 cursor-pointer transition-all duration-500 active:scale-[0.98] overflow-hidden",
                  isSelected 
                    ? "bg-bp-surface border-bp-accent shadow-[0_32px_64px_-16px_rgba(0,118,108,0.1)]" 
                    : "bg-white border-bp-border/50 hover:bg-bp-surface hover:border-bp-border",
                  !mode.available && !isSelected && "cursor-not-allowed bg-bp-surface/70 opacity-65 hover:border-bp-border/50 hover:bg-bp-surface/70"
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={mode.id}
                  checked={isSelected}
                  onChange={() => {
                    if (mode.available) {
                      setMethod(mode.id)
                    }
                  }}
                  disabled={!mode.available}
                  className="sr-only"
                />
                
                {/* Visual Indicator */}
                <div className={cn(
                  "w-16 h-16 rounded-[22px] flex items-center justify-center transition-all duration-500",
                  isSelected 
                    ? "bg-bp-accent text-white rotate-[10deg] scale-110 shadow-xl shadow-bp-primary/20" 
                    : "bg-bp-surface text-bp-body/30 group-hover:text-bp-body/40",
                  !mode.available && "group-hover:text-bp-body/30"
                )}>
                  <Icon size={28} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                     <p className={cn("text-[18px] font-bold tracking-tight transition-colors duration-500", isSelected ? "text-bp-accent" : "text-bp-primary")}>
                       {mode.label}
                     </p>
                     {mode.badge && (
                       <span className={cn(
                         "text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg",
                         mode.available && isSelected ? "bg-bp-accent/15/50 text-bp-accent" : mode.available ? "bg-emerald-100 text-emerald-700" : "bg-bp-surface text-bp-body/40"
                       )}>
                         {mode.badge}
                       </span>
                     )}
                  </div>
                  <p className="text-[14px] font-bold text-bp-body/40">{mode.description}</p>
                </div>

                <div className={cn(
                   "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                   isSelected ? "bg-bp-accent border-bp-accent" : "border-bp-border"
                )}>
                    {isSelected && <CheckCircle2 size={16} strokeWidth={4} className="text-white animate-in zoom-in" />}
                </div>

                {/* Micro Backdrop Glow */}
                {isSelected && (
                  <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-bp-accent/10 rounded-full blur-3xl opacity-50"></div>
                )}
              </label>
            )
          })}
        </div>

        {error && !needsAuth && (
          <div className="p-6 bg-red-50 border border-red-100 rounded-[32px] flex gap-4 mt-8 animate-in shake-in-50 duration-500">
            <div className="p-2 bg-red-100 rounded-2xl h-fit">
               <X className="w-5 h-5 text-red-500" strokeWidth={3} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-red-600">Booking could not be completed</p>
               <p className="text-[13px] font-bold text-red-400 mt-1">{error}</p>
            </div>
          </div>
        )}

        {needsAuth && (
          <div className="p-8 bg-bp-surface border-2 border-bp-accent/20 rounded-[32px] mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 bg-bp-accent/10 rounded-2xl flex items-center justify-center text-bp-accent">
                <LogIn size={28} />
              </div>
              <div>
                <p className="text-[18px] font-bold text-bp-primary mb-1">Sign in to complete your booking</p>
                <p className="text-[14px] text-bp-body/60 max-w-sm">
                  Please sign in to confirm this booking. Your slot selection is saved.
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => router.push(`/login?return=${encodeURIComponent(`${pathname}?${bookingSearch.toString()}`)}`)}
                  className="px-8 py-3.5 bg-bp-accent text-white rounded-full text-[15px] font-bold hover:bg-bp-primary transition-colors"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/signup?return=${encodeURIComponent(`${pathname}?${bookingSearch.toString()}`)}`)}
                  className="px-8 py-3.5 bg-white text-bp-primary border-2 border-bp-border rounded-full text-[15px] font-bold hover:bg-bp-surface transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="pt-10">
          <button
            type="submit"
            disabled={!canPay}
            className={cn(
               "w-full group relative h-24 bg-bp-secondary text-white rounded-[32px] shadow-2xl shadow-orange-900/10 hover:shadow-orange-900/20 hover:scale-[1.01] active:scale-[0.98] transition-all duration-500 overflow-hidden",
               loading && "opacity-80 cursor-not-allowed"
            )}
          >
            <div className="relative z-10 flex items-center justify-center gap-4 text-[22px] font-bold tracking-tighter">
               {loading ? (
                 <>
                   <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                   Reserving Slot
                 </>
               ) : (
                 <>
                   <div className="flex flex-col items-start leading-none gap-1">
                      <span className="text-[12px] font-bold text-white/50 uppercase tracking-[0.2em]">Reserve</span>
                      <span className="text-[20px]">Confirm Booking</span>
                   </div>
                   <MoveRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform duration-500" />
                 </>
               )}
            </div>
            
            {canPay && !loading && (
               <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shine transition-transform duration-1000"></div>
            )}
          </button>

           <div className="mt-8 flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center gap-2.5 px-4 py-2 bg-bp-surface rounded-full border border-bp-border">
                <ShieldCheck size={14} className="text-emerald-500" />
                <span className="text-[10px] font-bold text-bp-body/40 uppercase tracking-widest">Encrypted Booking Request</span>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2 bg-bp-surface rounded-full border border-bp-border">
                <Lock size={14} className="text-bp-accent" />
                <span className="text-[10px] font-bold text-bp-body/40 uppercase tracking-widest">Pay During Visit</span>
              </div>
            </div>
            <p className="text-center text-[12px] font-bold text-bp-body/40 max-w-md">
              Online payments are not available yet. Reserve the session now and settle the consultation amount directly with the provider.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Razorpay checkout loader
// ---------------------------------------------------------------------------

interface RazorpayOptions {
  orderId: string
  amountPaise: number
  keyId: string
  appointmentId: string
  patientName: string
  patientPhone: string
  patientEmail: string
  onSuccess: () => void
  onFailure: (msg: string) => void
}

interface RazorpayResponse {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void }
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false)
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function openRazorpay(opts: RazorpayOptions): Promise<void> {
  const loaded = await loadRazorpayScript()
  if (!loaded || !window.Razorpay) {
    opts.onFailure('Medical Gateway Offline. Try again.')
    return
  }

  const rzp = new window.Razorpay({
    key: opts.keyId,
    amount: opts.amountPaise,
    currency: 'INR',
    order_id: opts.orderId,
    name: 'BookPhysio Secure',
    description: 'Expert Clinical Consultation',
    prefill: {
      name: opts.patientName,
      contact: opts.patientPhone,
      email: opts.patientEmail,
    },
    theme: { color: '#12b3a0' },
    handler: async (response: RazorpayResponse) => {
      try {
        const verifyRes = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            appointment_id: opts.appointmentId,
          }),
        })

        if (!verifyRes.ok) {
          const errorData = await verifyRes.json() as { error?: string }
          throw new Error(errorData.error || 'Identity Verification failed')
        }

        opts.onSuccess()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Payment Vault Error.'
        opts.onFailure(message)
      }
    },
    modal: {
      ondismiss: () => opts.onFailure('Transaction Vault Closed.'),
    },
  })
  rzp.open()
}
