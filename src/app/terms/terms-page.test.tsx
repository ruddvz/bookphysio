import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TermsPageClient } from './TermsPageClient'

const useUiV2Mock = vi.fn<() => boolean>(() => false)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

describe('TermsPageClient', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(false)
  })

  it('shows inline last updated in v1', () => {
    render(<TermsPageClient />)
    expect(screen.getByText(/Last updated: April 2026/i)).toBeInTheDocument()
  })

  it('shows v2 TOC when ui-v2 is on', () => {
    useUiV2Mock.mockReturnValue(true)
    render(<TermsPageClient />)
    expect(screen.getByRole('navigation', { name: 'Page sections' })).toBeInTheDocument()
  })
})
