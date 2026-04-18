import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoleBadge, LastActiveDelta } from './UsersV2'
import AdminUsers from './page'

const useUiV2Mock = vi.fn<() => boolean>(() => true)

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => useUiV2Mock(),
}))

describe('RoleBadge', () => {
  it('renders Patient as soft tone 1', () => {
    render(<RoleBadge role="Patient" />)
    expect(screen.getByTestId('role-badge-patient')).toHaveTextContent('Patient')
  })

  it('renders Provider as success', () => {
    render(<RoleBadge role="Provider" />)
    expect(screen.getByTestId('role-badge-provider')).toHaveTextContent('Provider')
  })

  it('renders Suspended as danger', () => {
    render(<RoleBadge role="Suspended" />)
    expect(screen.getByTestId('role-badge-suspended')).toHaveTextContent('Suspended')
  })
})

describe('LastActiveDelta', () => {
  it('is positive for labels containing min', () => {
    render(<LastActiveDelta label="10 mins ago" />)
    expect(screen.getByTestId('last-active-delta')).toHaveTextContent('+5%')
  })

  it('is negative for labels containing day', () => {
    render(<LastActiveDelta label="2 days ago" />)
    expect(screen.getByTestId('last-active-delta')).toHaveTextContent('-10%')
  })
})

describe('AdminUsers ui-v2', () => {
  beforeEach(() => {
    useUiV2Mock.mockReset()
  })

  it('shows RoleBadge when flag on', () => {
    useUiV2Mock.mockReturnValue(true)
    render(<AdminUsers />)
    expect(screen.getByTestId('role-badge-patient')).toBeInTheDocument()
  })

  it('hides RoleBadge when flag off', () => {
    useUiV2Mock.mockReturnValue(false)
    render(<AdminUsers />)
    expect(screen.queryByTestId('role-badge-patient')).toBeNull()
  })
})
