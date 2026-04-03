import type { NextRequest } from 'next/server'

const PREVIEW_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000
const encoder = new TextEncoder()

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false
  }

  let difference = 0
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index)
  }

  return difference === 0
}

async function createSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
}

async function signPreviewPayload(secret: string, payload: string): Promise<string> {
  const key = await createSigningKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))

  return bytesToHex(new Uint8Array(signature))
}

export async function createPreviewToken(secret: string): Promise<string> {
  const payload = `${Date.now()}:${crypto.randomUUID()}`
  const signature = await signPreviewPayload(secret, payload)

  return `${payload}.${signature}`
}

export async function isValidPreviewToken(
  token: string | null | undefined,
  secret: string | null | undefined,
): Promise<boolean> {
  if (!secret || !token) {
    return false
  }

  const separatorIndex = token.lastIndexOf('.')
  if (separatorIndex <= 0) {
    return false
  }

  const payload = token.slice(0, separatorIndex)
  const signature = token.slice(separatorIndex + 1)
  const expectedSignature = await signPreviewPayload(secret, payload)

  if (!constantTimeEqual(signature, expectedSignature)) {
    return false
  }

  const issuedAt = Number.parseInt(payload.split(':')[0] ?? '', 10)
  if (!Number.isFinite(issuedAt)) {
    return false
  }

  const now = Date.now()
  return issuedAt <= now + 60_000 && now - issuedAt <= PREVIEW_TOKEN_TTL_MS
}

export async function hasValidPreviewCookie(request: NextRequest): Promise<boolean> {
  return isValidPreviewToken(request.cookies.get('preview_token')?.value, process.env.PREVIEW_PASSWORD)
}