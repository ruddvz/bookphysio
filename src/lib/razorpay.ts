import Razorpay from 'razorpay'
import crypto from 'crypto'

// Razorpay is currently disabled — payment flow is archived.
// These functions are kept for future re-enablement.

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) {
    throw new Error('Razorpay is not configured')
  }
  return new Razorpay({ key_id, key_secret })
}

export async function createOrder(amountInr: number, receiptId: string) {
  return getRazorpayClient().orders.create({
    amount: amountInr * 100,
    currency: 'INR',
    receipt: receiptId,
  })
}

export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(orderId + '|' + paymentId)
  const expectedSignature = hmac.digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expectedSignature), Buffer.from(signature))
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!secret) return false
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export function calculateGst(amountInr: number): number {
  return Math.round(amountInr * 0.18)
}
