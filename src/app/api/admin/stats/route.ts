import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify admin role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Fetch counts
  const [
    { count: providersCount },
    { count: pendingCount },
    { count: patientsCount },
    { data: appointments }
  ] = await Promise.all([
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('verified', true),
    supabase.from('providers').select('*', { count: 'exact', head: true }).eq('verified', false),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'patient'),
    supabase.from('appointments').select('fee_inr, status').eq('status', 'completed')
  ])

  const gmv = appointments?.reduce((acc, curr) => acc + (curr.fee_inr || 0), 0) ?? 0

  return NextResponse.json({
    activeProviders: providersCount ?? 0,
    pendingApprovals: pendingCount ?? 0,
    totalPatients: patientsCount ?? 0,
    gmvMtd: gmv
  })
}
