import { NextResponse, type NextRequest } from 'next/server'
import { getRequestIpAddress } from '@/lib/server/runtime'
import {
  createPendingOtpCookieValue,
  getPendingOtpFromCookies,
  setPendingOtpCookie,
} from '@/lib/auth/pending-otp-cookie'
import { buildPhoneRateLimitKey } from '@/lib/auth/otp-rate-limit'
import { otpSendSchema } from '@/lib/validations/auth'
import { otpRatelimit } from '@/lib/upstash'
import { createClient } from '@/lib/supabase/server'
import { getDevPhoneRole } from '@/lib/auth/dev-otp'
import { sanitizeReturnPath } from '@/lib/demo/session'
import { hasPublicSupabaseEnv } from '@/lib/supabase/env'

const maskedLoginOtpResponse = { message: 'If an account exists, an OTP has been sent.' }

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const hasExplicitTarget = Object.prototype.hasOwnProperty.call(body, 'phone') || Object.prototype.hasOwnProperty.call(body, 'flow')

  let phone: string
  let flow: 'login' | 'signup' | 'provider_signup'
  let flowId: string | undefined
  let fullName: string | undefined
  let returnTo: string | null = null

  if (hasExplicitTarget) {
    const parsed = otpSendSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

    phone = parsed.data.phone
    flow = parsed.data.flow
    flowId = typeof body.flow_id === 'string' ? body.flow_id : crypto.randomUUID()
    fullName = typeof body.full_name === 'string' ? body.full_name.trim() : undefined
    returnTo = typeof body.return_to === 'string' ? sanitizeReturnPath(body.return_to) : null

    if (flow !== 'signup') {
      fullName = undefined
    }

    if (fullName && (fullName.length < 2 || fullName.length > 100)) {
      return NextResponse.json({ error: 'Name must be between 2 and 100 characters.' }, { status: 400 })
    }
  } else {
    const pendingOtp = await getPendingOtpFromCookies(request.cookies)

    if (!pendingOtp) {
      return NextResponse.json({ error: 'Your verification session expired. Please request a fresh OTP.' }, { status: 400 })
    }

    phone = pendingOtp.phone
    flow = pendingOtp.flow
    flowId = typeof body.flow_id === 'string' ? body.flow_id : pendingOtp.flowId
    fullName = pendingOtp.fullName
    returnTo = pendingOtp.returnTo ?? null

    if (flowId && pendingOtp.flowId && flowId !== pendingOtp.flowId) {
      return NextResponse.json({ error: 'Your verification session expired. Please request a fresh OTP.' }, { status: 400 })
    }
  }

  // Dev OTP bypass — must run before cookie creation and rate limiting (see docs/DEV-ACCESS.md)
  if (getDevPhoneRole(phone)) {
    const pendingOtpCookieDev = await createPendingOtpCookieValue({ phone, flow, flowId, fullName, returnTo })
    const response = NextResponse.json({ message: 'OTP sent', flowId })
    if (pendingOtpCookieDev) setPendingOtpCookie(response, pendingOtpCookieDev)
    return response
  }

  const pendingOtpCookie = await createPendingOtpCookieValue({ phone, flow, flowId, fullName, returnTo })
  if (!pendingOtpCookie) {
    return NextResponse.json({ error: 'OTP configuration is unavailable. Please try again later.' }, { status: 503 })
  }

  const ip = getRequestIpAddress(request)
  try {
    if (ip) {
      const sourceLimit = await otpRatelimit.limit(`otp-send:ip:${ip}`)
      if (!sourceLimit.success) return NextResponse.json({ error: 'Too many OTP requests. Try again in 10 minutes.' }, { status: 429 })
    }
    const { success } = await otpRatelimit.limit(await buildPhoneRateLimitKey('send', phone))
    if (!success) return NextResponse.json({ error: 'Too many OTP requests. Try again in 10 minutes.' }, { status: 429 })
  } catch {
    // Rate limiter unavailable (e.g. no Upstash in dev) — allow through
  }

  if (!hasPublicSupabaseEnv()) {
    return NextResponse.json(
      { error: 'Phone verification is temporarily unavailable. Please try again later.' },
      { status: 503 },
    )
  }

  // Initialize Supabase OTP session
  const supabase = await createClient()
  const { error: supabaseError } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser: flow === 'signup' || flow === 'provider_signup',
    },
  })
  if (supabaseError) {
    console.error('Supabase OTP Error:', supabaseError)

    if (flow === 'login') {
      const response = NextResponse.json({ ...maskedLoginOtpResponse, flowId })
      setPendingOtpCookie(response, pendingOtpCookie)
      return response
    }

    return NextResponse.json({ error: 'Failed to send OTP. Please try again.' }, { status: 500 })
  }

  const response = NextResponse.json(flow === 'login'
    ? { ...maskedLoginOtpResponse, flowId }
    : { message: 'OTP sent', flowId })
  setPendingOtpCookie(response, pendingOtpCookie)

  if (flow === 'login') {
    return response
  }

  return response
}
