import { NextResponse, type NextRequest } from 'next/server'
import { verifyOtp } from '@/lib/msg91'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { otpVerifySchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/server'
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

  const { phone, otp, full_name } = parsed.data

  const ip = getRequestIpAddress(request)
  if (ip) {
    const sourceLimit = await otpRatelimit.limit(`otp-verify:ip:${ip}`)
    if (!sourceLimit.success) {
      return NextResponse.json({ error: 'Too many OTP attempts. Please wait and try again.' }, { status: 429 })
    }
  }

  const rateLimitKey = `verify:${phone}`
  const { success } = await otpRatelimit.limit(rateLimitKey)
  if (!success) {
    return NextResponse.json({ error: 'Too many OTP attempts. Please wait and try again.' }, { status: 429 })
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

  const role = await resolveUserRole(supabase, data.user?.id)

  return NextResponse.json({ user: data.user, session: data.session, role })
}
