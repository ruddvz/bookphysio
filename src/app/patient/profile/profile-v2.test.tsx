import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PatientProfileV2 } from './PatientProfileV2'

// ── Hook mock ──────────────────────────────────────────────────────────────
const useUiV2Mock = vi.fn<() => boolean>(() => true)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

// ── Helpers ────────────────────────────────────────────────────────────────

function makeQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function withProvider(node: React.ReactNode, qc?: QueryClient) {
  const client = qc ?? makeQC()
  return <QueryClientProvider client={client}>{node}</QueryClientProvider>
}

const profileData = {
  id: 'uid-1',
  full_name: 'Priya Sharma',
  phone: '+919876543210',
  email: 'priya@example.com',
  role: 'patient',
  avatar_url: null,
}

// ── Tests ──────────────────────────────────────────────────────────────────

describe('PatientProfileV2', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(true)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url === '/api/profile' && (!init?.method || init.method === 'GET')) {
          return new Response(JSON.stringify(profileData), { status: 200 })
        }
        if (url === '/api/profile' && init?.method === 'PATCH') {
          return new Response(JSON.stringify({ ...profileData, full_name: 'Priya S.' }), { status: 200 })
        }
        return new Response(JSON.stringify({}), { status: 200 })
      })
    )
  })

  afterEach(() => {
    useUiV2Mock.mockReset()
  })

  it('returns null when v2 flag is off', () => {
    useUiV2Mock.mockReturnValue(false)
    const { container } = render(withProvider(<PatientProfileV2 />))
    expect(container.firstChild).toBeNull()
  })

  it('renders the v2 profile root with data-ui-version="v2"', async () => {
    render(withProvider(<PatientProfileV2 />))
    const root = await screen.findByTestId('v2-profile-root')
    expect(root).toHaveAttribute('data-ui-version', 'v2')
  })

  it('shows the user\'s full name in the avatar area', async () => {
    render(withProvider(<PatientProfileV2 />))
    await screen.findByTestId('v2-profile-root')
    expect(screen.getByText('Priya Sharma')).toBeInTheDocument()
  })

  it('renders the Patient role Badge', async () => {
    render(withProvider(<PatientProfileV2 />))
    const badge = await screen.findByTestId('v2-role-badge')
    expect(badge).toHaveTextContent('Patient')
  })

  it('renders the Phone Verified Badge when phone is present', async () => {
    render(withProvider(<PatientProfileV2 />))
    const badge = await screen.findByTestId('v2-phone-verified-badge')
    expect(badge).toHaveTextContent('Phone Verified')
  })

  it('renders initials in the avatar when no avatar_url', async () => {
    render(withProvider(<PatientProfileV2 />))
    const avatar = await screen.findByTestId('v2-avatar')
    expect(avatar).toHaveTextContent('PS')
  })

  it('pre-fills the name input with the profile full_name', async () => {
    render(withProvider(<PatientProfileV2 />))
    const input = await screen.findByTestId('v2-name-input')
    expect(input).toHaveValue('Priya Sharma')
  })

  it('enables Save button when name is changed', async () => {
    render(withProvider(<PatientProfileV2 />))
    const input = await screen.findByTestId('v2-name-input')
    fireEvent.change(input, { target: { value: 'Priya S.' } })
    const btn = screen.getByTestId('v2-save-btn')
    expect(btn).not.toBeDisabled()
  })

  it('disables Save button when name is unchanged', async () => {
    render(withProvider(<PatientProfileV2 />))
    await screen.findByTestId('v2-name-input')
    const btn = screen.getByTestId('v2-save-btn')
    expect(btn).toBeDisabled()
  })

  it('calls PATCH /api/profile on save', async () => {
    render(withProvider(<PatientProfileV2 />))
    const input = await screen.findByTestId('v2-name-input')
    fireEvent.change(input, { target: { value: 'Priya S.' } })
    fireEvent.click(screen.getByTestId('v2-save-btn'))
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'PATCH' }))
    })
  })

  it('renders the consent card with both toggles', async () => {
    render(withProvider(<PatientProfileV2 />))
    await screen.findByTestId('v2-consent-card')
    expect(screen.getByTestId('v2-consent-toggle-marketing-email')).toBeInTheDocument()
    expect(screen.getByTestId('v2-consent-toggle-appointment-sms')).toBeInTheDocument()
  })

  it('toggles consent switch on click', async () => {
    render(withProvider(<PatientProfileV2 />))
    await screen.findByTestId('v2-consent-card')
    const toggle = screen.getByTestId('v2-consent-toggle-marketing-email')
    expect(toggle).toHaveAttribute('aria-checked', 'true')
    fireEvent.click(toggle)
    expect(toggle).toHaveAttribute('aria-checked', 'false')
  })

  it('renders the security card with "Secure account" Badge', async () => {
    render(withProvider(<PatientProfileV2 />))
    const card = await screen.findByTestId('v2-security-card')
    expect(card).toBeInTheDocument()
    expect(screen.getByTestId('v2-secure-badge')).toHaveTextContent('Secure account')
  })

  it('renders the trust/privacy card', async () => {
    render(withProvider(<PatientProfileV2 />))
    expect(await screen.findByTestId('v2-trust-card')).toBeInTheDocument()
  })
})
