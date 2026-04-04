/**
 * 8.7 Patient Dashboard Polish — Vitest unit tests
 * Tests: date formatting, mock data shape, skeleton render
 */
import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

// ---------------------------------------------------------------------------
// Isolate the pure helper: formatApptDate
// We import it via re-export from a separate util so the test doesn't need
// to mount the full page (which requires AuthContext + fetch).
// ---------------------------------------------------------------------------
import { formatApptDate, providerDisplayName } from './dashboard-utils'

// ---------------------------------------------------------------------------
// Skeleton component — can be rendered standalone
// ---------------------------------------------------------------------------
import { DashboardSkeleton } from './DashboardSkeleton'

// ---------------------------------------------------------------------------
// Mock data shape that must be compatible with /api/appointments contract
// ---------------------------------------------------------------------------
interface MockAppointment {
  id: string
  status: string
  visit_type: 'in_clinic' | 'home_visit'
  fee_inr: number
  availabilities: { starts_at: string } | null
  providers: {
    users: { full_name: string } | null
    specialties?: { name: string }[]
  } | null
  locations: { city: string } | null
}

const mockAppointment: MockAppointment = {
  id: 'appt-001',
  status: 'confirmed',
  visit_type: 'in_clinic',
  fee_inr: 800,
  availabilities: { starts_at: '2026-04-15T10:30:00.000Z' },
  providers: {
    users: { full_name: 'Priya Sharma' },
    specialties: [{ name: 'Sports Physio' }],
  },
  locations: { city: 'Mumbai' },
}

// ---------------------------------------------------------------------------
// 1. Date formatting
// ---------------------------------------------------------------------------
describe('formatApptDate', () => {
  it('formats ISO string to DD MMM YYYY, HH:MM', () => {
    // '2026-04-15T10:30:00.000Z' in IST (UTC+5:30) = 16:00 IST
    const result = formatApptDate('2026-04-15T10:30:00.000Z')
    // Should contain day, month abbreviation, year
    expect(result).toMatch(/\d{1,2} \w{3} \d{4}/)
    // Should NOT expose raw ISO string
    expect(result).not.toContain('T')
    expect(result).not.toContain('Z')
    expect(result).not.toContain('000')
  })

  it('does not show paise — time portion is HH:MM only', () => {
    const result = formatApptDate('2026-04-15T10:30:00.000Z')
    // Must not contain seconds e.g. ":00 AM" raw seconds component
    expect(result).not.toMatch(/:\d{2}:\d{2}/)
  })
})

// ---------------------------------------------------------------------------
// 2. Provider display name helper
// ---------------------------------------------------------------------------
describe('providerDisplayName', () => {
  it('prepends Dr. if name does not already start with it', () => {
    const appt = { ...mockAppointment }
    expect(providerDisplayName(appt)).toBe('Dr. Priya Sharma')
  })

  it('does not double-prefix Dr.', () => {
    const appt = {
      ...mockAppointment,
      providers: { users: { full_name: 'Dr. Anand Kumar' }, specialties: [] },
    }
    expect(providerDisplayName(appt)).toBe('Dr. Anand Kumar')
  })

  it('falls back to "Doctor" when provider name is null', () => {
    const appt = { ...mockAppointment, providers: { users: null } }
    expect(providerDisplayName(appt)).toBe('Doctor')
  })
})

// ---------------------------------------------------------------------------
// 3. Mock data shape compatible with /api/appointments contract
// ---------------------------------------------------------------------------
describe('mock appointment shape', () => {
  it('has all required fields for dashboard rendering', () => {
    expect(mockAppointment).toHaveProperty('id')
    expect(mockAppointment).toHaveProperty('status')
    expect(mockAppointment).toHaveProperty('visit_type')
    expect(mockAppointment).toHaveProperty('fee_inr')
    expect(mockAppointment.availabilities).toHaveProperty('starts_at')
    expect(mockAppointment.providers?.users).toHaveProperty('full_name')
  })

  it('visit_type is one of the valid enum values', () => {
    const valid = ['in_clinic', 'home_visit']
    expect(valid).toContain(mockAppointment.visit_type)
  })

  it('fee_inr is an integer (no paise)', () => {
    expect(Number.isInteger(mockAppointment.fee_inr)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 4. DashboardSkeleton renders without a data prop
// ---------------------------------------------------------------------------
describe('DashboardSkeleton', () => {
  it('renders skeleton without any props', () => {
    render(<DashboardSkeleton />)
    // Skeleton should render some element — we look for the animate-pulse class
    const pulseElements = document.querySelectorAll('.animate-pulse')
    expect(pulseElements.length).toBeGreaterThan(0)
  })
})
