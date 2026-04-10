import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { loginSchema } from '@/lib/validations/auth'
import { sanitizeReturnPath, resolvePostAuthRedirect } from '@/lib/demo/session'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error || !data.user) {
    return NextResponse.json({ error: 'Incorrect email or password' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const role = profile?.role ?? 'patient'
  const returnTo = sanitizeReturnPath(typeof body.return_to === 'string' ? body.return_to : null)

  return NextResponse.json({
    role,
    redirectTo: resolvePostAuthRedirect(role, returnTo),
  })
}
