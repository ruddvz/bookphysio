import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AboutPageClient } from './AboutPageClient'

const useUiV2Mock = vi.fn<() => boolean>(() => false)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

describe('AboutPageClient', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(false)
  })

  it('does not render v2 TOC badge when ui-v2 is off', () => {
    render(<AboutPageClient />)
    expect(screen.queryByText(/Last updated:/i)).toBeNull()
  })

  it('renders last updated badge and TOC when ui-v2 is on', () => {
    useUiV2Mock.mockReturnValue(true)
    render(<AboutPageClient />)
    expect(screen.getByText(/Last updated: April 2026/i)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Page sections' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Why we built this/i })).toHaveAttribute(
      'href',
      '#why-we-built-this',
    )
  })
})
