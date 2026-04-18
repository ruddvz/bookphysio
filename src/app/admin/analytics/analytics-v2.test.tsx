import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AdminAnalytics from './page'

const useUiV2Mock = vi.fn<() => boolean>(() => true)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => useUiV2Mock(),
}))

const pulseProps: Record<string, unknown> = {}

vi.mock('@/components/admin/AdminPulseRail', () => ({
  AdminPulseRail: (props: Record<string, unknown>) => {
    Object.assign(pulseProps, props)
    return (
      <div
        data-testid="admin-pulse-rail"
        data-active-providers={String(props.activeProviders)}
        data-total-patients={String(props.totalPatients)}
        data-gmv={String(props.gmvMtd)}
        data-review-href={String(props.reviewHref)}
      />
    )
  },
}))

const defaultAnalytics = {
  kpis: {
    totalGmv: 125000,
    totalGmvFormatted: '₹1,25,000',
    activePatients: 420,
    completionRate: 88,
    totalProviders: 55,
    totalAppointments: 900,
  },
  monthlyRevenue: [] as { label: string; revenue: number }[],
  monthlyAppointments: [] as { label: string; count: number }[],
}

const useQueryMock = vi.fn(() => ({
  data: defaultAnalytics,
  isLoading: false,
}))

vi.mock('@tanstack/react-query', () => ({
  useQuery: () => useQueryMock(),
}))

describe('AdminAnalytics AdminPulseRail', () => {
  beforeEach(() => {
    useUiV2Mock.mockReset()
    useQueryMock.mockReturnValue({ data: defaultAnalytics, isLoading: false })
    Object.keys(pulseProps).forEach((k) => {
      delete pulseProps[k]
    })
  })

  it('renders AdminPulseRail when ui-v2 flag is on', () => {
    useUiV2Mock.mockReturnValue(true)
    render(<AdminAnalytics />)
    expect(screen.getByTestId('admin-pulse-rail')).toBeInTheDocument()
  })

  it('does not render AdminPulseRail when ui-v2 flag is off', () => {
    useUiV2Mock.mockReturnValue(false)
    render(<AdminAnalytics />)
    expect(screen.queryByTestId('admin-pulse-rail')).toBeNull()
  })

  it('passes KPI props from analytics data', () => {
    useUiV2Mock.mockReturnValue(true)
    render(<AdminAnalytics />)
    const rail = screen.getByTestId('admin-pulse-rail')
    expect(rail).toHaveAttribute('data-active-providers', '55')
    expect(rail).toHaveAttribute('data-total-patients', '420')
    expect(rail).toHaveAttribute('data-gmv', '125000')
    expect(rail).toHaveAttribute('data-review-href', '/admin/listings')
  })

  it('sets reviewHref to /admin/listings', () => {
    useUiV2Mock.mockReturnValue(true)
    render(<AdminAnalytics />)
    expect(pulseProps.reviewHref).toBe('/admin/listings')
  })

  it('passes pendingApprovals as 0', () => {
    useUiV2Mock.mockReturnValue(true)
    render(<AdminAnalytics />)
    expect(pulseProps.pendingApprovals).toBe(0)
  })

  it('passes zero KPIs when analytics data is missing', () => {
    useQueryMock.mockReturnValue({ data: undefined, isLoading: true })
    useUiV2Mock.mockReturnValue(true)
    render(<AdminAnalytics />)
    const rail = screen.getByTestId('admin-pulse-rail')
    expect(rail).toHaveAttribute('data-active-providers', '0')
    expect(rail).toHaveAttribute('data-total-patients', '0')
    expect(rail).toHaveAttribute('data-gmv', '0')
  })
})
