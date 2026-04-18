import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PrivacyPageClient } from './PrivacyPageClient'

const useUiV2Mock = vi.fn<() => boolean>(() => false)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

describe('PrivacyPageClient', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(false)
  })

  it('shows inline last updated in v1', () => {
    render(<PrivacyPageClient />)
    expect(screen.getByText(/Last updated: April 2026/i)).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Page sections' })).toBeNull()
  })

  it('shows v2 TOC and badge when ui-v2 is on', () => {
    useUiV2Mock.mockReturnValue(true)
    render(<PrivacyPageClient />)
    expect(screen.getAllByText(/Last updated: April 2026/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('navigation', { name: 'Page sections' })).toBeInTheDocument()
  })
})
