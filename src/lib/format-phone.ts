/**
 * Format a raw 10-digit Indian phone number with a space after the 5th digit.
 * "9876543210" → "98765 43210"
 * Strips non-digits before formatting.
 */
function normalizeIndianPhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, '')

  if (digits.length > 10 && digits.startsWith('91')) {
    return digits.slice(2, 12)
  }

  return digits.slice(0, 10)
}

export function formatIndianPhone(raw: string): string {
  const digits = normalizeIndianPhoneDigits(raw)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)} ${digits.slice(5)}`
}

/**
 * Strip formatting to get raw digits only.
 */
export function stripPhoneFormat(formatted: string): string {
  return normalizeIndianPhoneDigits(formatted)
}

export function toIndianE164(raw: string): string | null {
  const digits = normalizeIndianPhoneDigits(raw)
  if (digits.length !== 10) {
    return null
  }

  return `+91${digits}`
}
