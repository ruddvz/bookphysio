import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import React from 'react'

// ── flag mock ──────────────────────────────────────────────────────────────
let mockV2 = false
let mockSearchParams = ''
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => mockV2 }))
function setV2(value: boolean) { mockV2 = value }
function setSearchParams(value: string) { mockSearchParams = value }
beforeEach(() => {
  mockV2 = false
  mockSearchParams = ''
})

// ── dependency mocks ───────────────────────────────────────────────────────
vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams(mockSearchParams),
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('swr', () => ({
  default: () => ({
    data: {
      providers: [
        {
          id: 'p1',
          full_name: 'Dr. Anita Sharma',
          specialties: [{ name: 'Ortho Physio' }],
          rating_avg: 4.8,
          rating_count: 40,
          city: 'Mumbai',
          consultation_fee_inr: 700,
          verified: true,
          visit_types: ['in_clinic'],
          next_available_slot: null,
          availability_preview: [],
        },
      ],
      total: 1,
    },
    error: undefined,
    isLoading: false,
    mutate: vi.fn(),
  }),
}))

vi.mock('@/components/FeaturedDoctors', () => ({ default: () => <div /> }))
vi.mock('@/components/specialties/SpecialtyCTARail', () => ({
  SpecialtyCTARail: () => <div data-testid="specialty-cta-rail" />,
}))
vi.mock('./SearchFilters', () => ({ default: () => <div /> }))

import SearchContent from './SearchContent'

describe('SearchContent — sort controls', () => {
  it('v1: renders <select> sort dropdown, not chips', () => {
    setV2(false)
    render(<SearchContent />)
    expect(screen.getByRole('combobox', { name: /sort results/i })).toBeTruthy()
    expect(screen.queryByTestId('sort-chips')).toBeNull()
  })

  it('v2: renders sort chips, not <select>', () => {
    setV2(true)
    render(<SearchContent />)
    expect(screen.getByTestId('sort-chips')).toBeTruthy()
    expect(screen.queryByRole('combobox', { name: /sort results/i })).toBeNull()
  })

  it('v2: chip count matches SORT_OPTIONS (4)', () => {
    setV2(true)
    render(<SearchContent />)
    const chips = within(screen.getByTestId('sort-chips')).getAllByRole('button')
    expect(chips.length).toBe(4)
  })

  it('v2: active chip has aria-pressed=true, others false', () => {
    setV2(true)
    render(<SearchContent />)
    const chips = within(screen.getByTestId('sort-chips')).getAllByRole('button')
    const active = chips.find((c) => c.getAttribute('aria-pressed') === 'true')
    expect(active).toBeTruthy()
    expect(active?.textContent).toBe('Relevance')
  })

  it('v2: clicking a chip updates active state', () => {
    setV2(true)
    render(<SearchContent />)
    const topRated = screen.getByRole('button', { name: 'Top Rated' })
    fireEvent.click(topRated)
    expect(topRated.getAttribute('aria-pressed')).toBe('true')
  })
})

describe('SearchContent — SpecialtyCTARail', () => {
  it('v1: does not render SpecialtyCTARail even with specialty param', () => {
    setSearchParams('specialty=Ortho+Physio')
    setV2(false)
    render(<SearchContent />)
    expect(screen.queryByTestId('specialty-cta-rail')).toBeNull()
  })

  it('v2 with specialty: renders SpecialtyCTARail', () => {
    setSearchParams('specialty=Ortho+Physio')
    setV2(true)
    render(<SearchContent />)
    expect(screen.getByTestId('specialty-cta-rail')).toBeTruthy()
  })

  it('v2 without specialty: no SpecialtyCTARail', () => {
    setV2(true)
    render(<SearchContent />)
    expect(screen.queryByTestId('specialty-cta-rail')).toBeNull()
  })
})

describe('SearchContent — DoctorCard integration', () => {
  it('renders at least one doctor card', () => {
    setV2(false)
    render(<SearchContent />)
    expect(screen.getByText(/Dr\. Anita Sharma/i)).toBeTruthy()
  })
})
