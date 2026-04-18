import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Doctor } from '@/components/DoctorCard'
import SearchResultsReels from './SearchResultsReels'

const useUiV2Mock = vi.fn()

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => useUiV2Mock(),
}))

vi.mock('@/components/DoctorCardCompact', () => ({
  DoctorCardCompact: ({ doctor }: { doctor: Doctor }) => (
    <div data-testid="compact-card">{doctor.name}</div>
  ),
}))

const baseDoctor = (id: string, name: string): Doctor => ({
  id,
  name,
  credentials: 'Sports Physio',
  specialty: 'Sports Physio',
  rating: 4.5,
  reviewCount: 10,
  location: 'Mumbai',
  distance: '2 km',
  nextSlot: '—',
  visitTypes: ['In-clinic'],
  fee: 800,
  icpVerified: true,
})

describe('SearchResultsReels', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(true)
    Element.prototype.scrollIntoView = vi.fn()
    global.IntersectionObserver = class {
      observe = vi.fn()
      unobserve = vi.fn()
      disconnect = vi.fn()
      takeRecords = vi.fn(() => [])
      root = null
      rootMargin = ''
      thresholds = []
    } as unknown as typeof IntersectionObserver
  })

  it('renders one slide per result with snap classes and aria-label', () => {
    const results = [baseDoctor('1', 'Dr. A'), baseDoctor('2', 'Dr. B')]
    const { container } = render(<SearchResultsReels results={results} />)

    const slides = container.querySelectorAll('.snap-start.snap-always')
    expect(slides).toHaveLength(2)
    expect(screen.getByLabelText('Result 1 of 2')).toBeTruthy()
    expect(screen.getByLabelText('Result 2 of 2')).toBeTruthy()
    expect(screen.getAllByTestId('compact-card')).toHaveLength(2)
  })

  it('returns null when useUiV2 is false', () => {
    useUiV2Mock.mockReturnValue(false)
    const { container } = render(<SearchResultsReels results={[baseDoctor('1', 'Dr. A')]} />)
    expect(container.firstChild).toBeNull()
  })
})
