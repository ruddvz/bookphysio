'use client'

import { useState } from 'react'
import { Loader2, CreditCard, Smartphone, Building2, Wallet, ShieldCheck, ChevronRight, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'pay_at_clinic'

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

interface StepPaymentProps {
  doctorId: string
  slotId: string
  visitType: string
  feeInr: number
  patient: PatientDetails
  onBack: () => void
  onSuccess: (result: BookingResult) => void
}

const PAYMENT_MODES = [
  { id: 'upi' as const, label: 'UPI (GPay, PhonePe)', icon: Smartphone, description: 'Pay via any UPI app' },
  { id: 'card' as const, label: 'Credit / Debit Card', icon: CreditCard, description: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking' as const, label: 'Net Banking', icon: Building2, description: 'All major Indian banks' },
  { id: 'pay_at_clinic' as const, label: 'Pay at Clinic', icon: Wallet, description: 'Pay after consultation' },
]

export function StepPayment({ doctorId, slotId, visitType, feeInr, patient, onSuccess }: StepPaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>('upi')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = feeInr
  const canPay = !loading

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const apptRes = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: doctorId,
          availability_id: slotId,
          visit_type: visitType,
          notes: patient.reason || null,
        }),
      })

      if (!apptRes.ok) {
        const data = await apptRes.json() as { error?: string }
        if (apptRes.status === 401) {
          const guestRef = `BP-${Date.now().toString().slice(-6)}`
          onSuccess({ appointmentId: '', refNumber: guestRef, totalPaid: total, paymentMethod: method })
          return
        }
        setError(data.error ?? 'Failed to create appointment. Please try again.')
        return
      }

      const appt = await apptRes.json() as { id: string }

      if (method === 'pay_at_clinic') {
        const refNumber = `BP-${appt.id.slice(0, 6).toUpperCase()}`
        onSuccess({ appointmentId: appt.id, refNumber, totalPaid: total, paymentMethod: method })
        return
      }

      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointment_id: appt.id }),
      })

      if (!orderRes.ok) {
        const data = await orderRes.json() as { error?: string }
        setError(data.error ?? 'Failed to initiate payment. Please try again.')
        return
      }

      const orderData = await orderRes.json() as {
        razorpay_order_id: string
        amount_paise: number
        key_id: string
        payment: { id: string }
      }

      await openRazorpay({
        orderId: orderData.razorpay_order_id,
        amountPaise: orderData.amount_paise,
        keyId: orderData.key_id,
        appointmentId: appt.id,
        patientName: patient.fullName,
        patientPhone: patient.phone,
        patientEmail: patient.email,
        onSuccess: () => {
          const refNumber = `BP-${appt.id.slice(0, 6).toUpperCase()}`
          onSuccess({ appointmentId: appt.id, refNumber, totalPaid: total, paymentMethod: method })
        },
        onFailure: (msg: string) => setError(msg),
      })
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-[28px] font-black text-[#333333] tracking-tight">Payment Method</h2>
        <p className="text-gray-500 font-medium pt-1">Select how you'd like to pay for your session.</p>
      </div>

      <form onSubmit={handlePay} className="space-y-4">
        {PAYMENT_MODES.map((mode) => {
          const isSelected = method === mode.id
          const Icon = mode.icon
          return (
            <label 
              key={mode.id}
              className={cn(
                "group flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all active:scale-[0.98]",
                isSelected 
                  ? "bg-teal-50/30 border-[#00766C] shadow-lg shadow-teal-50" 
                  : "bg-white border-gray-100 hover:border-gray-200"
              )}
            >
              <input
                type="radio"
                name="payment"
                value={mode.id}
                checked={isSelected}
                onChange={() => setMethod(mode.id)}
                className="hidden"
              />
              <div className={cn(
                "p-3 rounded-xl transition-colors",
                isSelected ? "bg-[#00766C] text-white" : "bg-gray-100 text-gray-400 group-hover:text-gray-600"
              )}>
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <p className={cn("text-[16px] font-black leading-tight", isSelected ? "text-[#00766C]" : "text-[#333333]")}>
                  {mode.label}
                </p>
                <p className="text-[13px] font-bold text-gray-400 mt-1">{mode.description}</p>
              </div>
              {isSelected && (
                <div className="text-[#00766C] animate-in zoom-in duration-200">
                  <CheckCircle2 size={24} fill="#F0FDFA" />
                </div>
              )}
            </label>
          )
        })}

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 mt-6">
            <div className="p-1 bg-red-100 rounded-full h-fit mt-0.5">
               <X className="w-4 h-4 text-red-500" />
            </div>
            <p className="text-[13px] font-bold text-red-600 leading-tight">{error}</p>
          </div>
        )}

        <div className="pt-8">
          <button
            type="submit"
            disabled={!canPay}
            className={cn(
               "w-full group flex items-center justify-center gap-3 py-5 bg-[#FF6B35] text-white text-[18px] font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-[#E85D2A] hover:scale-[1.02] active:scale-[0.98] transition-all",
               loading && "opacity-80 cursor-not-allowed"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {method === 'pay_at_clinic' ? 'Confirm Booking' : `Pay ₹${total.toLocaleString('en-IN')}`}
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="flex items-center gap-4 grayscale opacity-40">
               <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-4" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" className="h-3" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4" />
            </div>
            <p className="text-[12px] font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5 mt-1">
              <ShieldCheck size={14} className="text-[#059669]" />
              Secure Payment via Razorpay
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

declare global {
  interface Window {
     
    Razorpay?: new (options: Record<string, unknown>) => { open(): void }
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

async function openRazorpay(opts: RazorpayOptions): Promise<void> {
  const loaded = await loadRazorpayScript()
  if (!loaded || !window.Razorpay) {
    opts.onFailure('Could not load payment gateway. Please try again.')
    return
  }

  const rzp = new window.Razorpay({
    key: opts.keyId,
    amount: opts.amountPaise,
    currency: 'INR',
    order_id: opts.orderId,
    name: 'BookPhysio',
    description: 'Physiotherapy Consultation',
    prefill: {
      name: opts.patientName,
      contact: opts.patientPhone,
      email: opts.patientEmail,
    },
    theme: { color: '#00766C' },
    handler: async (response: any) => {
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
          const errorData = await verifyRes.json()
          throw new Error(errorData.error || 'Verification failed')
        }

        opts.onSuccess()
      } catch (err: any) {
        opts.onFailure(err.message || 'Payment verification failed. Please contact support.')
      }
    },
    modal: {
      ondismiss: () => opts.onFailure('Payment was cancelled.'),
    },
  })
  rzp.open()
}
