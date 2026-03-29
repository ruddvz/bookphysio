export type PaymentStatus = 'created' | 'paid' | 'failed' | 'refunded'

export interface PaymentOrder {
  id: string
  appointment_id: string
  razorpay_order_id: string
  amount_inr: number
  gst_amount_inr: number
  status: PaymentStatus
  created_at: string
}

export interface RazorpayCheckoutConfig {
  key: string
  amount: number
  currency: 'INR'
  name: string
  description: string
  order_id: string
  prefill: {
    name: string
    email: string
    contact: string
  }
}
