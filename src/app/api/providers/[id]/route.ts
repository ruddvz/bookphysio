import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('providers')
    .select(`
      *,
      users!inner (full_name, avatar_url, phone),
      locations (*),
      provider_insurances (insurances (*)),
      reviews (id, rating, comment, patient_id, created_at, is_published)
    `)
    .eq('id', id)
    .eq('verified', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
