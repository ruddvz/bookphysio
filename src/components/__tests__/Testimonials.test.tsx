import { render, screen } from '@testing-library/react'
import useSWR from 'swr'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Testimonials from '@/components/Testimonials'

vi.mock('swr', () => ({
  __esModule: true,
  default: vi.fn(),
}))

const mockedUseSWR = useSWR as unknown as {
  mockReturnValue: (value: unknown) => void
}

describe('Testimonials', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders live published reviews instead of the static promises cards', () => {
    mockedUseSWR.mockReturnValue({
      data: {
        reviews: [
          {
            id: 'review-1',
            rating: 5,
            comment: 'Helped me get back to running in three weeks.',
            created_at: 'Apr 2026',
            provider: { full_name: 'Ravi Kumar', title: 'Dr.', specialty: 'Sports Physio' },
          },
        ],
      },
      error: undefined,
      isLoading: false,
    })

    render(<Testimonials />)

    expect(mockedUseSWR).toHaveBeenCalledWith(
      '/api/reviews?limit=3',
      expect.any(Function),
      { revalidateOnFocus: false },
    )
    expect(screen.getByText(/helped me get back to running/i)).toBeInTheDocument()
    expect(screen.getByText('Dr. Ravi Kumar')).toBeInTheDocument()
    expect(screen.queryByText('Verified credentials')).not.toBeInTheDocument()
  })
})
