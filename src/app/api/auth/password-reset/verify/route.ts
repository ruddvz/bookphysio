import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { otpRatelimit } from '@/lib/upstash'
import { verifyPasswordResetOtp } from '@/lib/auth/password-reset-otp'
import { loginSchema } from '@/lib/validations/auth'

const verifySchema = z.object({
  email: z.string().email('Valid email is required'),
  code: z.string().length(6, 'Code must be 6 digits').regex(/^\d{6}$/, 'Code must be 6 digits'),
  newPassword: loginSchema.shape.password,
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = verifySchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Invalid input'
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const { email, code, newPassword } = parsed.data
  const normalizedEmail = email.trim().toLowerCase()

  const ip = getRequestIpAddress(request)
  try {
    if (ip) {
      const ipLimit = await otpRatelimit.limit(`password-reset-verify:ip:${ip}`)
      if (!ipLimit.success) {
        return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
      }
    }
    const emailLimit = await otpRatelimit.limit(`password-reset-verify:${normalizedEmail}`)
    if (!emailLimit.success) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }
  } catch {
    // Rate limiter unavailable
  }

  const verified = await verifyPasswordResetOtp(normalizedEmail, code)
  if (!verified.ok) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  }

  // Owning the inbox proves email — mark confirmed so provider_pending can proceed without a second OTP.
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(verified.userId, {
    password: newPassword,
    email_confirm: true,
  })

  if (updateError) {
    console.error('[password-reset/verify] updateUserById failed:', updateError)
    return NextResponse.json({ error: 'Unable to update password. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true, email: normalizedEmail })
}
