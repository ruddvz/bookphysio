import type { NextResponse } from 'next/server'

export type PendingOtpServerFlow = 'login' | 'signup' | 'provider_signup'

interface PendingOtpCookieReader {
  get: (name: string) => { value: string } | undefined
}

interface PendingOtpRequestLike {
  headers?: Headers
}

interface PendingOtpCookiePayload {
  flow: PendingOtpServerFlow
  flowId?: string
  fullName?: string
  issuedAt: number
  phone: string
  returnTo?: string | null
}

const OTP_PENDING_COOKIE_NAME = 'bp_pending_otp'
const OTP_PENDING_TTL_MS = 15 * 60 * 1000
const OTP_PENDING_TTL_SECONDS = OTP_PENDING_TTL_MS / 1000

const encoder = new TextEncoder()
const decoder = new TextDecoder()

let cachedSigningSecret: string | null = null
let cachedSigningKeyPromise: Promise<CryptoKey> | null = null

function bytesToBase64Url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '')
}

function base64UrlToBytes(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4 || 4)) % 4)
  const binary = atob(padded)

  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

function getPendingOtpCookieSecret(): string | null {
  return (
    process.env.OTP_PENDING_COOKIE_SECRET ??
    process.env.DEMO_COOKIE_SECRET ??
    (process.env.NODE_ENV === 'production' ? null : 'local-otp-cookie-secret')
  )
}

function readCookieValueFromHeader(headerValue: string | null | undefined, name: string): string | null {
  if (!headerValue) {
    return null
  }

  const segments = headerValue.split(';')
  for (const segment of segments) {
    const trimmedSegment = segment.trim()
    if (!trimmedSegment.startsWith(`${name}=`)) {
      continue
    }

    return trimmedSegment.slice(name.length + 1)
  }

  return null
}

async function getPendingOtpSigningKey(secret: string): Promise<CryptoKey> {
  if (cachedSigningSecret === secret && cachedSigningKeyPromise) {
    return cachedSigningKeyPromise
  }

  cachedSigningSecret = secret
  cachedSigningKeyPromise = crypto.subtle.digest('SHA-256', encoder.encode(secret)).then((digest) =>
    crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt'])
  )

  return cachedSigningKeyPromise
}

async function encryptPendingOtpPayload(payload: string, secret: string): Promise<string> {
  const key = await getPendingOtpSigningKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, encoder.encode(payload))

  return `${bytesToBase64Url(iv)}.${bytesToBase64Url(new Uint8Array(ciphertext))}`
}

async function decryptPendingOtpPayload(value: string, secret: string): Promise<string | null> {
  const separatorIndex = value.indexOf('.')
  if (separatorIndex <= 0) {
    return null
  }

  try {
    const iv = base64UrlToBytes(value.slice(0, separatorIndex))
    const ciphertext = base64UrlToBytes(value.slice(separatorIndex + 1))
    const key = await getPendingOtpSigningKey(secret)
    const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: toArrayBuffer(iv) }, key, toArrayBuffer(ciphertext))

    return decoder.decode(new Uint8Array(plaintext))
  } catch {
    return null
  }
}

function isPendingOtpCookiePayload(value: unknown): value is PendingOtpCookiePayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const payload = value as Partial<PendingOtpCookiePayload>
  return (
    typeof payload.phone === 'string' &&
    /^\+91[6-9]\d{9}$/u.test(payload.phone) &&
    (payload.flow === 'login' || payload.flow === 'signup' || payload.flow === 'provider_signup') &&
    typeof payload.issuedAt === 'number' &&
    (typeof payload.flowId === 'undefined' || typeof payload.flowId === 'string') &&
    (typeof payload.fullName === 'undefined' || typeof payload.fullName === 'string') &&
    (typeof payload.returnTo === 'undefined' || payload.returnTo === null || typeof payload.returnTo === 'string')
  )
}

export async function createPendingOtpCookieValue(payload: {
  flow: PendingOtpServerFlow
  flowId?: string
  fullName?: string
  phone: string
  returnTo?: string | null
}): Promise<string | null> {
  const secret = getPendingOtpCookieSecret()
  if (!secret) {
    return null
  }

  return encryptPendingOtpPayload(JSON.stringify({ ...payload, issuedAt: Date.now() }), secret)
}

export async function readPendingOtpCookieValue(value: string | null | undefined): Promise<PendingOtpCookiePayload | null> {
  const secret = getPendingOtpCookieSecret()
  if (!secret || !value) {
    return null
  }

  const plaintext = await decryptPendingOtpPayload(value, secret)
  if (!plaintext) {
    return null
  }

  try {
    const parsed = JSON.parse(plaintext) as unknown
    if (!isPendingOtpCookiePayload(parsed)) {
      return null
    }

    const now = Date.now()
    if (parsed.issuedAt > now + 60_000 || now - parsed.issuedAt > OTP_PENDING_TTL_MS) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export async function getPendingOtpFromCookies(cookies: PendingOtpCookieReader): Promise<PendingOtpCookiePayload | null> {
  return readPendingOtpCookieValue(cookies.get(OTP_PENDING_COOKIE_NAME)?.value)
}

export async function getPendingOtpFromRequest(request: PendingOtpRequestLike & { cookies?: PendingOtpCookieReader }): Promise<PendingOtpCookiePayload | null> {
  if (request.cookies) {
    return getPendingOtpFromCookies(request.cookies)
  }

  const cookieValue = readCookieValueFromHeader(request.headers?.get('cookie'), OTP_PENDING_COOKIE_NAME)
  return readPendingOtpCookieValue(cookieValue)
}

export function setPendingOtpCookie(response: NextResponse, value: string): void {
  response.cookies.set(OTP_PENDING_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: OTP_PENDING_TTL_SECONDS,
    path: '/',
  })
}

export function clearPendingOtpCookie(response: NextResponse): void {
  response.cookies.delete(OTP_PENDING_COOKIE_NAME)
}

export { OTP_PENDING_COOKIE_NAME }