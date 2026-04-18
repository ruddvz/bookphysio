import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivacyPageClient } from './PrivacyPageClient'

const useUiV2Mock = vi.fn<() => boolean>(() => false)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

function renderWithClient(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe('PrivacyPageClient', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(false)
  })

  it('shows inline last updated in v1', () => {
    renderWithClient(<PrivacyPageClient />)
    expect(screen.getByText(/Last updated: April 2026/i)).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Page sections' })).toBeNull()
  })

  it('shows v2 TOC and badge when ui-v2 is on', () => {
    useUiV2Mock.mockReturnValue(true)
    renderWithClient(<PrivacyPageClient />)
    expect(screen.getAllByText(/Last updated: April 2026/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('navigation', { name: 'Page sections' })).toBeInTheDocument()
  })
})
