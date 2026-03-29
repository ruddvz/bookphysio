'use client'

import { useState } from 'react'
import { calcGst } from '@/components/PriceDisplay'

type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'pay_at_clinic'

interface StepPaymentProps {
  feeInr: number
  onBack: () => void
  onNext: (method: PaymentMethod) => void
}

export function StepPayment({ feeInr, onBack, onNext }: StepPaymentProps) {
  const [method, setMethod] = useState<PaymentMethod>('upi')
  const [upiId, setUpiId] = useState('')
  const gst = calcGst(feeInr)
  const total = feeInr + gst

  function handlePay(e: React.FormEvent) {
    e.preventDefault()
    onNext(method)
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

        {[
          { id: 'upi' as const,           label: 'UPI',                  badge: 'Recommended' },
          { id: 'card' as const,          label: 'Credit / Debit Card',  badge: undefined },
          { id: 'netbanking' as const,    label: 'Net Banking',          badge: undefined },
          { id: 'pay_at_clinic' as const, label: 'Pay at Clinic',        badge: undefined },
        ].map(({ id, label, badge }) => (
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
          </div>
        )}
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          className="w-full rounded-[24px] bg-[#FF6B35] py-3 text-sm font-semibold text-white hover:bg-[#e55d2b] transition-colors"
        >
          Pay ₹{total.toLocaleString('en-IN')} →
        </button>
        <p className="text-center text-xs text-[#666]">🔒 Secured by Razorpay</p>
        <button
          type="button"
          onClick={onBack}
          className="w-full text-sm text-[#666] hover:text-[#333] transition-colors"
        >
          ← Back
        </button>
      </div>
    </form>
  )
}
