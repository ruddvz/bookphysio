import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { apiRatelimit } from '@/lib/upstash'
import { z } from 'zod'

const approveSchema = z.object({
  provider_id: z.string().uuid(),
  approved: z.boolean(),
})

const statusParam = z.enum(['pending', 'approved', 'rejected']).default('pending')

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

async function enforceAdminRateLimit(scope: string, adminId: string) {
  try {
    const rateLimit = await apiRatelimit.limit(`${scope}:${adminId}`)
    return rateLimit.success
  } catch {
    return true
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rateLimitOk = await enforceAdminRateLimit('admin-listings', admin.id)
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }

  const rawStatus = request.nextUrl.searchParams.get('status') ?? 'pending'
  const parsedStatus = statusParam.safeParse(rawStatus)
  if (!parsedStatus.success) {
    return NextResponse.json({ error: 'Invalid status parameter' }, { status: 400 })
  }
  const status = parsedStatus.data

  const { data } = await supabaseAdmin
    .from('providers')
    .select(`
      id,
      slug,
      title,
      experience_years,
      iap_registration_no,
      specialty_ids,
      consultation_fee_inr,
      verified,
      active,
      approval_status,
      onboarding_step,
      created_at,
      users!inner (full_name, phone)
    `)
    .eq('approval_status', status)
    .order('created_at')

  return NextResponse.json({ listings: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const admin = await requireAdmin(supabase)
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rateLimitOk = await enforceAdminRateLimit('admin-listings-update', admin.id)
  if (!rateLimitOk) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }

  const parsed = approveSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { provider_id, approved } = parsed.data
  const approvalStatus = approved ? 'approved' : 'rejected'

  const { error } = await supabaseAdmin
    .from('providers')
    .update({ verified: approved, active: approved, approval_status: approvalStatus })
    .eq('id', provider_id)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  if (approved) {
    const { error: userError } = await supabaseAdmin
      .from('users')
      .update({ role: 'provider' })
      .eq('id', provider_id)

    if (userError) {
      await supabaseAdmin
        .from('providers')
        .update({ verified: false, active: false, approval_status: 'pending' })
        .eq('id', provider_id)
      return NextResponse.json({ error: 'User role update failed' }, { status: 500 })
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(provider_id, {
      user_metadata: {
        provider_pending: false,
        role: 'provider',
      },
    })

    if (authError) {
      await Promise.allSettled([
        supabaseAdmin
          .from('providers')
          .update({ verified: false, active: false, approval_status: 'pending' })
          .eq('id', provider_id),
        supabaseAdmin
          .from('users')
          .update({ role: 'provider_pending' })
          .eq('id', provider_id),
      ])
      return NextResponse.json({ error: 'Auth role update failed' }, { status: 500 })
    }
  } else {
    // Rejection: revert user role to provider_pending so they remain in review state
    await supabaseAdmin
      .from('users')
      .update({ role: 'provider_pending' })
      .eq('id', provider_id)
      .catch((e: unknown) => console.error('[admin/listings] Role revert on rejection failed:', e))
  }

  return NextResponse.json({ success: true })
}
