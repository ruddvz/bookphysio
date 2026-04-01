import Razorpay from 'razorpay'
import crypto from 'crypto'

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
})

export async function createOrder(amountInr: number, receiptId: string) {
  return razorpay.orders.create({
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
  const secret = process.env.RAZORPAY_KEY_SECRET || 'dummy_secret'
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(orderId + '|' + paymentId)
  const expectedSignature = hmac.digest('hex')
  return expectedSignature === signature
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'dummy_secret')
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
