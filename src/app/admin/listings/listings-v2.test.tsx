import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ApprovalStatusBadge, SlaSparkline } from './ListingsV2'
import AdminListings from './page'

const useUiV2Mock = vi.fn<() => boolean>(() => true)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => useUiV2Mock(),
}))

describe('ApprovalStatusBadge', () => {
  it('maps pending to warning Badge', () => {
    render(<ApprovalStatusBadge status="pending" />)
    const el = screen.getByTestId('approval-badge-pending')
    expect(el).toHaveTextContent('Pending')
    expect(el.className).toMatch(/amber|warning/i)
  })

  it('maps approved to success Badge', () => {
    render(<ApprovalStatusBadge status="approved" />)
    expect(screen.getByTestId('approval-badge-approved')).toHaveTextContent('Approved')
  })

  it('maps rejected to danger Badge', () => {
    render(<ApprovalStatusBadge status="rejected" />)
    expect(screen.getByTestId('approval-badge-rejected')).toHaveTextContent('Rejected')
  })
})

describe('SlaSparkline', () => {
  it('renders an svg', () => {
    const { container } = render(<SlaSparkline />)
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('uses default values when none passed', () => {
    render(<SlaSparkline />)
    expect(screen.getByTestId('sla-sparkline')).toBeInTheDocument()
  })
})

describe('AdminListings flag-off', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(false)
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              listings: [
                {
                  id: 'p1',
                  slug: 'x',
                  title: null,
                  experience_years: null,
                  iap_registration_no: null,
                  specialty_ids: [],
                  consultation_fee_inr: null,
                  verified: false,
                  active: false,
                  approval_status: 'pending',
                  onboarding_step: 0,
                  created_at: new Date().toISOString(),
                  users: { full_name: 'Test User', phone: null },
                },
              ],
            }),
        } as Response),
      ),
    )
  })

  it('keeps inline status span when flag is off (no ApprovalStatusBadge)', async () => {
    render(<AdminListings />)
    await waitFor(() => {
      expect(screen.getByText('pending')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('approval-badge-pending')).toBeNull()
  })
})
