'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { calcGst } from '@/components/PriceDisplay'

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

export function StepPayment({ doctorId, slotId, visitType, feeInr, patient, onBack, onSuccess }: StepPaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>('upi')
  const [upiId, setUpiId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const gst = calcGst(feeInr)
  const total = feeInr + gst
  const upiValid = method !== 'upi' || /^[\w.\-+]+@[\w]+$/.test(upiId)
  const canPay = !loading && upiValid

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Step 1: Create appointment
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
        // If unauthenticated, create a guest booking reference for pay-at-clinic
        if (apptRes.status === 401) {
          const guestRef = `BP-${Date.now().toString().slice(-6)}`
          onSuccess({ appointmentId: '', refNumber: guestRef, totalPaid: total, paymentMethod: method })
          return
        }
        setError(data.error ?? 'Failed to create appointment. Please try again.')
        return
      }

      const appt = await apptRes.json() as { id: string }

      // Step 2: For pay_at_clinic — skip Razorpay
      if (method === 'pay_at_clinic') {
        const refNumber = `BP-${appt.id.slice(0, 6).toUpperCase()}`
        onSuccess({ appointmentId: appt.id, refNumber, totalPaid: total, paymentMethod: method })
        return
      }

      // Step 3: Create Razorpay order
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

      // Step 4: Load Razorpay checkout
      await openRazorpay({
        orderId: orderData.razorpay_order_id,
        amountPaise: orderData.amount_paise,
        keyId: orderData.key_id,
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
    <form onSubmit={handlePay} className="space-y-6">
      {/* Order summary */}
      <div className="rounded-[8px] border border-[#E5E5E5] bg-white p-4">
        <h3 className="font-semibold text-[#1A1A1A] mb-3">Order Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[#666]">Consultation fee</span>
            <span className="font-medium">₹{feeInr.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#666]">GST (18%)</span>
            <span className="font-medium">₹{gst.toLocaleString('en-IN')}</span>
          </div>
          <div className="border-t border-[#E5E5E5] pt-2 flex justify-between font-semibold text-[#1A1A1A]">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Payment method */}
      <div className="rounded-[8px] border border-[#E5E5E5] bg-white p-4 space-y-3">
        <h3 className="font-semibold text-[#1A1A1A]">Payment Method</h3>

        {([
          { id: 'upi' as const, label: 'UPI', badge: 'Recommended' },
          { id: 'card' as const, label: 'Credit / Debit Card', badge: undefined },
          { id: 'netbanking' as const, label: 'Net Banking', badge: undefined },
          { id: 'pay_at_clinic' as const, label: 'Pay at Clinic', badge: undefined },
        ] as const).map(({ id, label, badge }) => (
          <label key={id} className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="payment"
              value={id}
              checked={method === id}
              onChange={() => setMethod(id)}
              className="accent-[#00766C]"
            />
            <span className="text-sm text-[#333]">{label}</span>
            {badge && (
              <span className="ml-auto text-xs bg-[#E6F4F3] text-[#00766C] px-2 py-0.5 rounded-full font-medium">
                {badge}
              </span>
            )}
          </label>
        ))}

        {method === 'upi' && (
          <div className="mt-2 ml-6">
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="name@upi"
              className="w-full rounded-lg border border-[#E5E5E5] px-3 py-2 text-sm outline-none focus:border-[#00766C] focus:ring-1 focus:ring-[#00766C]"
            />
            {upiId && !/^[\w.\-+]+@[\w]+$/.test(upiId) && (
              <p className="mt-1 text-xs text-red-500">Enter a valid UPI ID (e.g. name@upi)</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-[8px] bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <button
          type="submit"
          disabled={!canPay}
          className={`w-full flex items-center justify-center gap-2 rounded-[24px] py-3 text-sm font-semibold text-white transition-colors ${
            !canPay ? 'bg-[#FF6B35]/60 cursor-not-allowed' : 'bg-[#FF6B35] hover:bg-[#e55d2b] cursor-pointer'
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing…
            </>
          ) : (
            `Pay ₹${total.toLocaleString('en-IN')} →`
          )}
        </button>
        <p className="text-center text-xs text-[#666]">🔒 Secured by Razorpay</p>
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="w-full text-sm text-[#666] hover:text-[#333] transition-colors"
        >
          ← Back
        </button>
      </div>
    </form>
  )
}

// ---------------------------------------------------------------------------
// Razorpay checkout loader
// ---------------------------------------------------------------------------

interface RazorpayOptions {
  orderId: string
  amountPaise: number
  keyId: string
  patientName: string
  patientPhone: string
  patientEmail: string
  onSuccess: () => void
  onFailure: (msg: string) => void
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    handler: () => opts.onSuccess(),
    modal: {
      ondismiss: () => opts.onFailure('Payment was cancelled.'),
    },
  })
  rzp.open()
}
