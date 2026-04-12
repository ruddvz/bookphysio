import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/auth'
import { sanitizeReturnPath, resolvePostAuthRedirect } from '@/lib/demo/session'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { otpRatelimit } from '@/lib/upstash'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  // Rate-limit by IP and by email to prevent brute-force attacks
  try {
    const ip = getRequestIpAddress(request)
    if (ip) {
      const ipLimit = await otpRatelimit.limit(`login:ip:${ip}`)
      if (!ipLimit.success) {
        return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 })
      }
    }
    const emailLimit = await otpRatelimit.limit(`login:email:${parsed.data.email.toLowerCase()}`)
    if (!emailLimit.success) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 })
    }
  } catch {
    // Rate limiter unavailable — allow through
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user) {
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 })
  }

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  if (profileError) {
    console.error('[login] Failed to fetch user profile:', profileError)
  }

  const role = profile?.role ?? 'patient'
  const returnTo = sanitizeReturnPath(typeof body.return_to === 'string' ? body.return_to : null)

  return NextResponse.json({
    role,
    redirectTo: resolvePostAuthRedirect(role, returnTo),
  })
}
