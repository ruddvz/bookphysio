/* eslint-disable @next/next/no-img-element */

import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import type { SWRResponse } from 'swr'
import useSWR from 'swr'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProviderCard } from '@/app/api/contracts/provider'
import type { SearchResponse } from '@/app/api/contracts/search'
import FeaturedDoctors from '@/components/FeaturedDoctors'

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, alt = '', ...props }: Record<string, unknown>) => {
    void fill
    return <img {...props} alt={String(alt)} />
  },
}))
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))
vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}))

const mockProviders: ProviderCard[] = [
  {
    id: '1', slug: 'dr-ravi', full_name: 'Dr. Ravi Kumar', title: 'Dr.', avatar_url: null,
    verified: true, specialties: [{ id: 's1', name: 'Sports Physio', slug: 'sports', icon_url: null }],
    rating_avg: 4.9, rating_count: 120, experience_years: 8,
    consultation_fee_inr: 600, next_available_slot: null,
    visit_types: ['in_clinic'], city: 'Mumbai', lat: null, lng: null,
  },
  {
    id: '2', slug: 'dr-priya', full_name: 'Dr. Priya Menon', title: 'Dr.', avatar_url: 'https://example.com/priya.jpg',
    verified: true, specialties: [{ id: 's2', name: 'Neuro Rehab', slug: 'neuro', icon_url: null }],
    rating_avg: 4.8, rating_count: 89, experience_years: 5,
    consultation_fee_inr: 700, next_available_slot: null,
    visit_types: ['home_visit'], city: 'Delhi', lat: null, lng: null,
  },
  {
    id: '3', slug: 'dr-aisha', full_name: 'Dr. Aisha Khan', title: 'Dr.', avatar_url: null,
    verified: true, specialties: [{ id: 's3', name: 'Pain Management', slug: 'pain-management', icon_url: null }],
    rating_avg: 4.5, rating_count: 64, experience_years: 6,
    consultation_fee_inr: 650, next_available_slot: null,
    visit_types: ['in_clinic', 'home_visit'], city: 'Pune', lat: null, lng: null,
  },
  {
    id: '4', slug: 'ananya-shah', full_name: 'Ananya Shah', title: 'PT', avatar_url: null,
    verified: true, specialties: [{ id: 's4', name: 'Paediatric Physio', slug: 'paediatric-physio', icon_url: null }],
    rating_avg: 4.4, rating_count: 52, experience_years: 4,
    consultation_fee_inr: 550, next_available_slot: null,
    visit_types: ['in_clinic'], city: 'Chennai', lat: null, lng: null,
  },
]

const mockedUseSWR = useSWR as unknown as {
  mockReturnValue: (value: SWRResponse<SearchResponse, Error>) => void
}

function mockSearchResponse(providers: ProviderCard[]): SearchResponse {
  return {
    providers,
    total: providers.length,
    page: 1,
    limit: 4,
  }
}

function mockSWR(response: Partial<SWRResponse<SearchResponse, Error>>) {
  mockedUseSWR.mockReturnValue(response as SWRResponse<SearchResponse, Error>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FeaturedDoctors', () => {
  it('fetches the featured providers endpoint and renders the section heading', () => {
    mockSWR({ data: mockSearchResponse(mockProviders), error: undefined, isLoading: false })

    render(<FeaturedDoctors />)

    expect(mockedUseSWR).toHaveBeenCalledWith(
      '/api/providers?limit=4',
      expect.any(Function),
      { revalidateOnFocus: false }
    )
    expect(screen.getByRole('heading', { name: /top-rated on bookphysio/i })).toBeTruthy()
  })

  it('sorts featured doctors by rating and links each card to the doctor profile', () => {
    mockSWR({
      data: mockSearchResponse([mockProviders[2], mockProviders[1], mockProviders[0]]),
      error: undefined,
      isLoading: false,
    })

    render(<FeaturedDoctors />)

    const profileLinks = screen.getAllByRole('link')

    expect(profileLinks.map((link: HTMLElement) => link.getAttribute('href'))).toEqual([
      '/doctor/1',
      '/doctor/2',
      '/doctor/3',
    ])
    expect(profileLinks[0]?.textContent).toContain('Dr. Ravi Kumar')
    expect(profileLinks[1]?.textContent).toContain('Dr. Priya Menon')
    expect(profileLinks[2]?.textContent).toContain('Dr. Aisha Khan')
  })

  it('renders the doctor photo when avatar_url exists and initials otherwise', () => {
    mockSWR({ data: mockSearchResponse(mockProviders), error: undefined, isLoading: false })

    const { container } = render(<FeaturedDoctors />)

    const img = container.querySelector('img[src="https://example.com/priya.jpg"]')

    expect(img).toBeTruthy()
    expect(screen.getByText('RK')).toBeTruthy()
  })

  it('preserves non-Dr titles from provider data', () => {
    mockSWR({ data: mockSearchResponse([mockProviders[3]]), error: undefined, isLoading: false })

    render(<FeaturedDoctors />)

    expect(screen.getByText('PT Ananya Shah')).toBeTruthy()
  })

  it('shows four loading skeletons while data is loading', () => {
    mockSWR({ data: undefined, error: undefined, isLoading: true })

    render(<FeaturedDoctors />)

    expect(screen.getAllByTestId('featured-skeleton')).toHaveLength(4)
  })

  it('returns null on fetch error', () => {
    mockSWR({ data: undefined, error: new Error('failed to fetch'), isLoading: false })

    const { container } = render(<FeaturedDoctors />)

    expect(container.firstChild).toBeNull()
  })

  it('returns null when the featured result set is empty', () => {
    mockSWR({ data: mockSearchResponse([]), error: undefined, isLoading: false })

    const { container } = render(<FeaturedDoctors />)

    expect(container.firstChild).toBeNull()
  })
})
