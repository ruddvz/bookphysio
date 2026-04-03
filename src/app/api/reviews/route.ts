import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createReviewSchema } from '@/lib/validations/review'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const parsed = createReviewSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { appointment_id, rating, comment } = parsed.data
  const { supabaseAdmin } = await import('@/lib/supabase/admin')

  // Verify appointment belongs to this patient and is completed
  const { data: appt } = await supabaseAdmin
    .from('appointments')
    .select('id, patient_id, provider_id, status')
    .eq('id', appointment_id)
    .eq('patient_id', user.id)
    .eq('status', 'completed')
    .single()

  if (!appt) return NextResponse.json({ error: 'Appointment not found or not completed' }, { status: 404 })

  const { data, error } = await supabaseAdmin
    .from('reviews')
    .insert({ appointment_id, patient_id: user.id, provider_id: appt.provider_id, rating, comment: comment ?? null })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') return NextResponse.json({ error: 'Review already submitted' }, { status: 409 })
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
