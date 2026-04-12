import { formatIndiaDateInput, parseIndiaDate } from './india-date'

const INDIA_TIME_ZONE = 'Asia/Kolkata'
const INDIA_UTC_OFFSET_MS = 5.5 * 60 * 60 * 1000
const indiaWeekdayLongFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: INDIA_TIME_ZONE,
  weekday: 'long',
})
const indiaTimeInputFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: INDIA_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

export interface DayConfig {
  enabled: boolean
  start: string
  end: string
}

export interface ProviderTimeWindow {
  start: string
  end: string
}

export interface MultiSlotDayConfig {
  enabled: boolean
  slots: ProviderTimeWindow[]
}

export const PROVIDER_AVAILABILITY_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

export type DayName = (typeof PROVIDER_AVAILABILITY_DAYS)[number]
export type ProviderSchedule = Record<DayName, DayConfig>
export type ProviderMultiSlotSchedule = Record<DayName, MultiSlotDayConfig>
export type ProviderScheduleLike = ProviderSchedule | ProviderMultiSlotSchedule

export interface ProviderAvailabilitySlot {
  starts_at: string
  ends_at: string
  is_booked: boolean
  is_blocked: boolean
}

export interface GeneratedAvailabilitySlot extends ProviderAvailabilitySlot {
  provider_id: string
  location_id: string
  slot_duration_mins: number
  buffer_mins: number
}

export const DEFAULT_PROVIDER_SCHEDULE: ProviderSchedule = {
  Monday: { enabled: true, start: '09:00', end: '18:00' },
  Tuesday: { enabled: true, start: '09:00', end: '18:00' },
  Wednesday: { enabled: true, start: '09:00', end: '18:00' },
  Thursday: { enabled: true, start: '09:00', end: '18:00' },
  Friday: { enabled: true, start: '09:00', end: '17:00' },
  Saturday: { enabled: false, start: '10:00', end: '14:00' },
  Sunday: { enabled: false, start: '10:00', end: '14:00' },
}

export const DEFAULT_PROVIDER_MULTI_SLOT_SCHEDULE: ProviderMultiSlotSchedule =
  PROVIDER_AVAILABILITY_DAYS.reduce((nextSchedule, dayName) => {
    const config = DEFAULT_PROVIDER_SCHEDULE[dayName]
    nextSchedule[dayName] = {
      enabled: config.enabled,
      slots: [{ start: config.start, end: config.end }],
    }
    return nextSchedule
  }, {} as ProviderMultiSlotSchedule)

export const PROVIDER_SLOT_DURATIONS = ['30', '45', '60'] as const

export function getDisabledProviderSchedule(): ProviderSchedule {
  return PROVIDER_AVAILABILITY_DAYS.reduce((nextSchedule, dayName) => {
    nextSchedule[dayName] = {
      ...DEFAULT_PROVIDER_SCHEDULE[dayName],
      enabled: false,
    }
    return nextSchedule
  }, {} as ProviderSchedule)
}

export function cloneProviderSchedule(
  schedule: ProviderSchedule = DEFAULT_PROVIDER_SCHEDULE,
): ProviderSchedule {
  return PROVIDER_AVAILABILITY_DAYS.reduce((nextSchedule, dayName) => {
    nextSchedule[dayName] = { ...schedule[dayName] }
    return nextSchedule
  }, {} as ProviderSchedule)
}

export function getDisabledProviderMultiSlotSchedule(): ProviderMultiSlotSchedule {
  return PROVIDER_AVAILABILITY_DAYS.reduce((nextSchedule, dayName) => {
    nextSchedule[dayName] = {
      enabled: false,
      slots: [],
    }
    return nextSchedule
  }, {} as ProviderMultiSlotSchedule)
}

export function cloneProviderMultiSlotSchedule(
  schedule: ProviderMultiSlotSchedule = DEFAULT_PROVIDER_MULTI_SLOT_SCHEDULE,
): ProviderMultiSlotSchedule {
  return PROVIDER_AVAILABILITY_DAYS.reduce((nextSchedule, dayName) => {
    const config = schedule[dayName]
    nextSchedule[dayName] = {
      enabled: config.enabled,
      slots: config.slots.map((slot) => ({ ...slot })),
    }
    return nextSchedule
  }, {} as ProviderMultiSlotSchedule)
}

function isMultiSlotDayConfig(config: DayConfig | MultiSlotDayConfig): config is MultiSlotDayConfig {
  return 'slots' in config
}

export function normalizeProviderSchedule(
  schedule: ProviderScheduleLike,
): ProviderMultiSlotSchedule {
  return PROVIDER_AVAILABILITY_DAYS.reduce((nextSchedule, dayName) => {
    const config = schedule[dayName]

    if (isMultiSlotDayConfig(config)) {
      nextSchedule[dayName] = {
        enabled: config.enabled,
        slots: config.slots.map((slot) => ({ ...slot })),
      }
      return nextSchedule
    }

    nextSchedule[dayName] = {
      enabled: config.enabled,
      slots: config.enabled ? [{ start: config.start, end: config.end }] : [],
    }

    return nextSchedule
  }, {} as ProviderMultiSlotSchedule)
}

export function timeToMinutes(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return (hours ?? 0) * 60 + (minutes ?? 0)
}

export function minutesToTimeInput(value: number): string {
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

export function validateProviderSchedule(schedule: ProviderScheduleLike): Record<string, string> {
  const normalizedSchedule = normalizeProviderSchedule(schedule)

  return PROVIDER_AVAILABILITY_DAYS.reduce<Record<string, string>>((errors, dayName) => {
    const dayConfig = normalizedSchedule[dayName]

    if (!dayConfig.enabled) {
      return errors
    }

    if (dayConfig.slots.length === 0) {
      return {
        ...errors,
        [dayName]: 'Add at least one time range',
      }
    }

    const sortedSlots = [...dayConfig.slots].sort((left, right) => timeToMinutes(left.start) - timeToMinutes(right.start))

    for (let index = 0; index < sortedSlots.length; index += 1) {
      const slot = sortedSlots[index]

      if (timeToMinutes(slot.end) <= timeToMinutes(slot.start)) {
        return {
          ...errors,
          [`${dayName}-${index}`]: 'End time must be after start time',
        }
      }

      const previousSlot = sortedSlots[index - 1]
      if (previousSlot && timeToMinutes(slot.start) < timeToMinutes(previousSlot.end)) {
        return {
          ...errors,
          [dayName]: 'Time ranges must not overlap',
        }
      }
    }

    return errors
  }, {})
}

function toDayName(value: string): DayName | null {
  return PROVIDER_AVAILABILITY_DAYS.includes(value as DayName) ? (value as DayName) : null
}

function getIndiaTimeInput(value: string | Date): string {
  return indiaTimeInputFormatter.format(new Date(value))
}

function getIndiaWeekday(value: string | Date): DayName | null {
  return toDayName(indiaWeekdayLongFormatter.format(new Date(value)))
}

function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
  const [year, month, day] = dateKey.split('-').map(Number)

  if (!year || !month || !day) {
    throw new RangeError('Invalid India date key.')
  }

  return { year, month, day }
}

function getMostCommonDuration(durations: number[]): string {
  if (durations.length === 0) {
    return PROVIDER_SLOT_DURATIONS[0]
  }

  const counts = durations.reduce<Map<number, number>>((map, duration) => {
    map.set(duration, (map.get(duration) ?? 0) + 1)
    return map
  }, new Map())

  const [duration] = [...counts.entries()].sort((left, right) => {
    if (right[1] !== left[1]) {
      return right[1] - left[1]
    }

    return left[0] - right[0]
  })[0] ?? [Number(PROVIDER_SLOT_DURATIONS[0])]

  return PROVIDER_SLOT_DURATIONS.includes(String(duration) as (typeof PROVIDER_SLOT_DURATIONS)[number])
    ? String(duration)
    : PROVIDER_SLOT_DURATIONS[0]
}

export function deriveProviderScheduleFromSlots(slots: ProviderAvailabilitySlot[]): {
  schedule: ProviderSchedule
  duration: string
} {
  const derived = deriveProviderMultiSlotScheduleFromSlots(slots)

  const schedule = PROVIDER_AVAILABILITY_DAYS.reduce((nextSchedule, dayName) => {
    const dayConfig = derived.schedule[dayName]

    if (!dayConfig.enabled || dayConfig.slots.length === 0) {
      nextSchedule[dayName] = {
        ...DEFAULT_PROVIDER_SCHEDULE[dayName],
        enabled: false,
      }
      return nextSchedule
    }

    const start = dayConfig.slots.reduce(
      (minimum, slot) => (timeToMinutes(slot.start) < timeToMinutes(minimum) ? slot.start : minimum),
      dayConfig.slots[0]?.start ?? DEFAULT_PROVIDER_SCHEDULE[dayName].start,
    )
    const end = dayConfig.slots.reduce(
      (maximum, slot) => (timeToMinutes(slot.end) > timeToMinutes(maximum) ? slot.end : maximum),
      dayConfig.slots[0]?.end ?? DEFAULT_PROVIDER_SCHEDULE[dayName].end,
    )

    nextSchedule[dayName] = {
      enabled: true,
      start,
      end,
    }
    return nextSchedule
  }, {} as ProviderSchedule)

  return { schedule, duration: derived.duration }
}

function buildDaySlotRanges(slots: ProviderAvailabilitySlot[]): ProviderTimeWindow[] {
  if (slots.length === 0) {
    return []
  }

  const sortedSlots = [...slots]
    .map((slot) => ({
      startMinutes: timeToMinutes(getIndiaTimeInput(slot.starts_at)),
      endMinutes: timeToMinutes(getIndiaTimeInput(slot.ends_at)),
    }))
    .sort((left, right) => left.startMinutes - right.startMinutes)

  const ranges: Array<{ startMinutes: number; endMinutes: number }> = []

  for (const slot of sortedSlots) {
    const previousRange = ranges[ranges.length - 1]

    if (!previousRange || slot.startMinutes > previousRange.endMinutes) {
      ranges.push({ ...slot })
      continue
    }

    previousRange.endMinutes = Math.max(previousRange.endMinutes, slot.endMinutes)
  }

  return ranges.map((range) => ({
    start: minutesToTimeInput(range.startMinutes),
    end: minutesToTimeInput(range.endMinutes),
  }))
}

function buildWindowSignature(windows: ProviderTimeWindow[]): string {
  return windows.map((window) => `${window.start}-${window.end}`).join('|')
}

export function deriveProviderMultiSlotScheduleFromSlots(slots: ProviderAvailabilitySlot[]): {
  schedule: ProviderMultiSlotSchedule
  duration: string
  ambiguousDays: DayName[]
} {
  const nextSchedule = getDisabledProviderMultiSlotSchedule()
  const openSlots = slots.filter((slot) => !slot.is_booked && !slot.is_blocked)

  if (openSlots.length === 0) {
    return {
      schedule: nextSchedule,
      duration: PROVIDER_SLOT_DURATIONS[0],
      ambiguousDays: getAmbiguousProviderScheduleDays(slots),
    }
  }

  const slotsByDayAndDate = new Map<DayName, Map<string, ProviderAvailabilitySlot[]>>()
  const durations: number[] = []

  for (const slot of [...openSlots].sort((left, right) => Date.parse(left.starts_at) - Date.parse(right.starts_at))) {
    const dayName = getIndiaWeekday(slot.starts_at)

    if (!dayName) {
      continue
    }

    const dateKey = formatIndiaDateInput(slot.starts_at)
    const slotsByDate = slotsByDayAndDate.get(dayName) ?? new Map<string, ProviderAvailabilitySlot[]>()
    const dateSlots = slotsByDate.get(dateKey) ?? []
    dateSlots.push(slot)
    slotsByDate.set(dateKey, dateSlots)
    slotsByDayAndDate.set(dayName, slotsByDate)

    const durationMinutes = timeToMinutes(getIndiaTimeInput(slot.ends_at)) - timeToMinutes(getIndiaTimeInput(slot.starts_at))
    if (durationMinutes > 0) {
      durations.push(durationMinutes)
    }
  }

  const ambiguousDays = new Set<DayName>()

  for (const dayName of PROVIDER_AVAILABILITY_DAYS) {
    const slotsByDate = slotsByDayAndDate.get(dayName)
    if (!slotsByDate || slotsByDate.size === 0) {
      continue
    }

    const patterns = [...slotsByDate.values()].map((dateSlots) => buildDaySlotRanges(dateSlots))
    const firstPattern = patterns[0] ?? []
    const firstSignature = buildWindowSignature(firstPattern)

    if (patterns.some((pattern) => buildWindowSignature(pattern) !== firstSignature)) {
      ambiguousDays.add(dayName)
    }

    nextSchedule[dayName] = {
      enabled: firstPattern.length > 0,
      slots: firstPattern,
    }
  }

  for (const dayName of getAmbiguousProviderScheduleDays(slots)) {
    ambiguousDays.add(dayName)
  }

  return {
    schedule: nextSchedule,
    duration: getMostCommonDuration(durations),
    ambiguousDays: PROVIDER_AVAILABILITY_DAYS.filter((dayName) => ambiguousDays.has(dayName)),
  }
}

export function getAmbiguousProviderScheduleDays(slots: ProviderAvailabilitySlot[]): DayName[] {
  const openDays = new Set<DayName>()
  const protectedOnlyDays = new Set<DayName>()

  for (const slot of slots) {
    const dayName = getIndiaWeekday(slot.starts_at)

    if (!dayName) {
      continue
    }

    if (!slot.is_booked && !slot.is_blocked) {
      openDays.add(dayName)
      protectedOnlyDays.delete(dayName)
      continue
    }

    if (!openDays.has(dayName)) {
      protectedOnlyDays.add(dayName)
    }
  }

  return PROVIDER_AVAILABILITY_DAYS.filter((dayName) => protectedOnlyDays.has(dayName))
}

export function buildIndiaUtcDateFromDateKey(dateKey: string, totalMinutes: number): Date {
  const { year, month, day } = parseDateKey(dateKey)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return new Date(Date.UTC(year, month - 1, day, hours, minutes) - INDIA_UTC_OFFSET_MS)
}

export function getUpcomingIndiaDateKeys(weeks: number, referenceDate: Date = new Date()): string[] {
  const totalDays = Math.max(1, weeks * 7)
  const todayKey = formatIndiaDateInput(referenceDate)
  const tomorrowStartMs = parseIndiaDate(todayKey).getTime() + 24 * 60 * 60 * 1000

  return Array.from({ length: totalDays }, (_, dayOffset) =>
    formatIndiaDateInput(new Date(tomorrowStartMs + dayOffset * 24 * 60 * 60 * 1000)),
  )
}

export function getProviderAvailabilityWindow(weeks: number, referenceDate: Date = new Date()): {
  startDateKey: string
  endDateKey: string
} {
  const keys = getUpcomingIndiaDateKeys(weeks, referenceDate)

  return {
    startDateKey: keys[0] ?? formatIndiaDateInput(referenceDate),
    endDateKey: keys[keys.length - 1] ?? formatIndiaDateInput(referenceDate),
  }
}

export function buildAvailabilitySlotsInIndia(input: {
  schedule: ProviderScheduleLike
  durationMinutes: number
  weeks: number
  providerId: string
  locationId: string
  bufferMins: number
  referenceDate?: Date
}): GeneratedAvailabilitySlot[] {
  const slots: GeneratedAvailabilitySlot[] = []
  const normalizedSchedule = normalizeProviderSchedule(input.schedule)

  for (const dateKey of getUpcomingIndiaDateKeys(input.weeks, input.referenceDate)) {
    const dayName = getIndiaWeekday(parseIndiaDate(dateKey))
    const dayConfig = dayName ? normalizedSchedule[dayName] : null

    if (!dayConfig?.enabled || dayConfig.slots.length === 0) {
      continue
    }

    for (const window of dayConfig.slots) {
      const startMinutes = timeToMinutes(window.start)
      const endMinutes = timeToMinutes(window.end)

      for (
        let minutes = startMinutes;
        minutes + input.durationMinutes <= endMinutes;
        minutes += input.durationMinutes
      ) {
        const slotStart = buildIndiaUtcDateFromDateKey(dateKey, minutes)
        const slotEnd = new Date(slotStart.getTime() + input.durationMinutes * 60 * 1000)

        slots.push({
          provider_id: input.providerId,
          location_id: input.locationId,
          starts_at: slotStart.toISOString(),
          ends_at: slotEnd.toISOString(),
          slot_duration_mins: input.durationMinutes,
          buffer_mins: input.bufferMins,
          is_booked: false,
          is_blocked: false,
        })
      }
    }
  }

  return slots
}
