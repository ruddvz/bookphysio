import { NextResponse, type NextRequest } from 'next/server'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { clearPendingOtpCookie, getPendingOtpFromRequest } from '@/lib/auth/pending-otp-cookie'
import { buildPhoneRateLimitKey } from '@/lib/auth/otp-rate-limit'
import { otpVerifySchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/server'
import { resolvePostAuthRedirect } from '@/lib/demo/session'
import { otpRatelimit } from '@/lib/upstash'

async function resolveUserRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string | undefined,
) {
  if (!userId) {
    return 'patient'
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role ?? 'patient'
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = otpVerifySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { otp, full_name } = parsed.data
  const pendingOtp = await getPendingOtpFromRequest(request)
  const flowId = typeof body.flow_id === 'string' ? body.flow_id : null

  if (!pendingOtp) {
    return NextResponse.json({ error: 'Your verification session expired. Please request a fresh OTP.' }, { status: 400 })
  }

  if (flowId && pendingOtp.flowId && flowId !== pendingOtp.flowId) {
    return NextResponse.json({ error: 'Your verification session expired. Please request a fresh OTP.' }, { status: 400 })
  }

  const { phone } = pendingOtp

  const ip = getRequestIpAddress(request)
  if (ip) {
    const sourceLimit = await otpRatelimit.limit(`otp-verify:ip:${ip}`)
    if (!sourceLimit.success) {
      return NextResponse.json({ error: 'Too many OTP attempts. Please wait and try again.' }, { status: 429 })
    }
  }

  const rateLimitKey = await buildPhoneRateLimitKey('verify', phone)
  const { success } = await otpRatelimit.limit(rateLimitKey)
  if (!success) {
    return NextResponse.json({ error: 'Too many OTP attempts. Please wait and try again.' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: 'sms'
  })

  if (error) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })

  // Update full name if provided (using admin to bypass RLS/protected field issues if any)
  const resolvedFullName = full_name ?? pendingOtp.fullName

  if (resolvedFullName && data.user) {
    const { supabaseAdmin } = await import('@/lib/supabase/admin')
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
      user_metadata: { full_name: resolvedFullName }
    })

    if (authUpdateError) {
      console.error('OTP profile metadata update error:', authUpdateError)
    }

    const { error: userProfileError } = await supabaseAdmin
      .from('users')
      .update({ full_name: resolvedFullName })
      .eq('id', data.user.id)

    if (userProfileError) {
      console.error('OTP user profile update error:', userProfileError)
    }
  }

  const role = await resolveUserRole(supabase, data.user?.id)
  const resolvedRole = pendingOtp.flow === 'signup' ? 'patient' : role
  const response = NextResponse.json({
    role: resolvedRole,
    redirectTo: resolvePostAuthRedirect(resolvedRole, pendingOtp.returnTo),
  })

  if (pendingOtp.flow !== 'provider_signup') {
    clearPendingOtpCookie(response)
  }

  return response
}
