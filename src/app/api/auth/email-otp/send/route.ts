import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { otpRatelimit } from '@/lib/upstash'
import { createAndSendEmailOtp } from '@/lib/auth/email-otp'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email =
    typeof body === 'object' && body && typeof (body as { email?: unknown }).email === 'string'
      ? (body as { email: string }).email.trim().toLowerCase()
      : null

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const ip = getRequestIpAddress(request)
  try {
    if (ip) {
      const ipLimit = await otpRatelimit.limit(`email-otp-send:ip:${ip}`)
      if (!ipLimit.success) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
      }
    }
    const emailLimit = await otpRatelimit.limit(`email-otp-send:${email}`)
    if (!emailLimit.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }
  } catch {
    // Rate limiter unavailable — allow through
  }

  // Look up the user_id from the most recent OTP entry for this email.
  // This is safe because onboard-signup always creates an OTP before Step 5 is shown.
  const { data: existingOtp } = await supabaseAdmin
    .from('email_otps')
    .select('user_id')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!existingOtp?.user_id) {
    // Mask: don't reveal whether the account exists
    return NextResponse.json({ message: 'If an account exists, a verification code has been sent.' })
  }

  const result = await createAndSendEmailOtp(email, existingOtp.user_id)

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Failed to send code' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Verification code sent.' })
}
