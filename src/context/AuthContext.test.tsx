import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createDemoSession, DEMO_LOCAL_STORAGE_KEY } from '@/lib/demo/session'
import { AuthProvider, useAuth } from './AuthContext'

const getUserMock = vi.fn()
const getSessionMock = vi.fn()
const onAuthStateChangeMock = vi.fn()
const signOutMock = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      getUser: getUserMock,
      getSession: getSessionMock,
      onAuthStateChange: onAuthStateChangeMock,
      signOut: signOutMock,
    },
  }),
}))

function AuthProbe() {
  const { user, loading } = useAuth()

  if (loading) {
    return <p>loading</p>
  }

  return <p>{(user?.user_metadata?.full_name as string | undefined) ?? 'no-user'}</p>
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    getUserMock.mockResolvedValue({ data: { user: null } })
    getSessionMock.mockResolvedValue({ data: { session: null } })
    onAuthStateChangeMock.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    })
    signOutMock.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('hydrates a demo session from the cookie-backed route when local storage is empty', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        session: createDemoSession('patient'),
        redirectTo: '/patient/dashboard',
      }),
    })

    vi.stubGlobal('fetch', fetchMock)

    render(
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('Aarav Kapoor')).toBeInTheDocument()
    })

    expect(fetchMock).toHaveBeenCalledWith('/api/auth/demo-session', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })
    expect(localStorage.getItem(DEMO_LOCAL_STORAGE_KEY)).toContain('Aarav Kapoor')
  })

  it('ignores stale local demo state when the cookie-backed demo session no longer exists', async () => {
    const staleSession = createDemoSession('provider')
    localStorage.setItem(DEMO_LOCAL_STORAGE_KEY, JSON.stringify({
      user: staleSession.user,
      access_token: staleSession.access_token,
      expires_at: staleSession.expires_at,
    }))

    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: 'No demo session found.' }),
    })

    vi.stubGlobal('fetch', fetchMock)

    render(
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <AuthProbe />
        </AuthProvider>
      </QueryClientProvider>,
    )

    await waitFor(() => {
      expect(screen.getByText('no-user')).toBeInTheDocument()
    })

    expect(localStorage.getItem(DEMO_LOCAL_STORAGE_KEY)).toBeNull()
  })
})