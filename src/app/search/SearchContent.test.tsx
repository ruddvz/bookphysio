import type { ReactNode } from 'react'
import { render, screen } from '@testing-library/react'
import type { SWRResponse } from 'swr'
import useSWR from 'swr'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ProviderCard } from '@/app/api/contracts/provider'
import type { SearchResponse } from '@/app/api/contracts/search'
import SearchContent from './SearchContent'

const pushMock = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}))

vi.mock('@/components/FeaturedDoctors', () => ({
  __esModule: true,
  default: () => <div data-testid="featured-doctors">Featured doctors</div>,
}))

vi.mock('@/components/DoctorCard', () => ({
  __esModule: true,
  default: ({ doctor }: { doctor: { name: string; avatarUrl?: string | null } }) => (
    <div data-testid="doctor-card" data-avatar-url={doctor.avatarUrl ?? ''}>
      {doctor.name}
    </div>
  ),
}))

vi.mock('@/components/DoctorCardSkeleton', () => ({
  DoctorCardSkeleton: () => <div data-testid="doctor-card-skeleton" />,
}))

vi.mock('@/components/ui/EmptyState', () => ({
  EmptyState: ({ title }: { title: string }) => <div data-testid="empty-state">{title}</div>,
}))

vi.mock('./SearchFilters', () => ({
  __esModule: true,
  default: ({ total }: { total: number }) => <div data-testid="search-filters">{total}</div>,
}))

const mockedUseSWR = useSWR as unknown as {
  mockReturnValue: (value: SWRResponse<SearchResponse, Error>) => void
}

const mockProviders: ProviderCard[] = [
  {
    id: 'provider-1',
    slug: 'priya-menon',
    full_name: 'Priya Menon',
    title: 'PT',
    avatar_url: 'https://example.com/priya.jpg',
    verified: true,
    specialties: [{ id: 's1', name: 'Sports Physio', slug: 'sports-physio', icon_url: null }],
    rating_avg: 4.9,
    rating_count: 120,
    experience_years: 8,
    consultation_fee_inr: 700,
    next_available_slot: null,
    visit_types: ['in_clinic'],
    city: 'Mumbai',
    lat: null,
    lng: null,
  },
]

function mockSearchResponse(providers: ProviderCard[]): SearchResponse {
  return {
    providers,
    total: providers.length,
    page: 1,
    limit: 40,
  }
}

function mockSearchSWR(response: Partial<SWRResponse<SearchResponse, Error>>) {
  mockedUseSWR.mockReturnValue(response as SWRResponse<SearchResponse, Error>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('SearchContent', () => {
  it('renders FeaturedDoctors above live results and passes avatarUrl into DoctorCard', () => {
    mockSearchSWR({
      data: mockSearchResponse(mockProviders),
      error: undefined,
      isLoading: false,
      mutate: vi.fn() as unknown as SWRResponse<SearchResponse, Error>['mutate'],
    })

    render(<SearchContent />)

    expect(screen.getByTestId('featured-doctors')).toBeTruthy()

    const doctorCard = screen.getByTestId('doctor-card')
    expect(doctorCard.getAttribute('data-avatar-url')).toBe('https://example.com/priya.jpg')
    expect(doctorCard.textContent).toContain('PT Priya Menon')
  })

  it('does not render FeaturedDoctors when search results are empty', () => {
    mockSearchSWR({
      data: mockSearchResponse([]),
      error: undefined,
      isLoading: false,
      mutate: vi.fn() as unknown as SWRResponse<SearchResponse, Error>['mutate'],
    })

    render(<SearchContent />)

    expect(screen.queryByTestId('featured-doctors')).toBeNull()
    expect(screen.getByTestId('empty-state').textContent).toContain('No exact matches found')
  })
})