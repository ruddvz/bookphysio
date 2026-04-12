import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import {
  buildAvailabilitySlotsInIndia,
  DEFAULT_PROVIDER_SCHEDULE,
  getProviderAvailabilityWindow,
  type ProviderScheduleLike,
  validateProviderSchedule,
} from '@/lib/provider-availability'
import { parseIndiaDate } from '@/lib/india-date'
import { getDemoSessionFromCookies } from '@/lib/demo/session'
import {
  getProviderAvailabilityRewriteLockKey,
  redis,
  refreshRedisLockIfOwned,
  releaseRedisLockIfOwned,
} from '@/lib/upstash'

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)

const dayConfigSchema = z.object({
  enabled: z.boolean(),
  start: timeSchema,
  end: timeSchema,
})

const multiSlotDayConfigSchema = z.object({
  enabled: z.boolean(),
  slots: z.array(z.object({
    start: timeSchema,
    end: timeSchema,
  })),
})

const scheduleSchema = z.object({
  Monday: z.union([dayConfigSchema, multiSlotDayConfigSchema]),
  Tuesday: z.union([dayConfigSchema, multiSlotDayConfigSchema]),
  Wednesday: z.union([dayConfigSchema, multiSlotDayConfigSchema]),
  Thursday: z.union([dayConfigSchema, multiSlotDayConfigSchema]),
  Friday: z.union([dayConfigSchema, multiSlotDayConfigSchema]),
  Saturday: z.union([dayConfigSchema, multiSlotDayConfigSchema]),
  Sunday: z.union([dayConfigSchema, multiSlotDayConfigSchema]),
})

const saveSchema = z.object({
  schedule: scheduleSchema,
  duration: z.number().int().min(15).max(120),
  weeks: z.number().int().min(1).max(8).optional().default(4),
})

const DEFAULT_BUFFER_MINS = 5
const MAX_GENERATED_SLOTS = 2000
const REWRITE_LOCK_TTL_SECONDS = 5 * 60
const INSERT_BATCH_SIZE = 500
const EXACT_DELETE_BATCH_SIZE = 25
const NO_STORE_HEADERS = { 'Cache-Control': 'no-store' }

type AvailabilityMutationClient = Pick<Awaited<ReturnType<typeof createClient>>, 'from'>

type OpenAvailabilitySlot = {
  provider_id: string
  location_id: string | null
  starts_at: string
  ends_at: string
  slot_duration_mins: number
  buffer_mins: number
  is_booked: boolean
  is_blocked: boolean
}

type SlotRange = {
  starts_at: string
  ends_at: string
}

function overlaps(startA: string, endA: string, startB: string, endB: string) {
  return Date.parse(startA) < Date.parse(endB) && Date.parse(endA) > Date.parse(startB)
}

async function releaseRewriteLock(lockKey: string, lockToken: string) {
  try {
    await releaseRedisLockIfOwned(lockKey, lockToken)
  } catch (error) {
    console.error('[api/provider/availability] Failed to release rewrite lock:', error)
  }
}

async function refreshRewriteLock(lockKey: string, lockToken: string) {
  const refreshed = await refreshRedisLockIfOwned(lockKey, lockToken, REWRITE_LOCK_TTL_SECONDS)

  if (!refreshed) {
    throw new Error('Provider availability rewrite lock was lost before the update completed.')
  }
}

function buildSlotIdentityKey(slot: Pick<OpenAvailabilitySlot, 'location_id' | 'starts_at' | 'ends_at' | 'slot_duration_mins' | 'buffer_mins'>): string {
  return [
    slot.location_id ?? 'none',
    slot.starts_at,
    slot.ends_at,
    String(slot.slot_duration_mins),
    String(slot.buffer_mins),
  ].join('|')
}

function excludeProtectedSlots<T extends SlotRange>(slots: T[], protectedSlots: SlotRange[]) {
  return slots.filter((slot) =>
    !protectedSlots.some((protectedSlot) =>
      overlaps(slot.starts_at, slot.ends_at, protectedSlot.starts_at, protectedSlot.ends_at)
    )
  )
}

async function fetchProtectedSlotsInRange(
  supabase: Awaited<ReturnType<typeof createClient>>,
  providerId: string,
  rangeStartIso: string,
  rangeEndExclusiveIso: string,
) {
  return supabase
    .from('availabilities')
    .select('starts_at, ends_at')
    .eq('provider_id', providerId)
    .lt('starts_at', rangeEndExclusiveIso)
    .gt('ends_at', rangeStartIso)
    .or('is_booked.eq.true,is_blocked.eq.true')
}

async function deleteExactOpenSlots(
  supabase: AvailabilityMutationClient,
  slots: Array<Pick<OpenAvailabilitySlot, 'provider_id' | 'location_id' | 'starts_at' | 'ends_at' | 'slot_duration_mins' | 'buffer_mins'>>,
  lockKey: string,
  lockToken: string,
) {
  const deletedSlots: typeof slots = []

  for (let index = 0; index < slots.length; index += EXACT_DELETE_BATCH_SIZE) {
    await refreshRewriteLock(lockKey, lockToken)

    const batch = slots.slice(index, index + EXACT_DELETE_BATCH_SIZE)
    const results = await Promise.all(batch.map(async (slot) => {
      let query = supabase
        .from('availabilities')
        .delete()
        .eq('provider_id', slot.provider_id)
        .eq('starts_at', slot.starts_at)
        .eq('ends_at', slot.ends_at)
        .eq('slot_duration_mins', slot.slot_duration_mins)
        .eq('buffer_mins', slot.buffer_mins)
        .eq('is_booked', false)
        .eq('is_blocked', false)

      query = slot.location_id
        ? query.eq('location_id', slot.location_id)
        : query.is('location_id', null)

      const { error } = await query
      return { slot, error: error ?? null }
    }))

    for (const result of results) {
      if (!result.error) {
        deletedSlots.push(result.slot)
      }
    }

    const firstError = results.find((result) => result.error !== null)

    if (firstError) {
      return {
        deletedSlots,
        error: firstError.error,
      }
    }
  }

  return {
    deletedSlots,
    error: null,
  }
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const demoSession = !user ? await getDemoSessionFromCookies(request.cookies) : null

  const url = new URL(request.url)
  const startParam = url.searchParams.get('start')
  const endParam = url.searchParams.get('end')

  const defaultWindow = getProviderAvailabilityWindow(1)
  const startDateKey = startParam ?? defaultWindow.startDateKey
  const endDateKey = endParam ?? defaultWindow.endDateKey
  let startDate: Date
  let endDate: Date

  try {
    startDate = parseIndiaDate(startDateKey)
    endDate = new Date(parseIndiaDate(endDateKey).getTime() + 24 * 60 * 60 * 1000 - 1)
  } catch {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
  }

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
    return NextResponse.json({ error: 'Invalid date range' }, { status: 400 })
  }

  if (!user && demoSession?.role === 'provider') {
    const requestedDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime() + 1) / (24 * 60 * 60 * 1000)))
    const generatedSlots = buildAvailabilitySlotsInIndia({
      schedule: DEFAULT_PROVIDER_SCHEDULE,
      durationMinutes: 30,
      weeks: Math.ceil(requestedDays / 7),
      providerId: demoSession.userId,
      locationId: 'demo-location',
      bufferMins: DEFAULT_BUFFER_MINS,
      referenceDate: new Date(startDate.getTime() - 24 * 60 * 60 * 1000),
    }).filter((slot) => slot.starts_at >= startDate.toISOString() && slot.starts_at <= endDate.toISOString())

    return NextResponse.json({ slots: generatedSlots }, { headers: NO_STORE_HEADERS })
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'provider') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data: slots, error } = await supabase
    .from('availabilities')
    .select('starts_at, ends_at, is_booked, is_blocked')
    .eq('provider_id', user.id)
    .gte('starts_at', startDate.toISOString())
    .lte('starts_at', endDate.toISOString())
    .order('starts_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 })
  }

  return NextResponse.json({ slots: slots ?? [] }, { headers: NO_STORE_HEADERS })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { supabaseAdmin } = await import('@/lib/supabase/admin')
  const { data: { user } } = await supabase.auth.getUser()
  const demoSession = !user ? await getDemoSessionFromCookies(request.cookies) : null

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const parsed = saveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid schedule data', details: parsed.error.flatten() }, { status: 400 })
  }

  const { schedule, duration, weeks } = parsed.data
  const scheduleErrors = validateProviderSchedule(schedule as unknown as ProviderScheduleLike)

  if (Object.keys(scheduleErrors).length > 0) {
    return NextResponse.json({
      error: 'Invalid schedule data',
      details: {
        fieldErrors: Object.fromEntries(
          Object.entries(scheduleErrors).map(([dayName, message]) => [dayName, [message]]),
        ),
        formErrors: [],
      },
    }, { status: 400 })
  }

  if (!user && demoSession?.role === 'provider') {
    const generatedSlots = buildAvailabilitySlotsInIndia({
      schedule: schedule as unknown as ProviderScheduleLike,
      durationMinutes: duration,
      weeks,
      providerId: demoSession.userId,
      locationId: 'demo-location',
      bufferMins: DEFAULT_BUFFER_MINS,
    })

    return NextResponse.json({ success: true, created: generatedSlots.length }, { status: 200, headers: NO_STORE_HEADERS })
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'provider') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const rewriteLockKey = getProviderAvailabilityRewriteLockKey(user.id)
  const rewriteLockToken = crypto.randomUUID()

  try {
    const lockAcquired = await redis.set(rewriteLockKey, rewriteLockToken, { nx: true, ex: REWRITE_LOCK_TTL_SECONDS })

    if (lockAcquired !== 'OK') {
      return NextResponse.json({ error: 'Availability is already being updated. Please retry in a few seconds.' }, { status: 409 })
    }
  } catch (error) {
    console.error('[api/provider/availability] Rewrite lock unavailable:', error)
    return NextResponse.json({ error: 'Availability protection is temporarily unavailable. Please try again shortly.' }, { status: 503 })
  }

  try {
    const { data: providerLocations, error: locationError } = await supabase
      .from('locations')
      .select('id')
      .eq('provider_id', user.id)
      .limit(1)

    if (locationError) {
      return NextResponse.json({ error: 'Failed to load provider locations' }, { status: 500 })
    }

    const primaryLocationId = providerLocations?.[0]?.id ?? null

    if (!primaryLocationId) {
      return NextResponse.json({ error: 'Add a provider location before saving availability.' }, { status: 400 })
    }

    const { startDateKey, endDateKey } = getProviderAvailabilityWindow(weeks)
    const futureWindowStart = parseIndiaDate(startDateKey)
    const futureWindowEnd = new Date(parseIndiaDate(endDateKey).getTime() + 24 * 60 * 60 * 1000 - 1)
    const futureWindowEndExclusive = new Date(futureWindowEnd.getTime() + 1)

    const { data: existingOpenSlots, error: existingOpenSlotsError } = await supabase
      .from('availabilities')
      .select('provider_id, location_id, starts_at, ends_at, slot_duration_mins, buffer_mins, is_booked, is_blocked')
      .eq('provider_id', user.id)
      .eq('is_booked', false)
      .eq('is_blocked', false)
      .gte('starts_at', futureWindowStart.toISOString())
      .lte('starts_at', futureWindowEnd.toISOString())

    if (existingOpenSlotsError) {
      return NextResponse.json({ error: 'Failed to load existing availability' }, { status: 500 })
    }

    const { data: protectedSlots, error: protectedSlotsError } = await fetchProtectedSlotsInRange(
      supabase,
      user.id,
      futureWindowStart.toISOString(),
      futureWindowEndExclusive.toISOString(),
    )

    if (protectedSlotsError) {
      return NextResponse.json({ error: 'Failed to validate protected availability' }, { status: 500 })
    }

    const bufferMins = existingOpenSlots?.[0]?.buffer_mins ?? DEFAULT_BUFFER_MINS
    const newSlots = buildAvailabilitySlotsInIndia({
      schedule: schedule as unknown as ProviderScheduleLike,
      durationMinutes: duration,
      weeks,
      providerId: user.id,
      locationId: primaryLocationId,
      bufferMins,
    })

    const safeSlots = excludeProtectedSlots(newSlots, protectedSlots ?? [])

    if (safeSlots.length > MAX_GENERATED_SLOTS) {
      return NextResponse.json({ error: 'Too many availability slots requested. Reduce the range or increase slot duration.' }, { status: 400 })
    }

    const existingOpenSlotRows = existingOpenSlots ?? []
    const existingOpenSlotKeys = new Set(existingOpenSlotRows.map((slot) => buildSlotIdentityKey(slot)))
    const desiredSlotKeys = new Set(safeSlots.map((slot) => buildSlotIdentityKey(slot)))
    const slotsToInsert = safeSlots.filter((slot) => !existingOpenSlotKeys.has(buildSlotIdentityKey(slot)))
    const slotsToDelete = existingOpenSlotRows.filter((slot) => !desiredSlotKeys.has(buildSlotIdentityKey(slot)))

    if (slotsToInsert.length === 0 && slotsToDelete.length === 0) {
      return NextResponse.json({ success: true, created: 0 })
    }

    const insertedSlots: typeof safeSlots = []
    for (let index = 0; index < slotsToInsert.length; index += INSERT_BATCH_SIZE) {
      await refreshRewriteLock(rewriteLockKey, rewriteLockToken)

      const batch = slotsToInsert.slice(index, index + INSERT_BATCH_SIZE)
      const batchStartIso = batch[0]?.starts_at ?? futureWindowStart.toISOString()
      const batchEndExclusiveIso = new Date(
        Date.parse(batch[batch.length - 1]?.ends_at ?? futureWindowEndExclusive.toISOString()) + 1,
      ).toISOString()

      const { data: latestProtectedSlots, error: latestProtectedSlotsError } = await fetchProtectedSlotsInRange(
        supabase,
        user.id,
        batchStartIso,
        batchEndExclusiveIso,
      )

      if (latestProtectedSlotsError) {
        await deleteExactOpenSlots(supabaseAdmin, insertedSlots, rewriteLockKey, rewriteLockToken)
        return NextResponse.json({ error: 'Failed to validate protected availability' }, { status: 500 })
      }

      const collisionSafeBatch = excludeProtectedSlots(batch, latestProtectedSlots ?? [])

      if (collisionSafeBatch.length === 0) {
        continue
      }

      const { error: insertError } = await supabase.from('availabilities').insert(collisionSafeBatch)
      if (insertError) {
        await deleteExactOpenSlots(supabaseAdmin, insertedSlots, rewriteLockKey, rewriteLockToken)
        return NextResponse.json({ error: 'Failed to save availability slots' }, { status: 500 })
      }

      insertedSlots.push(...collisionSafeBatch)
    }

    const obsoleteSlotDeleteResult = await deleteExactOpenSlots(
      supabaseAdmin,
      slotsToDelete,
      rewriteLockKey,
      rewriteLockToken,
    )

    if (obsoleteSlotDeleteResult.error) {
      const rollbackInsertedSlotsResult = await deleteExactOpenSlots(
        supabaseAdmin,
        insertedSlots,
        rewriteLockKey,
        rewriteLockToken,
      )

      const { error: restoreDeletedSlotsError } = obsoleteSlotDeleteResult.deletedSlots.length > 0
        ? await supabaseAdmin.from('availabilities').insert(obsoleteSlotDeleteResult.deletedSlots)
        : { error: null }

      if (rollbackInsertedSlotsResult.error || restoreDeletedSlotsError) {
        console.error('[api/provider/availability] Failed to roll back availability cleanup:', {
          cleanupError: obsoleteSlotDeleteResult.error,
          rollbackInsertedSlotsError: rollbackInsertedSlotsResult.error,
          restoreDeletedSlotsError,
        })
      }

      return NextResponse.json({ error: 'Failed to finalize availability cleanup. Please retry once more.' }, { status: 500 })
    }
    return NextResponse.json({ success: true, created: insertedSlots.length })
  } catch (error) {
    console.error('[api/provider/availability] Failed to rewrite availability:', error)
    return NextResponse.json({ error: 'Availability update interrupted. Please retry in a few seconds.' }, { status: 503 })
  } finally {
    await releaseRewriteLock(rewriteLockKey, rewriteLockToken)
  }
}
