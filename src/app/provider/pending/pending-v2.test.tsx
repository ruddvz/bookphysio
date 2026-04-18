import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PendingStepperV2 } from './PendingV2'
import ProviderPendingPage from './page'

const useUiV2Mock = vi.fn<() => boolean>(() => false)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => useUiV2Mock(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ auth: { signOut: vi.fn() } }),
}))

describe('PendingStepperV2', () => {
  it('shows Done badges twice', () => {
    render(<PendingStepperV2 />)
    const done = screen.getAllByText('Done')
    expect(done).toHaveLength(2)
  })

  it('shows Pending badge', () => {
    render(<PendingStepperV2 />)
    expect(screen.getByText('Pending')).toBeInTheDocument()
  })

  it('shows Locked badge', () => {
    render(<PendingStepperV2 />)
    expect(screen.getByText('Locked')).toBeInTheDocument()
  })
})

describe('ProviderPendingPage', () => {
  beforeEach(() => {
    useUiV2Mock.mockReset()
  })

  it('renders PendingStepperV2 when ui-v2 flag is on', () => {
    useUiV2Mock.mockReturnValue(true)
    render(<ProviderPendingPage />)
    expect(screen.getByTestId('pending-stepper-v2')).toBeInTheDocument()
  })

  it('does not render PendingStepperV2 when ui-v2 flag is off', () => {
    useUiV2Mock.mockReturnValue(false)
    render(<ProviderPendingPage />)
    expect(screen.queryByTestId('pending-stepper-v2')).toBeNull()
  })

  it('always renders sign out', () => {
    useUiV2Mock.mockReturnValue(true)
    const { unmount } = render(<ProviderPendingPage />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
    unmount()
    useUiV2Mock.mockReturnValue(false)
    render(<ProviderPendingPage />)
    expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument()
  })
})
