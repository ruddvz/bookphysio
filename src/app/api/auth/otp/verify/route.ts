import { NextResponse, type NextRequest } from 'next/server'
import { verifyOtp } from '@/lib/msg91'
import { otpVerifySchema } from '@/lib/validations/auth'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = otpVerifySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phone, otp } = parsed.data
  const { full_name } = body // Optional full name for signup

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
