'use client'

import { act, fireEvent, render, screen } from '@testing-library/react'
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
    useSearchParamsMock.mockReturnValue(new URLSearchParams('email=meera@example.com'))
    resendMock.mockResolvedValue({ error: null })
  })

  it('re-enables resend after the cooldown expires', async () => {
    vi.useFakeTimers()

    try {
      render(<VerifyEmailPage />)

      fireEvent.click(screen.getByRole('button', { name: /resend confirmation email/i }))

      await act(async () => {
        await Promise.resolve()
      })

      expect(screen.getByText(/email resent/i)).toBeInTheDocument()

      for (let index = 0; index < 60; index += 1) {
        await act(async () => {
          await vi.advanceTimersByTimeAsync(1_000)
        })
      }

      expect(screen.getByRole('button', { name: /resend confirmation email/i })).toBeInTheDocument()
    } finally {
      vi.useRealTimers()
    }
  })
})
