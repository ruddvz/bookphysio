import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  createDemoCookiePayload,
  createDemoSession,
  DEMO_SESSION_COOKIE,
  encodeDemoCookie,
  isDemoAccessEnabled,
  resolvePostAuthRedirect,
} from '@/lib/demo/session'

const demoAccessSchema = z.object({
  role: z.enum(['patient', 'provider', 'admin']),
  returnTo: z.string().optional(),
})

export async function POST(request: NextRequest) {
  if (!isDemoAccessEnabled()) {
    return NextResponse.json({ error: 'Demo access is disabled.' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const parsed = demoAccessSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid demo access request.' }, { status: 400 })
  }

  const cookiePayload = createDemoCookiePayload(parsed.data.role)
  const redirectTo = resolvePostAuthRedirect(parsed.data.role, parsed.data.returnTo)
  const response = NextResponse.json({
    session: createDemoSession(parsed.data.role),
    redirectTo,
  })

  response.cookies.set(DEMO_SESSION_COOKIE, encodeDemoCookie(cookiePayload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(cookiePayload.expiresAt * 1000),
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })

  response.cookies.set(DEMO_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
  })

  return response
}