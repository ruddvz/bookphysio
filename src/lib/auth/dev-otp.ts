import type { DemoRole } from '@/lib/demo/session'
import { isDemoAccessEnabled } from '@/lib/demo/session'

/**
 * Fixed development OTP — bypasses Supabase / MSG91 entirely.
 * Only honoured when demo access is enabled (dev / test / NEXT_PUBLIC_ENABLE_DEMO=true).
 *
 * Documented in docs/DEV-ACCESS.md.
 */
export const DEV_OTP_CODE = '123456'

export const DEV_OTP_PHONES: Record<string, DemoRole> = {
  '+919876500001': 'patient',
  '+919876500002': 'provider',
  '+919876500003': 'admin',
}

export function isDevOtpEnabled(): boolean {
  return isDemoAccessEnabled()
}

export function getDevPhoneRole(phone: string): DemoRole | null {
  if (!isDevOtpEnabled()) return null
  return DEV_OTP_PHONES[phone] ?? null
}

export function isDevOtpCode(code: string): boolean {
  return code === DEV_OTP_CODE
}
