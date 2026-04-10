import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  })

  if (updateError) {
    return NextResponse.json({ error: 'Failed to save login credentials' }, { status: 500 })
  }

  // Mirror email to public users table
  await supabaseAdmin
    .from('users')
    .update({ email: parsed.data.email })
    .eq('id', user.id)

  return NextResponse.json({ success: true })
}
