import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import useSWR from 'swr'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProviderCard } from '@/app/api/contracts/provider'
import type { SearchResponse } from '@/app/api/contracts/search'
import ProofSection from '@/components/ProofSection'

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}))

const mockedUseSWR = useSWR as unknown as {
  mockReturnValue: (value: unknown) => void
}

const providers: ProviderCard[] = [
  {
    id: 'provider-1',
    slug: 'dr-ravi-kumar',
    full_name: 'Ravi Kumar',
    title: 'Dr.',
    avatar_url: null,
    verified: true,
    specialties: [{ id: 'sports', name: 'Sports Physio', slug: 'sports', icon_url: null }],
    rating_avg: 4.9,
    rating_count: 120,
    experience_years: 8,
    consultation_fee_inr: 800,
    next_available_slot: '2026-04-13T10:00:00.000Z',
    visit_types: ['in_clinic'],
    city: 'Mumbai',
    lat: null,
    lng: null,
  },
]

function mockSearchResponse(input: ProviderCard[]): SearchResponse {
  return {
    providers: input,
    total: input.length,
    page: 1,
    limit: 3,
  }
}

describe('ProofSection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches live providers instead of rendering hardcoded mock cards', () => {
    mockedUseSWR.mockReturnValue({
      data: mockSearchResponse(providers),
      error: undefined,
      isLoading: false,
    })

    render(<ProofSection />)

    expect(mockedUseSWR).toHaveBeenCalledWith(
      '/api/providers?limit=3&sort=rating',
      expect.any(Function),
      { revalidateOnFocus: false },
    )
    expect(screen.getByText('Dr. Ravi Kumar')).toBeInTheDocument()
    expect(screen.getByText(/sports physio · mumbai/i)).toBeInTheDocument()
  })
})
