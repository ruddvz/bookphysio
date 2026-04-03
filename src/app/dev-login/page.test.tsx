import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DevLoginPage from './page'

const pushMock = vi.fn()
const launchDemoSessionMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('@/lib/demo/client', () => ({
  launchDemoSession: (...args: unknown[]) => launchDemoSessionMock(...args),
}))

describe('DevLoginPage', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development')
    pushMock.mockReset()
    launchDemoSessionMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('launches a demo session instead of redirecting through dev-signup', async () => {
    launchDemoSessionMock.mockResolvedValue('/patient/dashboard')

    render(<DevLoginPage />)
    fireEvent.click(screen.getByText('Patient').closest('button')!)

    await waitFor(() => {
      expect(launchDemoSessionMock).toHaveBeenCalledWith('patient')
      expect(pushMock).toHaveBeenCalledWith('/patient/dashboard')
    })
  })

  it('shows demo launch failures to the user', async () => {
    launchDemoSessionMock.mockRejectedValue(new Error('Demo access failed'))

    render(<DevLoginPage />)
    fireEvent.click(screen.getByText('Admin').closest('button')!)

    await waitFor(() => {
      expect(screen.getByText('Demo access failed')).toBeInTheDocument()
    })
    expect(pushMock).not.toHaveBeenCalled()
  })
})