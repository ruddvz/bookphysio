import { NextResponse, type NextRequest } from 'next/server'
import { sendOtp } from '@/lib/msg91'
import { otpSendSchema } from '@/lib/validations/auth'
import { otpRatelimit } from '@/lib/upstash'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = otpSendSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phone } = parsed.data
  const { success } = await otpRatelimit.limit(phone)
  if (!success) return NextResponse.json({ error: 'Too many OTP requests. Try again in 10 minutes.' }, { status: 429 })

  const result = await sendOtp(phone)
  if (!result.success) return NextResponse.json({ error: result.error ?? 'Failed to send OTP' }, { status: 500 })

  return NextResponse.json({ message: 'OTP sent' })
}
