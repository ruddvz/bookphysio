import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProviderProfileV2 } from './ProviderProfileV2'

const useUiV2Mock = vi.fn<() => boolean>(() => true)
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => useUiV2Mock() }))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'provider-test-1' },
  }),
}))

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img {...props} alt={String(props.alt ?? '')} width={80} height={80} />
  ),
}))

function makeQC() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
}

function withProvider(node: React.ReactNode, qc?: QueryClient) {
  const client = qc ?? makeQC()
  return <QueryClientProvider client={client}>{node}</QueryClientProvider>
}

const verifiedProfile = {
  id: 'provider-test-1',
  role: 'provider',
  full_name: 'Asha Rao',
  avatar_url: null,
  title: 'PT' as const,
  bio: 'Manual therapy focus',
  experience_years: 8,
  consultation_fee_inr: 900,
  iap_registration_no: 'IAP-12345',
}

describe('ProviderProfileV2', () => {
  beforeEach(() => {
    useUiV2Mock.mockReturnValue(true)
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input)
        if (url === '/api/profile' && (!init?.method || init.method === 'GET')) {
          return new Response(JSON.stringify(verifiedProfile), { status: 200 })
        }
        if (url === '/api/profile' && init?.method === 'PATCH') {
          return new Response(JSON.stringify({ ok: true }), { status: 200 })
        }
        return new Response(JSON.stringify({}), { status: 200 })
      })
    )
  })

  afterEach(() => {
    useUiV2Mock.mockReset()
    vi.unstubAllGlobals()
  })

  it('returns null when v2 flag is off', () => {
    useUiV2Mock.mockReturnValue(false)
    const { container } = render(withProvider(<ProviderProfileV2 />))
    expect(container.firstChild).toBeNull()
  })

  it('renders v2-profile-root when flag is on', async () => {
    render(withProvider(<ProviderProfileV2 />))
    const root = await screen.findByTestId('v2-profile-root')
    expect(root).toHaveAttribute('data-ui-version', 'v2')
  })

  it('shows Physiotherapist role Badge', async () => {
    render(withProvider(<ProviderProfileV2 />))
    const badge = await screen.findByTestId('v2-role-badge')
    expect(badge).toHaveTextContent('Physiotherapist')
  })

  it('shows Verified credential Badge when iap_registration_no is set', async () => {
    render(withProvider(<ProviderProfileV2 />))
    expect(await screen.findByTestId('v2-credential-verified')).toHaveTextContent('Verified')
  })

  it('shows Pending credential Badge when iap_registration_no is null', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        return new Response(
          JSON.stringify({ ...verifiedProfile, iap_registration_no: null }),
          { status: 200 }
        )
      })
    )
    render(withProvider(<ProviderProfileV2 />))
    expect(await screen.findByTestId('v2-credential-pending')).toHaveTextContent('Pending')
  })

  it('shows provider display name in the avatar row', async () => {
    render(withProvider(<ProviderProfileV2 />))
    await screen.findByTestId('v2-profile-root')
    expect(screen.getByText('PT Asha Rao')).toBeInTheDocument()
  })

  it('disables Save Changes when fields match loaded profile', async () => {
    render(withProvider(<ProviderProfileV2 />))
    await screen.findByTestId('v2-name-input')
    expect(screen.getByTestId('v2-save-btn')).toBeDisabled()
  })

  it('enables Save Changes when name is edited', async () => {
    render(withProvider(<ProviderProfileV2 />))
    const input = await screen.findByTestId('v2-name-input')
    fireEvent.change(input, { target: { value: 'Asha Mehra' } })
    expect(screen.getByTestId('v2-save-btn')).not.toBeDisabled()
  })

  it('renders View Public Profile CTA linking to /doctor/:id', async () => {
    render(withProvider(<ProviderProfileV2 />))
    const link = await screen.findByTestId('v2-view-public-profile')
    expect(link).toHaveAttribute('href', '/doctor/provider-test-1')
    expect(link).toHaveTextContent('View Public Profile')
  })

  it('calls PATCH /api/profile on save', async () => {
    render(withProvider(<ProviderProfileV2 />))
    const input = await screen.findByTestId('v2-name-input')
    fireEvent.change(input, { target: { value: 'Asha Mehra' } })
    fireEvent.click(screen.getByTestId('v2-save-btn'))
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/profile', expect.objectContaining({ method: 'PATCH' }))
    })
  })
})
