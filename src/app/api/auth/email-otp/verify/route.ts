import { NextResponse, type NextRequest } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { otpRatelimit } from '@/lib/upstash'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email =
    typeof body === 'object' && body && typeof (body as { email?: unknown }).email === 'string'
      ? (body as { email: string }).email.trim().toLowerCase()
      : null
  const code =
    typeof body === 'object' && body && typeof (body as { code?: unknown }).code === 'string'
      ? (body as { code: string }).code.trim()
      : null

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }
  if (!code || !/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: 'Enter the 6-digit code from your email' }, { status: 400 })
  }

  // Rate limit verify attempts to prevent brute-force of the 6-digit space
  const ip = getRequestIpAddress(request)
  try {
    if (ip) {
      const ipLimit = await otpRatelimit.limit(`email-otp-verify:ip:${ip}`)
      if (!ipLimit.success) {
        return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
      }
    }
    const emailLimit = await otpRatelimit.limit(`email-otp-verify:${email}`)
    if (!emailLimit.success) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 })
    }
  } catch {
    // Rate limiter unavailable — allow through
  }

  // Find a valid, unused, non-expired OTP
  const { data: otp, error: otpError } = await supabaseAdmin
    .from('email_otps')
    .select('id, user_id')
    .eq('email', email)
    .eq('code', code)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (otpError || !otp) {
    return NextResponse.json(
      { error: 'Invalid or expired code. Please check the code and try again.' },
      { status: 400 },
    )
  }

  // Mark the OTP as used immediately to prevent replay
  const { error: markError } = await supabaseAdmin
    .from('email_otps')
    .update({ used_at: new Date().toISOString() })
    .eq('id', otp.id)

  if (markError) {
    console.error('email_otps mark-used failed:', markError)
    // Non-fatal — continue to confirm the email
  }

  // Confirm the user's email in Supabase Auth
  const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(otp.user_id, {
    email_confirm: true,
  })

  if (confirmError) {
    console.error('email confirmation failed:', confirmError)
    return NextResponse.json(
      { error: 'Could not confirm your email. Please contact support.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true })
}
