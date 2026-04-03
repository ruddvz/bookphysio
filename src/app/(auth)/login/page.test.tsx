import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoginPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/components/BpLogo', () => ({
  default: () => <div>BookPhysio Logo</div>,
}))

vi.mock('@/components/auth/DemoAccessPanel', () => ({
  DemoAccessPanel: () => <div>Demo access panel</div>,
}))

describe('LoginPage', () => {
  it('shows the demo access section', () => {
    render(<LoginPage />)

    expect(screen.getByText(/demo access panel/i)).toBeInTheDocument()
  })
})