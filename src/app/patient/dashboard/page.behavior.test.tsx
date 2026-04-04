import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import PatientDashboardHome from './page'

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'patient-1',
      user_metadata: { full_name: 'Priya Sharma' },
    },
  }),
}))

vi.mock('./DashboardSkeleton', () => ({
  DashboardSkeleton: () => <div>Loading</div>,
}))

vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ title, description, action }: { title: string; description?: string; action?: ReactNode }) => (
    <div>
      <p>{title}</p>
      {description ? <p>{description}</p> : null}
      {action}
    </div>
  ),
}))

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response
}

describe('PatientDashboardHome', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('shows a coming-soon placeholder instead of the old hardcoded recovery metric', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ appointments: [] })))

    render(<PatientDashboardHome />)

    await waitFor(() => {
      expect(screen.getAllByText(/coming soon/i).length).toBeGreaterThan(0)
    })

    expect(screen.queryByText('72%')).toBeNull()
  })

  it('renders the error state without logging handled fetch failures', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failed')))

    render(<PatientDashboardHome />)

    await waitFor(() => {
      expect(screen.getByText('Recovery feed unavailable')).toBeInTheDocument()
    })

    expect(consoleErrorSpy).not.toHaveBeenCalled()
  })
})