import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

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
  const { data, error, count } = await supabase
    .from('reviews')
    .select('id, rating, comment, provider_reply, created_at, users!patient_id (full_name, avatar_url)', { count: 'exact' })
    .eq('provider_id', id)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(from, from + limit - 1)

  if (error) return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  return NextResponse.json({ reviews: data ?? [], total: count ?? 0, page, limit })
}
