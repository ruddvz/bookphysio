import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AboutPageClient } from './AboutPageClient'

const useUiV2Mock = vi.fn<() => boolean>(() => false)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

function renderWithClient(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('AboutPageClient', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(false)
  })

  it('does not render v2 TOC badge when ui-v2 is off', () => {
    renderWithClient(<AboutPageClient />)
    expect(screen.queryByText(/Last updated:/i)).toBeNull()
  })

  it('renders last updated badge and TOC when ui-v2 is on', () => {
    useUiV2Mock.mockReturnValue(true)
    renderWithClient(<AboutPageClient />)
    expect(screen.getByText(/Last updated: April 2026/i)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Page sections' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Why we built this/i })).toHaveAttribute(
      'href',
      '#why-we-built-this',
    )
  })
})
