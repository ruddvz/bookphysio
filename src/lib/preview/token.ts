import type { NextRequest } from 'next/server'

const PREVIEW_TOKEN_MESSAGE = 'bookphysio-preview'
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

export async function createPreviewToken(secret: string): Promise<string> {
  const key = await createSigningKey(secret)
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(PREVIEW_TOKEN_MESSAGE))

  return bytesToHex(new Uint8Array(signature))
}

export async function isValidPreviewToken(
  token: string | null | undefined,
  secret: string | null | undefined,
): Promise<boolean> {
  if (!secret || !token) {
    return false
  }

  const expectedToken = await createPreviewToken(secret)
  return constantTimeEqual(token, expectedToken)
}

export async function hasValidPreviewCookie(request: NextRequest): Promise<boolean> {
  return isValidPreviewToken(request.cookies.get('preview_token')?.value, process.env.PREVIEW_PASSWORD)
}