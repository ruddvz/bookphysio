/* eslint-disable @next/next/no-img-element */

import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import ProviderProfile from './page'

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => <img {...props} alt={String(props.alt ?? '')} />,
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: 'provider-1',
    },
  }),
}))

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => false,
}))

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    json: async () => body,
  } as Response
}

describe('ProviderProfile', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('loads live provider profile fields into the personal details form', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({
      id: 'provider-1',
      role: 'provider',
      full_name: 'Asha Rao',
      avatar_url: null,
      title: 'PT',
      bio: 'Manual therapy focus',
      experience_years: 8,
      consultation_fee_inr: 900,
      iap_registration_no: 'IAP-12345',
    })))

    render(<ProviderProfile />)

    expect(await screen.findByDisplayValue('Asha Rao')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Manual therapy focus')).toBeInTheDocument()
    expect(screen.getByDisplayValue('900')).toBeInTheDocument()
    expect(screen.getByDisplayValue('8')).toBeInTheDocument()
    expect(screen.getByDisplayValue('IAP-12345')).toBeInTheDocument()
  })

  it('persists edited profile fields through /api/profile', async () => {
    const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
      if (init?.method === 'PATCH') {
        return jsonResponse({ ok: true })
      }

      return jsonResponse({
        id: 'provider-1',
        role: 'provider',
        full_name: 'Asha Rao',
        avatar_url: null,
        title: 'PT',
        bio: 'Manual therapy focus',
        experience_years: 8,
        consultation_fee_inr: 900,
        iap_registration_no: 'IAP-12345',
      })
    })

    vi.stubGlobal('fetch', fetchMock)

    render(<ProviderProfile />)

    fireEvent.change(await screen.findByLabelText(/full name/i), {
      target: { value: 'Asha Mehra' },
    })
    fireEvent.change(screen.getByLabelText(/consultation fee/i), {
      target: { value: '1200' },
    })
    fireEvent.change(screen.getByLabelText(/years of practice/i), {
      target: { value: '9' },
    })
    fireEvent.change(screen.getByLabelText(/provider biography/i), {
      target: { value: 'Updated rehab specialist' },
    })

    fireEvent.click(screen.getByRole('button', { name: /push updates live/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/profile', expect.objectContaining({
        method: 'PATCH',
      }))
    })

    const patchCall = fetchMock.mock.calls.find(([, init]) => (init as RequestInit | undefined)?.method === 'PATCH')
    expect(patchCall).toBeTruthy()
    expect(JSON.parse(String((patchCall?.[1] as RequestInit).body))).toMatchObject({
      full_name: 'Asha Mehra',
      bio: 'Updated rehab specialist',
      consultation_fee_inr: 1200,
      experience_years: 9,
    })
  }, 10000)
})