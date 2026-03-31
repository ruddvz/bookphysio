import { NextResponse, type NextRequest } from 'next/server'
import { verifyOtp } from '@/lib/msg91'
import { otpVerifySchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/server'

const DEV_OTP = process.env.DEV_ACCESS_CODE ? `${process.env.DEV_ACCESS_CODE}00` : null

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = otpVerifySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phone, otp } = parsed.data
  const { full_name } = body // Optional full name for signup

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
      if (sessionError) return NextResponse.json({ error: sessionError.message }, { status: 500 })

      // Sign in via the server client to set cookies
      const supabase = await createClient()
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: sessionData.properties?.hashed_token ?? '',
        type: 'magiclink',
      })
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ user: data.user, session: data.session })
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
    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })

    // Generate session for the new user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: devEmail,
    })
    if (linkError) return NextResponse.json({ error: linkError.message }, { status: 500 })

    const supabase = await createClient()
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: linkData.properties?.hashed_token ?? '',
      type: 'magiclink',
    })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ user: data.user ?? newUser.user, session: data.session })
  }

  // Primary verification via MSG91
  const result = await verifyOtp(phone, otp)
  if (!result.success) return NextResponse.json({ error: result.error ?? 'Invalid OTP' }, { status: 400 })

  // Bridging to Supabase session
  const supabase = await createClient()
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token: otp,
    type: 'sms'
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  // Update full name if provided (using admin to bypass RLS/protected field issues if any)
  if (full_name && data.user) {
    const { supabaseAdmin } = await import('@/lib/supabase/admin')
    await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
      user_metadata: { full_name }
    })
  }

  return NextResponse.json({ user: data.user, session: data.session })
}
