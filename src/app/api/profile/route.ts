import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const updateSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, phone, role, avatar_url, created_at')
    .eq('id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  let icp_registration_no: string | null = null

  if (data.role === 'provider') {
    const { data: providerData } = await supabase
      .from('providers')
      .select('icp_registration_no')
      .eq('id', user.id)
      .maybeSingle()

    icp_registration_no = providerData?.icp_registration_no ?? null
  }

  return NextResponse.json({ ...data, email: user.email ?? null, icp_registration_no })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase
    .from('users')
    .update({ full_name: parsed.data.full_name })
    .eq('id', user.id)
    .select('id, full_name, phone, role, avatar_url, created_at')
    .single()

  if (error) return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })

  return NextResponse.json({ ...data, email: user.email ?? null })
}
