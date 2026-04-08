import type { Session } from '@supabase/supabase-js'
import type { DemoRole } from '@/lib/demo/session'
import { DEMO_LOCAL_STORAGE_KEY, DEMO_SESSION_SUPPRESSION_COOKIE } from '@/lib/demo/session'

interface DemoSessionResponse {
  session: Session
  redirectTo: string
  error?: string
}

const DEMO_SESSION_SUPPRESSION_TTL_SECONDS = 30 * 24 * 60 * 60

function clearPersistedDemoSession() {
  try {
    localStorage.removeItem(DEMO_LOCAL_STORAGE_KEY)
  } catch {
    // localStorage can be unavailable in some browser contexts.
  }
}

function setDemoSessionSuppressed(suppressed: boolean) {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = suppressed
    ? `${DEMO_SESSION_SUPPRESSION_COOKIE}=1; Max-Age=${DEMO_SESSION_SUPPRESSION_TTL_SECONDS}; Path=/; SameSite=Lax`
    : `${DEMO_SESSION_SUPPRESSION_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`
}

export function persistDemoSession(session: Session) {
  setDemoSessionSuppressed(false)

  try {
    localStorage.setItem(
      DEMO_LOCAL_STORAGE_KEY,
      JSON.stringify({
        user: session.user,
        access_token: session.access_token,
        expires_at: session.expires_at,
      })
    )
  } catch {
    // localStorage can be unavailable in some browser contexts.
  }

  window.dispatchEvent(new Event('bp-dev-auth'))
}

export async function hydrateDemoSessionFromCookie(): Promise<Session | null> {
  try {
    const response = await fetch('/api/auth/demo-session', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    if (response.status === 204) {
      clearPersistedDemoSession()
      return null
    }

    if (!response.ok) {
      clearPersistedDemoSession()
      return null
    }

    const data = (await response.json()) as Partial<DemoSessionResponse>
    if (!data.session) {
      clearPersistedDemoSession()
      return null
    }

    persistDemoSession(data.session)
    return data.session
  } catch {
    return null
  }
}

export async function launchDemoSession(role: DemoRole, returnTo?: string | null): Promise<string> {
  const response = await fetch('/api/auth/demo-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(returnTo ? { role, returnTo } : { role }),
  })

  const data = (await response.json()) as DemoSessionResponse

  if (!response.ok) {
    throw new Error(data.error ?? 'Failed to start demo session')
  }

  persistDemoSession(data.session)
  return data.redirectTo
}

export async function clearDemoSession(): Promise<void> {
  setDemoSessionSuppressed(true)
  clearPersistedDemoSession()

  try {
    await fetch('/api/auth/demo-session', {
      method: 'DELETE',
      cache: 'no-store',
      keepalive: true,
    })
  } catch {
    // Ignore demo session cleanup failures during sign-out.
  }
}