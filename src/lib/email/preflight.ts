/**
 * Central env contract for Resend-backed email (OTP, password reset, etc.).
 */
export function assertEmailServiceConfigured():
  | { ok: true }
  | { ok: false; missing: string[] } {
  const missing: string[] = []
  if (!process.env.RESEND_API_KEY?.trim()) missing.push('RESEND_API_KEY')
  if (!process.env.RESEND_FROM_EMAIL?.trim()) missing.push('RESEND_FROM_EMAIL')
  const appOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL
  if (!appOrigin?.trim()) missing.push('NEXT_PUBLIC_APP_URL or NEXT_PUBLIC_SITE_URL')
  if (missing.length > 0) return { ok: false, missing }
  return { ok: true }
}
