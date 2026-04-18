import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FAQPageClient } from './FAQPageClient'

const useUiV2Mock = vi.fn<() => boolean>(() => false)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

describe('FAQPageClient', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(false)
  })

  it('uses category sidebar in v1', () => {
    render(<FAQPageClient />)
    expect(screen.getByRole('heading', { name: 'Categories' })).toBeInTheDocument()
    expect(screen.queryByText(/Last updated:/i)).toBeNull()
  })

  it('shows v2 badge and section TOC when ui-v2 is on', () => {
    useUiV2Mock.mockReturnValue(true)
    render(<FAQPageClient />)
    expect(screen.getByText(/Last updated: April 2026/i)).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Page sections' })).toBeInTheDocument()
  })
})
