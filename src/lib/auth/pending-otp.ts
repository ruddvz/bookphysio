export type PendingOtpFlow = 'login' | 'signup'

export interface PendingOtpPayload {
  phone: string
  flow: PendingOtpFlow
  fullName?: string
  returnTo?: string | null
}

const PENDING_OTP_STORAGE_KEY = 'bp-pending-otp'

export function savePendingOtp(payload: PendingOtpPayload): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  try {
    window.sessionStorage.setItem(PENDING_OTP_STORAGE_KEY, JSON.stringify(payload))
    return true
  } catch {
    return false
  }
}

export function readPendingOtp(): PendingOtpPayload | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.sessionStorage.getItem(PENDING_OTP_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as Partial<PendingOtpPayload>

    if (
      typeof parsed.phone !== 'string' ||
      (parsed.flow !== 'login' && parsed.flow !== 'signup')
    ) {
      return null
    }

    return {
      phone: parsed.phone,
      flow: parsed.flow,
      fullName: typeof parsed.fullName === 'string' ? parsed.fullName : undefined,
      returnTo: typeof parsed.returnTo === 'string' ? parsed.returnTo : null,
    }
  } catch {
    return null
  }
}

export function clearPendingOtp(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.removeItem(PENDING_OTP_STORAGE_KEY)
  } catch {
    // Ignore storage cleanup failures.
  }
}