import { NextResponse, type NextRequest } from 'next/server'
import { getRequestIpAddress } from '@/lib/server/runtime'
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
  const ip = getRequestIpAddress(request)
  if (ip) {
    const sourceLimit = await otpRatelimit.limit(`otp-send:ip:${ip}`)
    if (!sourceLimit.success) return NextResponse.json({ error: 'Too many OTP requests. Try again in 10 minutes.' }, { status: 429 })
  }

  const { success } = await otpRatelimit.limit(`send:${phone}`)
  if (!success) return NextResponse.json({ error: 'Too many OTP requests. Try again in 10 minutes.' }, { status: 429 })

  // Initialize Supabase OTP session
  const supabase = await createClient()
  const { error: supabaseError } = await supabase.auth.signInWithOtp({ phone })
  if (supabaseError) {
    console.error('Supabase OTP Error:', supabaseError)
    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'OTP sent' })
}
