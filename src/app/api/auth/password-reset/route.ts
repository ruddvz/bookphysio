import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { otpRatelimit } from '@/lib/upstash'
import { assertEmailServiceConfigured } from '@/lib/email/preflight'
import { findAuthUserIdByEmail } from '@/lib/auth/lookup-user'
import { createAndSendPasswordResetOtp } from '@/lib/auth/password-reset-otp'

const maskedResponse = { message: 'If an account exists, a code has been sent.' }

const resetSchema = z.object({
  email: z.string().email('Valid email is required'),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = resetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }
  const email = parsed.data.email.trim().toLowerCase()

  const ip = getRequestIpAddress(request)
  try {
    if (ip) {
      const ipLimit = await otpRatelimit.limit(`password-reset:ip:${ip}`)
      if (!ipLimit.success) {
        return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
      }
    }
    const emailLimit = await otpRatelimit.limit(`password-reset:${email}`)
    if (!emailLimit.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }
  } catch {
    // Rate limiter unavailable — allow through
  }

  const preflight = assertEmailServiceConfigured()
  if (!preflight.ok) {
    return NextResponse.json(
      { error: 'Email service is temporarily unavailable. Please try again in a few minutes.' },
      { status: 503 },
    )
  }

  const userId = await findAuthUserIdByEmail(email)
  if (!userId) {
    return NextResponse.json(maskedResponse)
  }

  const result = await createAndSendPasswordResetOtp(email, userId)
  if (!result.ok) {
    if (result.error === 'Email service not configured') {
      return NextResponse.json(
        { error: 'Email service is temporarily unavailable. Please try again in a few minutes.' },
        { status: 503 },
      )
    }
    return NextResponse.json({ error: result.error ?? 'Failed to send email. Please try again.' }, { status: 500 })
  }

  return NextResponse.json(maskedResponse)
}
