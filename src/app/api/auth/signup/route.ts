import { NextResponse, type NextRequest } from 'next/server'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { createClient } from '@/lib/supabase/server'
import { signupPatientSchema, signupProviderSchema } from '@/lib/validations/auth'
import { otpRatelimit } from '@/lib/upstash'
import { sendWelcomePatient, sendWelcomeProvider } from '@/lib/resend'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const role = body.role === 'provider' ? 'provider' : 'patient'
  const schema = role === 'provider' ? signupProviderSchema : signupPatientSchema
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const ip = getRequestIpAddress(request) ?? 'unknown'
  const sourceLimit = await otpRatelimit.limit(`signup:ip:${ip}`)
  if (!sourceLimit.success) return NextResponse.json({ error: 'Too many signup attempts' }, { status: 429 })

  const rateLimitKey = `signup:${parsed.data.phone.trim().toLowerCase()}`
  const { success } = await otpRatelimit.limit(rateLimitKey)
  if (!success) return NextResponse.json({ error: 'Too many signup attempts' }, { status: 429 })

  const supabase = await createClient()
  const { email, password, full_name, phone, ...meta } = parsed.data as {
    email: string; password: string; full_name: string; phone: string; [key: string]: unknown
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    phone,
    options: {
      data: { role, full_name, phone, ...meta },
    },
  })

  if (error) return NextResponse.json({ error: 'Unable to complete signup' }, { status: 400 })

  // Send welcome email (best-effort — do not fail signup on email error)
  if (data.user?.email && full_name) {
    try {
      if (role === 'provider') {
        await sendWelcomeProvider(data.user.email, { providerName: full_name })
      } else {
        await sendWelcomePatient(data.user.email, { patientName: full_name })
      }
    } catch (emailError) {
      console.error('[api/auth/signup] Welcome email failed (non-fatal):', emailError)
    }
  }

  return NextResponse.json({
    user: { id: data.user?.id, email: data.user?.email, phone: data.user?.phone },
  }, { status: 201 })
}
