'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

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

/** Try to load dev session from localStorage (used on static export / GitHub Pages) */
function loadDevSession(): Session | null {
  try {
    const raw = localStorage.getItem('bp-dev-session')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { user: User; access_token: string; expires_at: number }
    if (parsed.expires_at < Math.floor(Date.now() / 1000)) {
      localStorage.removeItem('bp-dev-session')
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

  function signOut() {
    setSession(null)
    try { localStorage.removeItem('bp-dev-session') } catch { /* noop */ }
    const supabase = createClient()
    supabase.auth.signOut().catch(() => { /* noop on static export */ })
  }

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setSession(data.session)
      } else {
        // Fallback to dev session (for static export / GitHub Pages)
        const devSession = loadDevSession()
        if (devSession) setSession(devSession)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    // Listen for dev auth events (fired from verify-otp page)
    function handleDevAuth() {
      const devSession = loadDevSession()
      if (devSession) setSession(devSession)
    }
    window.addEventListener('bp-dev-auth', handleDevAuth)

    return () => {
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
