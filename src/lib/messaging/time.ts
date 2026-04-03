import { formatIndiaDate, formatIndiaDateInput, formatIndiaTime } from '@/lib/india-date'

const MESSAGE_DATE_OPTIONS = { month: 'short', day: 'numeric' } satisfies Intl.DateTimeFormatOptions
const MESSAGE_TIME_OPTIONS = { hour: '2-digit', minute: '2-digit', hour12: true } satisfies Intl.DateTimeFormatOptions

function toValidDate(value: Date | string | number): Date | null {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatConversationTimestamp(
  value: Date | string | number,
  referenceValue: Date | string | number = new Date(),
): string {
  const date = toValidDate(value)
  const reference = toValidDate(referenceValue)

  if (!date || !reference) {
    return ''
  }

  const diffMs = reference.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins >= 0 && diffMins < 60) {
    return `${diffMins}m ago`
  }

  const messageIndiaDate = formatIndiaDateInput(date)
  const referenceIndiaDate = formatIndiaDateInput(reference)

  if (messageIndiaDate === referenceIndiaDate) {
    return formatIndiaTime(date, MESSAGE_TIME_OPTIONS)
  }

  const yesterday = new Date(reference.getTime() - 24 * 60 * 60 * 1000)
  if (messageIndiaDate === formatIndiaDateInput(yesterday)) {
    return 'Yesterday'
  }

  return formatIndiaDate(date, MESSAGE_DATE_OPTIONS)
}

export function formatConversationDateDivider(value: Date | string | number): string {
  const date = toValidDate(value)
  return date ? formatIndiaDate(date, MESSAGE_DATE_OPTIONS) : ''
}

export function formatConversationMessageTime(value: Date | string | number): string {
  const date = toValidDate(value)
  return date ? formatIndiaTime(date, MESSAGE_TIME_OPTIONS) : ''
}