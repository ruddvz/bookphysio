'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { clearDemoSession, hydrateDemoSessionFromCookie } from '@/lib/demo/client'
import { DEMO_LOCAL_STORAGE_KEY } from '@/lib/demo/session'

interface AuthContextValue {
  session: Session | null
  user: User | null
  loading: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signOut: () => {},
})

/** Try to load a preview/demo session mirrored into localStorage by the demo-session route. */
function loadDevSession(): Session | null {
  try {
    const raw = localStorage.getItem(DEMO_LOCAL_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { user: User; access_token: string; expires_at: number }
    if (parsed.expires_at < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem(DEMO_LOCAL_STORAGE_KEY)
      return null
    }
    return {
      user: parsed.user,
      access_token: parsed.access_token,
      refresh_token: '',
      expires_in: parsed.expires_at - Math.floor(Date.now() / 1000),
      expires_at: parsed.expires_at,
      token_type: 'bearer',
    } as Session
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const queryClient = useQueryClient()

  function signOut() {
    setSession(null)
    queryClient.clear()
    clearDemoSession().catch(() => {
      // Ignore demo cleanup failures during sign-out.
    })
    const supabase = createClient()
    supabase.auth.signOut().catch(() => { /* noop on static export */ })
  }

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    supabase.auth.getUser().then(async ({ data }) => {
      if (!isMounted) {
        return
      }

      if (data.user) {
        // User is server-validated — get the full session for the access token
        const { data: sessionData } = await supabase.auth.getSession()
        if (sessionData.session) {
          setSession(sessionData.session)
        }
        clearDemoSession().catch(() => {
          // Ignore demo cleanup failures once a real auth session exists.
        })
      } else {
        // Revalidate demo access against the server-side cookie before trusting any local mirror.
        const devSession = await hydrateDemoSessionFromCookie()
        if (devSession) setSession(devSession)
      }

      if (isMounted) {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      queryClient.clear()
      setSession(newSession ?? null)

      if (newSession) {
        clearDemoSession().catch(() => {
          // Ignore demo cleanup failures once a real auth session exists.
        })
      }
    })

    // Listen for dev auth events (fired from verify-otp page)
    function handleDevAuth() {
      queryClient.clear()
      const devSession = loadDevSession()
      setSession(devSession)
    }
    window.addEventListener('bp-dev-auth', handleDevAuth)

    return () => {
      isMounted = false
      subscription.unsubscribe()
      window.removeEventListener('bp-dev-auth', handleDevAuth)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
