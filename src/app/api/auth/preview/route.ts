import { NextResponse, type NextRequest } from 'next/server'
import crypto from 'crypto'

function makeToken(secret: string): string {
  return crypto.createHmac('sha256', secret).update('bookphysio-preview').digest('hex')
}

export async function POST(request: NextRequest) {
  const secret = process.env.PREVIEW_PASSWORD
  if (!secret) {
    return NextResponse.json({ error: 'Preview access is not configured' }, { status: 404 })
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

  // Constant-time comparison to prevent timing attacks
  const inputBuf = Buffer.from(password)
  const secretBuf = Buffer.from(secret)
  const match =
    inputBuf.length === secretBuf.length &&
    crypto.timingSafeEqual(inputBuf, secretBuf)

  if (!match) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const token = makeToken(secret)
  const response = NextResponse.json({ ok: true })
  response.cookies.set('preview_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('preview_token')
  return response
}
