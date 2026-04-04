import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import {
  createDemoCookiePayload,
  createDemoSession,
  DEMO_SESSION_COOKIE,
  DEMO_SESSION_SUPPRESSION_COOKIE,
  encodeDemoCookie,
  getDemoSessionFromCookies,
  isDemoAccessEnabled,
  resolvePostAuthRedirect,
} from '@/lib/demo/session'
import { hasValidPreviewCookie } from '@/lib/preview/token'

const demoAccessSchema = z.object({
  role: z.enum(['patient', 'provider', 'admin']),
  returnTo: z.string().optional(),
})

function createEmptyDemoSessionResponse() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export async function GET(request: NextRequest) {
  const demoSession = await getDemoSessionFromCookies(request.cookies)

  if (!demoSession) {
    return createEmptyDemoSessionResponse()
  }

  return NextResponse.json(
    {
      session: createDemoSession(demoSession.role, demoSession.expiresAt),
      redirectTo: resolvePostAuthRedirect(demoSession.role, request.nextUrl.searchParams.get('returnTo')),
    },
    {
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  )
}

export async function POST(request: NextRequest) {
  const previewAccessAllowed = await hasValidPreviewCookie(request)

  if (!isDemoAccessEnabled() && !previewAccessAllowed) {
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
    session: createDemoSession(parsed.data.role, cookiePayload.expiresAt),
    redirectTo,
  })

  response.cookies.set(DEMO_SESSION_COOKIE, await encodeDemoCookie(cookiePayload), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(cookiePayload.expiresAt * 1000),
  })
  response.cookies.set(DEMO_SESSION_SUPPRESSION_COOKIE, '', {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: new Date(0),
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
  response.cookies.set(DEMO_SESSION_SUPPRESSION_COOKIE, '1', {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  })

  return response
}