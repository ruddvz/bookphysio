import { render } from '@testing-library/react'
import DoctorCard, { type Doctor } from '../DoctorCard'
import { vi } from 'vitest'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }))
vi.mock('next/image', () => ({ __esModule: true, default: (props: Record<string, unknown>) => <img {...props} /> }))

const baseDoctor: Doctor = {
  id: 'test-1',
  name: 'Dr. Ravi Kumar',
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
}

describe('DoctorCard', () => {
  it('shows initials when no avatarUrl', () => {
    const { getByText } = render(<DoctorCard doctor={baseDoctor} />)
    expect(getByText('RK')).toBeTruthy()
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
})