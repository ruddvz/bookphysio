import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PreviewGate from './PreviewGate'

const pushMock = vi.fn()
const launchDemoSessionMock = vi.fn()
const clearDemoSessionMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}))

vi.mock('@/lib/demo/client', () => ({
  launchDemoSession: (...args: unknown[]) => launchDemoSessionMock(...args),
  clearDemoSession: (...args: unknown[]) => clearDemoSessionMock(...args),
}))

describe('PreviewGate', () => {
  beforeEach(() => {
    pushMock.mockReset()
    launchDemoSessionMock.mockReset()
    clearDemoSessionMock.mockReset()
  })

  it('launches the selected role via the demo-session flow', async () => {
    launchDemoSessionMock.mockResolvedValue('/provider/dashboard')

    render(<PreviewGate unlocked />)
    fireEvent.click(screen.getByText('Physiotherapist').closest('button')!)

    await waitFor(() => {
      expect(launchDemoSessionMock).toHaveBeenCalledWith('provider')
      expect(pushMock).toHaveBeenCalledWith('/provider/dashboard')
    })
  })

  it('surfaces preview launch errors inline', async () => {
    launchDemoSessionMock.mockRejectedValue(new Error('Preview unavailable'))

    render(<PreviewGate unlocked />)
    fireEvent.click(screen.getByText('Admin').closest('button')!)

    await waitFor(() => {
      expect(screen.getByText('Preview unavailable')).toBeInTheDocument()
    })
    expect(pushMock).not.toHaveBeenCalled()
  })
})