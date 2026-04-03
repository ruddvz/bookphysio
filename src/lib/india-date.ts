const INDIA_TIME_ZONE = 'Asia/Kolkata'
const INDIA_UTC_OFFSET_MINUTES = 5.5 * 60
const INDIA_UTC_OFFSET_MS = INDIA_UTC_OFFSET_MINUTES * 60 * 1000

const indiaDateFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: INDIA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

const indiaWeekdayFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: INDIA_TIME_ZONE,
  weekday: 'short',
})

const indiaDayNumberFormatter = new Intl.DateTimeFormat('en-IN', {
  timeZone: INDIA_TIME_ZONE,
  day: 'numeric',
})

function formatInIndia(value: Date | string | number, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: INDIA_TIME_ZONE,
    ...options,
  }).format(toValidDate(value))
}

function formatIcsUtcTimestamp(value: Date): string {
  const year = value.getUTCFullYear()
  const month = String(value.getUTCMonth() + 1).padStart(2, '0')
  const day = String(value.getUTCDate()).padStart(2, '0')
  const hour = String(value.getUTCHours()).padStart(2, '0')
  const minute = String(value.getUTCMinutes()).padStart(2, '0')
  const second = String(value.getUTCSeconds()).padStart(2, '0')

  return `${year}${month}${day}T${hour}${minute}${second}Z`
}

function parseIndiaClockTime(value: string): { hour: number; minute: number } {
  const trimmedValue = value.trim().toUpperCase()
  const match = trimmedValue.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/)

  if (!match) {
    throw new RangeError('Invalid India time value.')
  }

  let hour = Number.parseInt(match[1], 10)
  const minute = Number.parseInt(match[2] ?? '0', 10)

  if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
    throw new RangeError('Invalid India time value.')
  }

  if (match[3] === 'PM' && hour !== 12) {
    hour += 12
  }

  if (match[3] === 'AM' && hour === 12) {
    hour = 0
  }

  return { hour, minute }
}

function toValidDate(value: Date | string | number): Date {
  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) {
    throw new RangeError('Invalid date value.')
  }

  return date
}

export function formatIndiaDateInput(value: Date | string | number): string {
  const date = toValidDate(value)
  const parts = indiaDateFormatter.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new RangeError('Unable to format India date parts.')
  }

  return `${year}-${month}-${day}`
}

export function getIndiaWeekdayShort(value: Date | string | number): string {
  return indiaWeekdayFormatter.format(toValidDate(value))
}

export function getIndiaDayNumber(value: Date | string | number): number {
  return Number.parseInt(indiaDayNumberFormatter.format(toValidDate(value)), 10)
}

export function parseIndiaDate(value: string): Date {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!match) {
    return toValidDate(value)
  }

  const year = Number.parseInt(match[1], 10)
  const month = Number.parseInt(match[2], 10)
  const day = Number.parseInt(match[3], 10)

  return new Date(Date.UTC(year, month - 1, day) - INDIA_UTC_OFFSET_MS)
}

export function formatIndiaDate(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' },
): string {
  return formatInIndia(value, options)
}

export function formatIndiaTime(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' },
): string {
  return formatInIndia(value, options)
}

export function formatIndiaDateTime(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
): string {
  return formatInIndia(value, options)
}

export function formatIndiaTimeRange(startValue: Date | string | number, endValue: Date | string | number): string {
  return `${formatIndiaTime(startValue)} - ${formatIndiaTime(endValue)}`
}

export function buildIndiaCalendarEventRange(input: {
  date: string
  time: string
  durationMinutes?: number
}): { start: string; end: string } {
  const dateMatch = input.date.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!dateMatch) {
    throw new RangeError('Invalid India date value.')
  }

  const year = Number.parseInt(dateMatch[1], 10)
  const month = Number.parseInt(dateMatch[2], 10)
  const day = Number.parseInt(dateMatch[3], 10)
  const { hour, minute } = parseIndiaClockTime(input.time)
  const durationMinutes = input.durationMinutes ?? 60
  const start = new Date(Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute,
  ) - INDIA_UTC_OFFSET_MS)
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000)

  return {
    start: formatIcsUtcTimestamp(start),
    end: formatIcsUtcTimestamp(end),
  }
}

export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
}