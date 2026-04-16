import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const pushMock = vi.fn()

vi.mock('next/navigation', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useRouter: () => ({
      push: pushMock,
      replace: vi.fn(),
      prefetch: vi.fn(),
    }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => '/',
  }
})

import { CommandPaletteHint } from './CommandPaletteHint'

describe('CommandPaletteHint', () => {
  beforeEach(() => {
    pushMock.mockClear()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders a Search label and a keyboard shortcut hint', () => {
    render(<CommandPaletteHint />)
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument()
    // Shortcut glyph — either ⌘K (mac) or Ctrl+K (non-mac). Both map to the same key combo.
    expect(screen.getByTestId('cmd-palette-shortcut')).toBeInTheDocument()
  })

  it('navigates to the search page on click', () => {
    render(<CommandPaletteHint />)
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(pushMock).toHaveBeenCalledWith('/search')
  })

  it('navigates to the search page when the user presses Cmd+K', () => {
    render(<CommandPaletteHint />)
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(pushMock).toHaveBeenCalledWith('/search')
  })

  it('navigates to the search page when the user presses Ctrl+K', () => {
    render(<CommandPaletteHint />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    expect(pushMock).toHaveBeenCalledWith('/search')
  })

  it('ignores plain "k" without a modifier', () => {
    render(<CommandPaletteHint />)
    fireEvent.keyDown(window, { key: 'k' })
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('supports a custom destination href', () => {
    render(<CommandPaletteHint href="/hi/search" />)
    fireEvent.click(screen.getByRole('button', { name: /search/i }))
    expect(pushMock).toHaveBeenCalledWith('/hi/search')
  })

  it('removes the global listener on unmount', () => {
    const { unmount } = render(<CommandPaletteHint />)
    unmount()
    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    expect(pushMock).not.toHaveBeenCalled()
  })
})
