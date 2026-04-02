import type { Session } from '@supabase/supabase-js'
import type { DemoRole } from '@/lib/demo/session'
import { DEMO_LOCAL_STORAGE_KEY } from '@/lib/demo/session'

interface DemoSessionResponse {
  session: Session
  redirectTo: string
  error?: string
}

function persistDemoSession(session: Session) {
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
  try {
    localStorage.removeItem(DEMO_LOCAL_STORAGE_KEY)
  } catch {
    // localStorage can be unavailable in some browser contexts.
  }

  try {
    await fetch('/api/auth/demo-session', { method: 'DELETE' })
  } catch {
    // Ignore demo session cleanup failures during sign-out.
  }
}