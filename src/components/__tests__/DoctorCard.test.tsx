/* eslint-disable @next/next/no-img-element */

import { render } from '@testing-library/react'
import DoctorCard, { type Doctor } from '../DoctorCard'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ fill, alt = '', ...props }: Record<string, unknown>) => {
    void fill
    return <img {...props} alt={String(alt)} />
  },
}))

const baseDoctor: Doctor = {
  id: 'test-1',
  name: 'Dr. Rajesh Kumar',
  credentials: 'BPT',
  specialty: 'Sports Physio',
  rating: 4.9,
  reviewCount: 120,
  location: 'Mumbai',
  distance: '2 km',
  nextSlot: 'Today 4PM',
  visitTypes: ['In-clinic'],
  fee: 600,
  icpVerified: true,
  availabilityPreview: [
    { date: '2026-04-13', slots: ['10:00 AM', '11:00 AM'] },
    { date: '2026-04-14', slots: ['02:00 PM'] },
    { date: '2026-04-15', slots: [] },
  ],
}

describe('DoctorCard', () => {
  it('shows initials when no avatarUrl', () => {
    const { getByText } = render(<DoctorCard doctor={baseDoctor} />)
    expect(getByText('RK')).toBeTruthy()
  })

  it('strips non-Dr titles when deriving initials', () => {
    const { getByText } = render(
      <DoctorCard doctor={{ ...baseDoctor, name: 'PT Priya Menon', avatarUrl: null }} />
    )

    expect(getByText('PM')).toBeTruthy()
  })

  it('shows next/image when avatarUrl is provided', () => {
    const doctor = { ...baseDoctor, avatarUrl: 'https://example.com/photo.jpg' }
    const { container } = render(<DoctorCard doctor={doctor} />)
    const img = container.querySelector('img[src="https://example.com/photo.jpg"]')
    expect(img).toBeTruthy()
  })

  it('does not render img when avatarUrl is null', () => {
    const doctor = { ...baseDoctor, avatarUrl: null }
    const { container } = render(<DoctorCard doctor={doctor} />)
    const img = container.querySelector('img[src="null"]')
    expect(img).toBeNull()
  })

  it('renders the real availability preview passed from search results', () => {
    const { getByText } = render(<DoctorCard doctor={baseDoctor} />)

    expect(getByText('10:00 AM')).toBeTruthy()
    expect(getByText('11:00 AM')).toBeTruthy()
    expect(getByText('02:00 PM')).toBeTruthy()
  })

  describe('next-availability label', () => {
    it('shows "Today at <time>" when slots are available today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-13T12:00:00+05:30'))

      try {
        const todayIso = '2026-04-13'
        const doctor: Doctor = {
          ...baseDoctor,
          nextSlot: 'Sun, Apr 13, 10:00 AM', // full date string — should NOT appear verbatim
          availabilityPreview: [
            { date: todayIso, slots: ['10:00 AM', '11:00 AM'] },
            { date: '2099-12-31', slots: ['02:00 PM'] },
          ],
        }
        const { getByText, queryByText } = render(<DoctorCard doctor={doctor} />)
        expect(getByText(/Today at 10:00 AM/)).toBeTruthy()
        // Should NOT show full date string in the label
        expect(queryByText(/Today at Sun/)).toBeNull()
      } finally {
        vi.useRealTimers()
      }
    })

    it('shows "Tomorrow at <time>" when no slots today', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-04-13T12:00:00+05:30'))

      try {
        const tomorrowIso = '2026-04-14'
        const doctor: Doctor = {
          ...baseDoctor,
          nextSlot: 'Mon, Apr 14, 09:00 AM',
          availabilityPreview: [
            { date: tomorrowIso, slots: ['09:00 AM'] },
          ],
        }
        const { getByText } = render(<DoctorCard doctor={doctor} />)
        expect(getByText(/Tomorrow at 09:00 AM/)).toBeTruthy()
      } finally {
        vi.useRealTimers()
      }
    })

    it('shows "No slots" when no availability days have slots', () => {
      const doctor: Doctor = {
        ...baseDoctor,
        nextSlot: 'Check availability',
        availabilityPreview: [
          { date: '2099-12-30', slots: [] },
          { date: '2099-12-31', slots: [] },
        ],
      }
      const { getByText } = render(<DoctorCard doctor={doctor} />)
      expect(getByText('No slots')).toBeTruthy()
    })
  })
})
