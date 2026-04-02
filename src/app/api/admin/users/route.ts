export const dynamic = 'force-static'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { apiRatelimit } from '@/lib/upstash'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rateLimit = await apiRatelimit.limit(`admin-users:${admin.id}`)
  if (!rateLimit.success) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }

  const page = Number(new URL(request.url).searchParams.get('page') ?? '1')
  const limit = 50
  const from = (page - 1) * limit

  const { data, count } = await supabaseAdmin
    .from('users')
    .select('id, full_name, phone, role, created_at', { count: 'exact' })
    .range(from, from + limit - 1)
    .order('created_at', { ascending: false })

  return NextResponse.json({ users: data ?? [], total: count ?? 0, page, limit })
}
