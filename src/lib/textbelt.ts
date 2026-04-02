/**
 * Textbelt SMS Integration
 * https://textbelt.com/
 *
 * Usage:
 *   Free: key = 'textbelt' (1 SMS/day for testing)
 *   Paid: key = your API key from https://textbelt.com/
 *         Set TEXTBELT_API_KEY in environment variables.
 *
 * India support: Textbelt supports international SMS including India (+91).
 * IMPORTANT: For production India OTP compliance, consider onboarding to
 * DLT (Distributed Ledger Technology) via a DLT-registered sender ID.
 * Textbelt is suitable for development and low-volume usage.
 */

const TEXTBELT_API = 'https://textbelt.com/text'

export async function sendSmsTextbelt(
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string; quotaRemaining?: number }> {
  const apiKey = process.env.TEXTBELT_API_KEY ?? 'textbelt'

  const params = new URLSearchParams({
    phone,
    message,
    key: apiKey,
  })

  try {
    const res = await fetch(TEXTBELT_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    })

    if (!res.ok) {
      return { success: false, error: `HTTP ${res.status}` }
    }

    const data = await res.json() as {
      success: boolean
      error?: string
      quotaRemaining?: number
    }

    return {
      success: data.success,
      error: data.error,
      quotaRemaining: data.quotaRemaining,
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Network error',
    }
  }
}
