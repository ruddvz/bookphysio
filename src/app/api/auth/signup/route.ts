import { NextResponse, type NextRequest } from 'next/server'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { otpRatelimit } from '@/lib/upstash'
import { z } from 'zod'

const emailSignupSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^\+91[6-9]\d{9}$/, 'Enter a valid Indian mobile number (+91XXXXXXXXXX)').optional(),
})

function isAlreadyRegisteredAuthError(message: string | undefined) {
  const normalized = message?.toLowerCase() ?? ''
  return normalized.includes('already registered') || normalized.includes('already been registered')
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = emailSignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const ip = getRequestIpAddress(request)
  try {
    if (ip) {
      const ipLimit = await otpRatelimit.limit(`signup:ip:${ip}`)
      if (!ipLimit.success) {
        return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 })
      }
    }

    const emailLimit = await otpRatelimit.limit(`signup:email:${parsed.data.email.toLowerCase()}`)
    if (!emailLimit.success) {
      return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 })
    }
  } catch {
    // Rate limiter unavailable (e.g. no Upstash in dev) — allow through
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        phone: parsed.data.phone,
        role: 'patient',
      },
    },
  })

  if (error) {
    if (isAlreadyRegisteredAuthError(error.message)) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Please sign in instead.' },
        { status: 409 },
      )
    }

    return NextResponse.json({ error: 'Unable to create account. Please try again.' }, { status: 400 })
  }

  // signUp() with an already-confirmed email returns a user with empty identities
  if (!data.user || (data.user.identities?.length === 0)) {
    return NextResponse.json(
      { error: 'An account with this email already exists. Please sign in instead.' },
      { status: 409 },
    )
  }

  // The handle_new_user trigger creates the users row but sets phone from
  // auth.users.phone which is NULL for email-based signups. Store the phone
  // from the form data in the users table via admin client.
  if (parsed.data.phone && data.user.id) {
    await supabaseAdmin
      .from('users')
      .update({ phone: parsed.data.phone })
      .eq('id', data.user.id)
      .then(({ error: phoneErr }) => {
        if (phoneErr) console.error('Failed to store phone in users table:', phoneErr)
      })
  }

  return NextResponse.json({
    user: { id: data.user?.id, email: data.user?.email },
  }, { status: 201 })
}
