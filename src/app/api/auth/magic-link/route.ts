import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeReturnPath } from '@/lib/demo/session'
import { buildConfiguredAppUrl, getRequestIpAddress } from '@/lib/server/runtime'
import { otpRatelimit } from '@/lib/upstash'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const email = typeof body === 'object' && body && typeof (body as { email?: unknown }).email === 'string'
    ? (body as { email: string }).email.trim()
    : null
  const requestedReturn = typeof body === 'object' && body ? (body as { returnTo?: unknown }).returnTo : null
  const returnTo = typeof requestedReturn === 'string' ? sanitizeReturnPath(requestedReturn) : null

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
  }

  const ip = getRequestIpAddress(request)
  if (ip) {
    const sourceLimit = await otpRatelimit.limit(`magic-link:ip:${ip}`)
    if (!sourceLimit.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }
  }

  const rateLimitKey = `magic-link:${email.toLowerCase()}`
  const { success } = await otpRatelimit.limit(rateLimitKey)
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
  }

  const supabase = await createClient()
  const callbackUrl = buildConfiguredAppUrl('/auth/callback')

  if (!callbackUrl) {
    return NextResponse.json({ error: 'Magic link is not configured' }, { status: 500 })
  }

  if (returnTo) {
    callbackUrl.searchParams.set('next', returnTo)
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // shouldCreateUser: true allows new users to sign up via magic link
      shouldCreateUser: true,
      emailRedirectTo: callbackUrl.toString(),
    },
  })

  if (error) {
    console.error('Magic link error:', error)
    return NextResponse.json({ error: 'Unable to send magic link' }, { status: 400 })
  }

  return NextResponse.json({ message: 'Magic link sent' })
}
