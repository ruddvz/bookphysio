import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createReviewSchema } from '@/lib/validations/review'
import { reviewsRatelimit } from '@/lib/upstash'
import { z } from 'zod'

const listReviewsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(12).default(3),
})

function firstValue<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

export async function GET(request: NextRequest) {
  const parsed = listReviewsSchema.safeParse(Object.fromEntries(new URL(request.url).searchParams))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid review query' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      id,
      rating,
      comment,
      created_at,
      providers!inner (
        title,
        specialties (name),
        users!inner (full_name),
        active,
        verified
      )
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(parsed.data.limit)

  if (error) {
    return NextResponse.json({ error: 'Failed to load reviews' }, { status: 500 })
  }

  const reviews = (data ?? [])
    .map((review) => {
      const provider = firstValue(review.providers)
      const providerUser = firstValue(provider?.users)
      const primarySpecialty = firstValue(provider?.specialties)

      if (!provider || !providerUser || !provider.active || !provider.verified) {
        return null
      }

      return {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        created_at: new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }),
        provider: {
          full_name: providerUser.full_name,
          title: provider.title,
          specialty: primarySpecialty?.name ?? null,
        },
      }
    })
    .filter((review): review is NonNullable<typeof review> => review !== null)

  return NextResponse.json({ reviews })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const rateLimit = await reviewsRatelimit.limit(`reviews:${user.id}`)
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many review submissions. Please wait before trying again.' }, { status: 429 })
    }
  } catch {
    // Rate limiter unavailable — allow through
  }

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
