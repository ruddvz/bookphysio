import { NextResponse, type NextRequest } from 'next/server'
import { createPreviewToken, getPreviewTokenSigningSecret, isPublicPreviewGateEnabled } from '@/lib/preview/token'
import { getRequestIpAddress } from '@/lib/server/runtime'
import { previewRatelimit } from '@/lib/upstash'

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

export async function POST(request: NextRequest) {
  if (!isPublicPreviewGateEnabled()) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  const secret = process.env.PREVIEW_PASSWORD

  const tokenSigningSecret = getPreviewTokenSigningSecret()
  if (!tokenSigningSecret) {
    return NextResponse.json({ error: 'Preview token signing is not configured' }, { status: 503 })
  }

  if (!secret) {
    return NextResponse.json({ error: 'Preview password is not configured' }, { status: 503 })
  }

  const ip = getRequestIpAddress(request) ?? 'anonymous'
  try {
    const attemptLimit = await previewRatelimit.limit(`preview:ip:${ip}`)
    if (!attemptLimit.success) {
      return NextResponse.json({ error: 'Too many preview access attempts. Try again later.' }, { status: 429 })
    }
  } catch {
    // Upstash not configured — skip rate limiting for preview access
  }

  let password: string
  try {
    const body = await request.json()
    password = typeof body.password === 'string' ? body.password : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (!password) {
    return NextResponse.json({ error: 'Password is required' }, { status: 400 })
  }

  const match = constantTimeEqual(password, secret)

  if (!match) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const token = await createPreviewToken(tokenSigningSecret)
  const response = NextResponse.json({ ok: true })
  response.cookies.set('preview_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return response
}

export async function DELETE() {
  if (!isPublicPreviewGateEnabled()) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.delete('preview_token')
  return response
}
