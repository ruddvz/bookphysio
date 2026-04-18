import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandPalette } from './CommandPalette'

const useUiV2Mock = vi.fn(() => true)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: null, loading: false }),
}))

const useQueryMock = vi.fn(() => ({ data: null, isLoading: false }))
vi.mock('@tanstack/react-query', async (orig) => {
  const actual = await orig<typeof import('@tanstack/react-query')>()
  return {
    ...actual,
    useQuery: () => useQueryMock(),
  }
})

const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, replace: vi.fn(), prefetch: vi.fn() }),
}))

describe('CommandPalette', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(true)
    pushMock.mockClear()
  })

  it('renders nothing when ui-v2 is off', () => {
    useUiV2Mock.mockReturnValue(false)
    const { container } = render(<CommandPalette />)
    expect(container.firstChild).toBeNull()
  })

  it('opens on ⌘K and closes on Escape', () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(screen.getByTestId('command-palette-backdrop')).toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByTestId('command-palette-backdrop')).toBeNull()
  })

  it('filters jump links when typing in search', () => {
    render(<CommandPalette />)
    fireEvent.click(screen.getByTestId('command-palette-trigger'))
    const input = screen.getByTestId('command-palette-input')
    fireEvent.change(input, { target: { value: 'about' } })
    expect(screen.getByRole('option', { name: /About/i })).toBeInTheDocument()
  })
})
