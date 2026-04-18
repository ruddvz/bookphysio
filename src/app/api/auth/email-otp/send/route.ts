import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { otpRatelimit } from '@/lib/upstash'
import { createAndSendEmailOtp } from '@/lib/auth/email-otp'

const sendSchema = z.object({
  email: z.string().email('Valid email is required'),
})

const maskedResponse = { message: 'If an account exists, a verification code has been sent.' }

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = sendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }
  const email = parsed.data.email.trim().toLowerCase()

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

  // Resolve user_id from auth.users directly so resend works even if the
  // original email_otps row was cleaned up after a Resend delivery failure.
  const { data: userId, error: lookupError } = await supabaseAdmin
    .rpc('get_user_id_by_email', { p_email: email })

  if (lookupError || !userId) {
    // Mask: don't reveal whether the account exists
    return NextResponse.json(maskedResponse)
  }

  const result = await createAndSendEmailOtp(email, userId as string)

  if (!result.ok) {
    return NextResponse.json({ error: result.error ?? 'Failed to send code' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Verification code sent.' })
}
