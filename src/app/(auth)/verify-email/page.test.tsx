'use client'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import VerifyEmailPage from './page'

const resendMock = vi.fn()
const useSearchParamsMock = vi.fn()

vi.mock('next/navigation', () => ({
  useSearchParams: () => useSearchParamsMock(),
}))

vi.mock('@/components/BpLogo', () => ({
  default: ({ href }: { href?: string }) => (href ? <a href={href}>BookPhysio Logo</a> : <div>BookPhysio Logo</div>),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resend: (...args: unknown[]) => resendMock(...args),
    },
  }),
}))

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    useSearchParamsMock.mockReturnValue(new URLSearchParams('email=meera@example.com'))
    resendMock.mockResolvedValue({ error: null })
  })

  it('re-enables resend after the cooldown expires', async () => {
    render(<VerifyEmailPage />)

    fireEvent.click(screen.getByRole('button', { name: /resend confirmation email/i }))

    await waitFor(() => {
      expect(screen.getByText(/email resent/i)).toBeInTheDocument()
    })

    vi.advanceTimersByTime(60_000)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /resend confirmation email/i })).toBeInTheDocument()
    })
  })
})
