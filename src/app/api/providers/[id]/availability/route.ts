import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { apiRatelimit } from '@/lib/upstash'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { z } from 'zod'

const querySchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
  visit_type: z.enum(['in_clinic', 'home_visit', 'online']).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const parsed = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })

  const ip = getRequestIpAddress(request)
  if (ip) {
    try {
      const rateLimit = await apiRatelimit.limit(`provider-availability:${ip}`)
      if (!rateLimit.success) {
        return NextResponse.json({ error: 'Too many availability requests. Please try again shortly.' }, { status: 429 })
      }
    } catch (error) {
      console.error('[api/providers/[id]/availability] Rate-limit check degraded:', error)
    }
  }

  const supabase = await createClient()
  const effectiveFrom = new Date(
    Math.max(Date.parse(parsed.data.from), Date.now()),
  ).toISOString()
  let locationIds: string[] | null = null

  if (parsed.data.visit_type) {
    const { data: locations, error: locationError } = await supabase
      .from('locations')
      .select('id')
      .eq('provider_id', id)
      .contains('visit_type', [parsed.data.visit_type])

    if (locationError) {
      return NextResponse.json({ error: 'Failed to resolve slot locations' }, { status: 500 })
    }

    locationIds = (locations ?? []).map((location) => location.id)

    if (locationIds.length === 0) {
      return NextResponse.json({ slots: [] })
    }
  }

  let query = supabase
    .from('availabilities')
    .select('id, starts_at, ends_at, slot_duration_mins, location_id')
    .eq('provider_id', id)
    .eq('is_booked', false)
    .eq('is_blocked', false)
    .gte('starts_at', effectiveFrom)
    .lte('starts_at', parsed.data.to)

  if (locationIds) {
    query = query.in('location_id', locationIds)
  }

  const { data, error } = await query.order('starts_at')

  if (error) return NextResponse.json({ error: 'Failed to fetch slots' }, { status: 500 })
  return NextResponse.json({ slots: data ?? [] })
}
