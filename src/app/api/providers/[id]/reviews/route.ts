import { NextResponse, type NextRequest } from 'next/server'
import { coarsenPublicReviewCreatedAt } from '@/lib/providers/public'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

interface PublicProviderReviewRow {
  id: string
  rating: number
  comment: string | null
  created_at: string
}

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid pagination params' }, { status: 400 })

  const { page, limit } = parsed.data
  const from = (page - 1) * limit

  const supabase = await createClient()
  const { data: provider, error: providerError } = await supabase
    .from('providers')
    .select('id')
    .eq('id', id)
    .eq('active', true)
    .eq('verified', true)
    .maybeSingle()

  if (providerError) {
    return NextResponse.json({ error: 'Failed to fetch provider reviews' }, { status: 500 })
  }

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 })
  }

  const { data, error, count } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at', { count: 'exact' })
    .eq('provider_id', id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })

  const reviews = ((data ?? []) as PublicProviderReviewRow[]).map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment ?? null,
    created_at: coarsenPublicReviewCreatedAt(review.created_at),
  }))

  return NextResponse.json({ reviews, total: count ?? 0, page, limit })
}
