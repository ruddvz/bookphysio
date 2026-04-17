import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { buildCrumbsFromPath, DashboardBreadcrumbs } from './DashboardBreadcrumbs'

const usePathnameMock = vi.fn<() => string>()

vi.mock('next/navigation', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => usePathnameMock(),
  }
})

function setUiV2Cookie(on: boolean) {
  if (typeof document === 'undefined') return
  document.cookie = `bp_ui=${on ? 'v2' : 'v1'}; path=/`
}

describe('buildCrumbsFromPath', () => {
  it('returns null on the role root (provider)', () => {
    expect(buildCrumbsFromPath('/provider/dashboard', 'provider')).toBeNull()
  })

  it('returns null on the role root (admin, no /dashboard segment)', () => {
    expect(buildCrumbsFromPath('/admin', 'admin')).toBeNull()
  })

  it('builds a patient trail with the role root as the first crumb', () => {
    const crumbs = buildCrumbsFromPath('/patient/records', 'patient')
    expect(crumbs).toEqual([
      { label: 'Patient', href: '/patient/dashboard' },
      { label: 'Records', href: undefined },
    ])
  })

  it('uses the label map for known segments and title-cases unknown slugs', () => {
    const crumbs = buildCrumbsFromPath('/provider/bills/new', 'provider')
    expect(crumbs).toEqual([
      { label: 'Practitioner', href: '/provider/dashboard' },
      { label: 'Bills', href: '/provider/bills' },
      { label: 'New', href: undefined },
    ])
  })

  it('title-cases unknown hyphenated segments', () => {
    const crumbs = buildCrumbsFromPath('/patient/care-plan', 'patient')
    expect(crumbs?.at(-1)?.label).toBe('Care Plan')
  })

  it('only leaves the last crumb without an href', () => {
    const crumbs = buildCrumbsFromPath('/admin/listings/42', 'admin') ?? []
    expect(crumbs.slice(0, -1).every((c) => typeof c.href === 'string')).toBe(true)
    expect(crumbs.at(-1)?.href).toBeUndefined()
  })

  it('returns null for an empty pathname', () => {
    expect(buildCrumbsFromPath('', 'patient')).toBeNull()
  })
})

describe('<DashboardBreadcrumbs />', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_UI_V2
    setUiV2Cookie(true)
    usePathnameMock.mockReturnValue('/provider/patients/123')
  })

  afterEach(() => {
    setUiV2Cookie(false)
    usePathnameMock.mockReset()
    cleanup()
  })

  it('renders nothing when UI v2 is off', () => {
    setUiV2Cookie(false)
    const { container } = render(<DashboardBreadcrumbs role="provider" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders nothing on the role root', () => {
    usePathnameMock.mockReturnValue('/provider/dashboard')
    const { container } = render(<DashboardBreadcrumbs role="provider" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a derived trail with the role label first', () => {
    render(<DashboardBreadcrumbs role="provider" />)
    expect(screen.getByRole('link', { name: 'Practitioner' })).toHaveAttribute(
      'href',
      '/provider/dashboard',
    )
    expect(screen.getByText('123')).toHaveAttribute('aria-current', 'page')
  })

  it('honors an explicit items override for dynamic segments', () => {
    render(
      <DashboardBreadcrumbs
        role="provider"
        items={[
          { label: 'Practitioner', href: '/provider/dashboard' },
          { label: 'Patients', href: '/provider/patients' },
          { label: 'Priya Sharma' },
        ]}
      />,
    )
    expect(screen.getByText('Priya Sharma')).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByText('123')).not.toBeInTheDocument()
  })

  it('renders nothing when an empty items array is passed', () => {
    const { container } = render(<DashboardBreadcrumbs role="patient" items={[]} />)
    expect(container.firstChild).toBeNull()
  })
})
