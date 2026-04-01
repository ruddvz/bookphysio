import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { signupPatientSchema, signupProviderSchema } from '@/lib/validations/auth'
import { otpRatelimit } from '@/lib/upstash'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const role = body.role === 'provider' ? 'provider' : 'patient'
  const schema = role === 'provider' ? signupProviderSchema : signupPatientSchema
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const ip = request.ip ?? request.headers.get('x-real-ip') ?? 'unknown'
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

  return NextResponse.json({ user: data.user }, { status: 201 })
}
