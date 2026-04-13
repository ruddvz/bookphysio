import { NextResponse } from 'next/server'
import { hasPublicSupabaseEnv } from '@/lib/supabase/env'

/**
 * GET /api/reviews/recent — publicly cacheable feed of latest published reviews
 * for the homepage Testimonials section.
 */
export async function GET() {
  if (!hasPublicSupabaseEnv()) {
    return NextResponse.json({ reviews: [] }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  }

  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('id, rating, comment, created_at, providers (full_name)')
    .eq('is_published', true)
    .not('comment', 'is', null)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('[api/reviews/recent] Fetch error:', error)
    return NextResponse.json({ reviews: [] }, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    })
  }

  interface RecentReviewRow {
    id: string
    rating: number
    comment: string | null
    created_at: string
    providers: { full_name: string } | { full_name: string }[] | null
  }

  const reviews = ((data ?? []) as RecentReviewRow[]).map((r) => {
    const provider = Array.isArray(r.providers) ? r.providers[0] : r.providers
    return {
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      providerName: provider?.full_name ?? 'A physiotherapist',
      createdAt: r.created_at,
    }
  })

  return NextResponse.json({ reviews }, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200' },
  })
}
