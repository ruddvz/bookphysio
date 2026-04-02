import { NextResponse, type NextRequest } from 'next/server'
import { verifyOtp } from '@/lib/msg91'
import { isDemoAccessEnabled } from '@/lib/demo/session'
import { otpVerifySchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/server'
import { otpRatelimit } from '@/lib/upstash'

const DEV_OTP = isDemoAccessEnabled() && process.env.DEV_ACCESS_CODE ? `${process.env.DEV_ACCESS_CODE}00` : null

async function resolveUserRole(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string | undefined,
  fallbackRole: string | undefined
) {
  if (!userId) {
    return fallbackRole ?? 'patient'
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  return profile?.role ?? fallbackRole ?? 'patient'
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = otpVerifySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phone, otp } = parsed.data
  const { full_name } = body // Optional full name for signup

  const ip = request.ip ?? request.headers.get('x-real-ip') ?? 'unknown'
  const sourceLimit = await otpRatelimit.limit(`otp-verify:ip:${ip}`)
  if (!sourceLimit.success) {
    return NextResponse.json({ error: 'Too many OTP attempts. Please wait and try again.' }, { status: 429 })
  }

  const rateLimitKey = `verify:${phone}`
  const { success } = await otpRatelimit.limit(rateLimitKey)
  if (!success) {
    return NextResponse.json({ error: 'Too many OTP attempts. Please wait and try again.' }, { status: 429 })
  }

  // Dev access bypass — code "264200" when DEV_ACCESS_CODE=2642 is set
  if (DEV_OTP && otp === DEV_OTP) {
    const { supabaseAdmin } = await import('@/lib/supabase/admin')

    // Find or create user by phone
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(u => u.phone === phone)

    if (existingUser) {
      // Generate a magic link session for existing user
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: existingUser.email ?? `${phone.replace('+', '')}@dev.bookphysio.in`,
      })
      if (sessionError) return NextResponse.json({ error: 'Unable to create session' }, { status: 500 })

      // Sign in via the server client to set cookies
      const supabase = await createClient()
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: sessionData.properties?.hashed_token ?? '',
        type: 'magiclink',
      })
      if (error) return NextResponse.json({ error: 'Unable to create session' }, { status: 500 })
      const role = await resolveUserRole(supabase, data.user?.id, existingUser.user_metadata?.role)
      return NextResponse.json({ user: data.user, session: data.session, role })
    }

    // Create new user with phone
    const devEmail = `${phone.replace('+', '')}@dev.bookphysio.in`
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      phone,
      email: devEmail,
      phone_confirm: true,
      email_confirm: true,
      user_metadata: { role: 'patient', full_name: full_name ?? 'Dev User', phone },
    })
    if (createError) return NextResponse.json({ error: 'Unable to create user' }, { status: 500 })

    // Generate session for the new user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: devEmail,
    })
    if (linkError) return NextResponse.json({ error: 'Unable to create session' }, { status: 500 })

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties?.hashed_token ?? '',
      type: 'magiclink',
    })
    if (error) return NextResponse.json({ error: 'Unable to create session' }, { status: 500 })
    const role = await resolveUserRole(supabase, data.user?.id ?? newUser.user?.id, newUser.user?.user_metadata?.role)
    return NextResponse.json({ user: data.user ?? newUser.user, session: data.session, role })
  }

  // Primary verification via MSG91
  const result = await verifyOtp(phone, otp)
  if (!result.success) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })

  // Bridging to Supabase session
  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: 'sms'
  })

  if (error) return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })

  // Update full name if provided (using admin to bypass RLS/protected field issues if any)
  if (full_name && data.user) {
    const { supabaseAdmin } = await import('@/lib/supabase/admin')
    await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
      user_metadata: { full_name }
    })
  }

  const role = await resolveUserRole(supabase, data.user?.id, data.user?.user_metadata?.role)

  return NextResponse.json({ user: data.user, session: data.session, role })
}
