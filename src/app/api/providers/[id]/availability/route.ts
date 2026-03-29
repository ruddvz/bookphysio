import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const querySchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('availabilities')
    .select('id, starts_at, ends_at, slot_duration_mins, location_id')
    .eq('provider_id', id)
    .eq('is_booked', false)
    .eq('is_blocked', false)
    .gte('starts_at', parsed.data.from)
    .lte('starts_at', parsed.data.to)
    .order('starts_at')

  if (error) return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  return NextResponse.json({ slots: data ?? [] })
}
