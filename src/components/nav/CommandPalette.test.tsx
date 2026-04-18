import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CommandPalette } from './CommandPalette'

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
    pushMock.mockClear()
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

  it('wires combobox accessibility to the results list', () => {
    render(<CommandPalette />)
    fireEvent.click(screen.getByTestId('command-palette-trigger'))

    const input = screen.getByRole('combobox', { name: /command palette search/i })
    const listbox = screen.getByRole('listbox', { name: /command palette results/i })

    expect(input).toHaveAttribute('aria-controls', listbox.id)

    fireEvent.change(input, { target: { value: 'about' } })
    fireEvent.keyDown(input, { key: 'ArrowDown' })

    const option = screen.getByRole('option', { name: /About/i })
    expect(input).toHaveAttribute('aria-activedescendant', option.id)
    expect(option).toHaveAttribute('aria-selected', 'true')
  })
})
