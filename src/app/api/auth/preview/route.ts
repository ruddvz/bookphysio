import { NextResponse, type NextRequest } from 'next/server'
import { createPreviewToken } from '@/lib/preview/token'

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

  const match = constantTimeEqual(password, secret)

  if (!match) {
    return NextResponse.json({ error: 'Wrong password' }, { status: 401 })
  }

  const token = await createPreviewToken(secret)
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
