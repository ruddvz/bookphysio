const encoder = new TextEncoder()

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export async function buildPhoneRateLimitKey(prefix: string, phone: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(phone))
  return `${prefix}:${bytesToHex(new Uint8Array(digest))}`
}