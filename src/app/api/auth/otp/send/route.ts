import { NextResponse, type NextRequest } from 'next/server'
import { sendOtp } from '@/lib/msg91'
import { otpSendSchema } from '@/lib/validations/auth'
import { otpRatelimit } from '@/lib/upstash'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = otpSendSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phone } = parsed.data
  const ip = request.ip ?? request.headers.get('x-real-ip') ?? 'unknown'
  const sourceLimit = await otpRatelimit.limit(`otp-send:ip:${ip}`)
  if (!sourceLimit.success) return NextResponse.json({ error: 'Too many OTP requests. Try again in 10 minutes.' }, { status: 429 })

  const { success } = await otpRatelimit.limit(`send:${phone}`)
  if (!success) return NextResponse.json({ error: 'Too many OTP requests. Try again in 10 minutes.' }, { status: 429 })

  // Dev access bypass — skip MSG91 + Supabase OTP when DEV_ACCESS_CODE is set
  if (process.env.DEV_ACCESS_CODE) {
    console.log('DEV_ACCESS_CODE active, skipping SMS send for:', phone)
    return NextResponse.json({ message: 'OTP sent (Bypassed via Dev Code)' })
  }

  // Initialize Supabase OTP session (this won't send SMS if we handle delivery,
  // or it might send one depending on Supabase dashboard settings.
  // But strictly, we want Supabase to know an OTP is expected for this phone)
  const supabase = await createClient()
  const { error: supabaseError } = await supabase.auth.signInWithOtp({ phone })
  if (supabaseError) {
    console.error('Supabase OTP Error:', supabaseError)
    return NextResponse.json({ error: 'Failed to prepare OTP: ' + supabaseError.message }, { status: 500 })
  }

  // Delivery via MSG91
  const result = await sendOtp(phone)
  if (!result.success) {
    console.error('MSG91 Error:', result)
    return NextResponse.json({ error: 'Failed to send OTP via SMS provider' }, { status: 500 })
  }

  return NextResponse.json({ message: 'OTP sent' })
}
