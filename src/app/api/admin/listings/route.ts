import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'
import { sendProviderApproved } from '@/lib/resend'

const approveSchema = z.object({
  provider_id: z.string().uuid(),
  approved: z.boolean(),
})

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
  return data?.role === 'admin' ? user : null
}

export async function GET() {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data } = await supabaseAdmin
    .from('providers')
    .select('*, users!inner (full_name, phone), documents (*)')
    .eq('verified', false)
    .order('created_at')

  return NextResponse.json({ listings: data ?? [] })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  if (!await requireAdmin(supabase)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const parsed = approveSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const { provider_id, approved } = parsed.data
  const { error } = await supabaseAdmin
    .from('providers')
    .update({ verified: approved, active: approved })
    .eq('id', provider_id)

  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

  // Send provider-approved email when approving (best-effort)
  if (approved) {
    try {
      const { data: providerRecord } = await supabaseAdmin
        .from('providers')
        .select('users!inner (full_name, email)')
        .eq('id', provider_id)
        .single()

      const user = providerRecord?.users as unknown as { full_name: string; email: string } | null
      if (user?.email) {
        await sendProviderApproved(user.email, { providerName: user.full_name })
      }
    } catch (emailError) {
      console.error('[api/admin/listings] Provider approved email failed (non-fatal):', emailError)
    }
  }

  return NextResponse.json({ success: true })
}
