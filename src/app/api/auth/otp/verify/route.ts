import { NextResponse, type NextRequest } from 'next/server'
import { verifyOtp } from '@/lib/msg91'
import { otpVerifySchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = otpVerifySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phone, otp } = parsed.data
  const result = await verifyOtp(phone, otp)
  if (!result.success) return NextResponse.json({ error: result.error ?? 'Invalid OTP' }, { status: 400 })

  // Sign in with Supabase phone OTP
  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ user: data.user })
}
