'use client'

/**
 * Slice 16.11 — Auth surfaces v2 flag-gate tests
 * ≥6 tests per surface; mocks useUiV2 to test both flag states.
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

// ── Shared mocks ──────────────────────────────────────────────────────────────

const push = vi.fn()
const back = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, back, refresh: vi.fn(), replace: vi.fn() }),
  // Long local part so masked display uses 6 bullets (matches verify-email mask rules)
  useSearchParams: () => new URLSearchParams('email=testuser%40example.com'),
}))

vi.mock('@/components/BpLogo', () => ({
  default: ({ href }: { href?: string }) =>
    href ? <a href={href}>BookPhysio Logo</a> : <div>BookPhysio Logo</div>,
}))

vi.mock('@/components/OtpInput', () => ({
  default: ({
    onComplete,
    disabled,
  }: {
    onComplete: (code: string) => void
    disabled?: boolean
  }) => (
    <button type="button" disabled={disabled} onClick={() => onComplete('264200')}>
      Complete OTP
    </button>
  ),
}))

vi.mock('@/components/CityCombobox', () => ({
  CityCombobox: ({
    value,
    onValueChange,
  }: {
    value: string
    onValueChange: (v: string) => void
  }) => (
    <input
      role="combobox"
      aria-controls="city-combobox-listbox"
      aria-expanded={false}
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
    />
  ),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resend: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      signInWithOAuth: vi.fn(),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
  }),
}))

vi.mock('@/lib/auth/pending-otp', () => ({
  clearPendingOtp: vi.fn(),
  readPendingOtp: vi.fn().mockReturnValue({ flow: 'login', flowId: 'flow-1', returnTo: null }),
  savePendingOtp: vi.fn().mockReturnValue(true),
}))

vi.mock('@/lib/demo/session', () => ({
  sanitizeReturnPath: vi.fn().mockReturnValue(null),
  resolvePostAuthRedirect: vi.fn().mockReturnValue('/patient/dashboard'),
}))

// ── useUiV2 mock helpers ──────────────────────────────────────────────────────

let mockV2 = false

vi.mock('@/hooks/useUiV2', () => ({
  useUiV2: () => mockV2,
}))

function setV2(value: boolean) {
  mockV2 = value
}

beforeEach(() => {
  vi.unstubAllGlobals()
  push.mockReset()
  back.mockReset()
  mockV2 = false
})

// ── Imports (after mocks) ─────────────────────────────────────────────────────

import LoginPage from './login/page'
import SignupPage from './signup/page'
import VerifyEmailPage from './verify-email/page'
import ForgotPasswordPage from './forgot-password/page'
import VerifyOtpPage from './verify-otp/page'
import DoctorSignupPage from './doctor-signup/page'

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════════════════════════

describe('LoginPage — v2 flag', () => {
  it('renders v1 card chrome when flag is off', () => {
    setV2(false)
    render(<LoginPage />)
    const card = screen.getByRole('heading', { name: /welcome back/i }).closest('[data-ui-version]')
    expect(card).toHaveAttribute('data-ui-version', 'v1')
  })

  it('renders v2 card chrome when flag is on', () => {
    setV2(true)
    render(<LoginPage />)
    const card = screen.getByRole('heading', { name: /welcome back/i }).closest('[data-ui-version]')
    expect(card).toHaveAttribute('data-ui-version', 'v2')
  })

  it('shows trust badge in v2 mode', () => {
    setV2(true)
    render(<LoginPage />)
    expect(screen.getByText(/secure · india's physio platform/i)).toBeInTheDocument()
  })

  it('does not show trust badge in v1 mode', () => {
    setV2(false)
    render(<LoginPage />)
    expect(screen.queryByText(/secure · india's physio platform/i)).not.toBeInTheDocument()
  })

  it('email field is present and functional in v2 mode', async () => {
    setV2(true)
    render(<LoginPage />)
    const emailInput = screen.getByLabelText(/email address/i)
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } })
    expect(emailInput).toHaveValue('user@example.com')
  })

  it('password field validates as required in v2 mode', async () => {
    setV2(true)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: vi.fn().mockResolvedValue({}) }))
    render(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'user@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await waitFor(() => {
      expect(screen.getByLabelText(/^password$/i)).toHaveAttribute('aria-invalid', 'true')
    })
  })

  it('Google OAuth button is present in both v1 and v2 modes', () => {
    setV2(false)
    const { unmount } = render(<LoginPage />)
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
    unmount()

    setV2(true)
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument()
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// SIGNUP
// ══════════════════════════════════════════════════════════════════════════════

describe('SignupPage — v2 flag', () => {
  it('renders v1 card chrome when flag is off', () => {
    setV2(false)
    render(<SignupPage />)
    const card = screen.getByRole('heading', { name: /create your account/i }).closest('[data-ui-version]')
    expect(card).toHaveAttribute('data-ui-version', 'v1')
  })

  it('renders v2 card chrome when flag is on', () => {
    setV2(true)
    render(<SignupPage />)
    const card = screen.getByRole('heading', { name: /create your account/i }).closest('[data-ui-version]')
    expect(card).toHaveAttribute('data-ui-version', 'v2')
  })

  it('shows trust badge in v2 mode', () => {
    setV2(true)
    render(<SignupPage />)
    expect(screen.getByText(/secure · india's physio platform/i)).toBeInTheDocument()
  })

  it('does not show trust badge in v1 mode', () => {
    setV2(false)
    render(<SignupPage />)
    expect(screen.queryByText(/secure · india's physio platform/i)).not.toBeInTheDocument()
  })

  it('keeps +91 phone prefix in v2 mode', () => {
    setV2(true)
    render(<SignupPage />)
    expect(screen.getByText('+91')).toBeInTheDocument()
  })

  it('Zod phone validation rejects invalid 9-digit number in v2 mode', async () => {
    setV2(true)
    render(<SignupPage />)
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Test User' } })
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: 'password123' } })
    fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: '123456789' } })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))
    await waitFor(() => {
      expect(screen.getByText(/10-digit indian mobile/i)).toBeInTheDocument()
    })
  })

  it('email validation present in v2 mode', async () => {
    setV2(true)
    render(<SignupPage />)
    const email = screen.getByLabelText(/email address/i)
    fireEvent.change(email, { target: { value: 'not-valid' } })
    fireEvent.blur(email)
    await waitFor(() => {
      expect(email).toHaveAttribute('aria-invalid', 'true')
    })
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// VERIFY EMAIL
// ══════════════════════════════════════════════════════════════════════════════

describe('VerifyEmailPage — v2 flag', () => {
  it('renders v1 card chrome when flag is off', () => {
    setV2(false)
    render(<VerifyEmailPage />)
    const card = screen.getByRole('heading', { name: /check your email/i }).closest('[data-ui-version]')
    expect(card).toHaveAttribute('data-ui-version', 'v1')
  })

  it('renders v2 card chrome when flag is on', () => {
    setV2(true)
    render(<VerifyEmailPage />)
    const card = screen.getByRole('heading', { name: /check your email/i }).closest('[data-ui-version]')
    expect(card).toHaveAttribute('data-ui-version', 'v2')
  })

  it('shows trust badge in v2 mode', () => {
    setV2(true)
    render(<VerifyEmailPage />)
    expect(screen.getByText(/secure · india's physio platform/i)).toBeInTheDocument()
  })

  it('does not show trust badge in v1 mode', () => {
    setV2(false)
    render(<VerifyEmailPage />)
    expect(screen.queryByText(/secure · india's physio platform/i)).not.toBeInTheDocument()
  })

  it('shows the masked email in v2 mode', async () => {
    setV2(true)
    render(<VerifyEmailPage />)
    await waitFor(() => {
      expect(screen.getByText(/t••••••@example\.com/i)).toBeInTheDocument()
    })
  })

  it('resend button and sign up again link present in v2 mode', () => {
    setV2(true)
    render(<VerifyEmailPage />)
    expect(screen.getByRole('button', { name: /resend confirmation/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign up again/i })).toHaveAttribute('href', '/signup')
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// FORGOT PASSWORD
// ══════════════════════════════════════════════════════════════════════════════

describe('ForgotPasswordPage — v2 flag', () => {
  it('renders v1 data attr when flag is off', () => {
    setV2(false)
    render(<ForgotPasswordPage />)
    const card = screen.getByRole('heading', { name: /forgot password/i }).closest('[data-ui-version]')
    expect(card).toHaveAttribute('data-ui-version', 'v1')
  })

  it('renders v2 data attr when flag is on', () => {
    setV2(true)
    render(<ForgotPasswordPage />)
    const card = screen.getByRole('heading', { name: /forgot password/i }).closest('[data-ui-version]')
    expect(card).toHaveAttribute('data-ui-version', 'v2')
  })

  it('shows trust badge in v2 mode', () => {
    setV2(true)
    render(<ForgotPasswordPage />)
    expect(screen.getByText(/secure · india's physio platform/i)).toBeInTheDocument()
  })

  it('does not show trust badge in v1 mode', () => {
    setV2(false)
    render(<ForgotPasswordPage />)
    expect(screen.queryByText(/secure · india's physio platform/i)).not.toBeInTheDocument()
  })

  it('Zod validation rejects empty submit in v2 mode', async () => {
    setV2(true)
    render(<ForgotPasswordPage />)
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => {
      expect(screen.getByText(/please enter your mobile number or email/i)).toBeInTheDocument()
    })
  })

  it('routes phone number to OTP screen in v2 mode', async () => {
    setV2(true)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) }))
    render(<ForgotPasswordPage />)
    fireEvent.change(screen.getByLabelText(/mobile number or email/i), { target: { value: '9876543210' } })
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/verify-otp\?flow=/))
    })
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// VERIFY OTP
// ══════════════════════════════════════════════════════════════════════════════

describe('VerifyOtpPage — v2 flag', () => {
  it('renders v1 data attr when flag is off (flow present)', async () => {
    setV2(false)
    window.history.replaceState({}, '', '/verify-otp?flow=flow-1')
    render(<VerifyOtpPage />)
    await waitFor(() => {
      const card = document.querySelector('[data-ui-version]')
      expect(card).toHaveAttribute('data-ui-version', 'v1')
    })
  })

  it('renders v2 data attr when flag is on (flow present)', async () => {
    setV2(true)
    window.history.replaceState({}, '', '/verify-otp?flow=flow-1')
    render(<VerifyOtpPage />)
    await waitFor(() => {
      const card = document.querySelector('[data-ui-version]')
      expect(card).toHaveAttribute('data-ui-version', 'v2')
    })
  })

  it('shows trust badge in v2 mode', async () => {
    setV2(true)
    window.history.replaceState({}, '', '/verify-otp?flow=flow-1')
    render(<VerifyOtpPage />)
    await waitFor(() => {
      expect(screen.getByText(/secure · india's physio platform/i)).toBeInTheDocument()
    })
  })

  it('does not show trust badge in v1 mode', async () => {
    setV2(false)
    window.history.replaceState({}, '', '/verify-otp?flow=flow-1')
    render(<VerifyOtpPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete otp/i })).toBeInTheDocument()
    })
    expect(screen.queryByText(/secure · india's physio platform/i)).not.toBeInTheDocument()
  })

  it('OTP keypad wrapper has v2 test id in v2 mode', async () => {
    setV2(true)
    window.history.replaceState({}, '', '/verify-otp?flow=flow-1')
    render(<VerifyOtpPage />)
    await waitFor(() => {
      expect(screen.getByTestId('v2-otp-keypad')).toBeInTheDocument()
    })
  })

  it('OTP verification still works in v2 mode', async () => {
    setV2(true)
    window.history.replaceState({}, '', '/verify-otp?flow=flow-1')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ role: 'patient' }),
    }))
    render(<VerifyOtpPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /complete otp/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /complete otp/i }))
    await waitFor(
      () => {
        expect(push).toHaveBeenCalledWith('/patient/dashboard')
      },
      { timeout: 3000 },
    )
  })
})

// ══════════════════════════════════════════════════════════════════════════════
// DOCTOR SIGNUP
// ══════════════════════════════════════════════════════════════════════════════

describe('DoctorSignupPage — v2 flag', () => {
  it('renders v1 card chrome when flag is off', () => {
    setV2(false)
    render(<DoctorSignupPage />)
    const card = screen.getByRole('link', { name: /bookphysio logo/i }).closest('[data-ui-version]')
    expect(card).toHaveAttribute('data-ui-version', 'v1')
  })

  it('renders v2 card chrome when flag is on', () => {
    setV2(true)
    render(<DoctorSignupPage />)
    const card = screen.getByRole('link', { name: /bookphysio logo/i }).closest('[data-ui-version]')
    expect(card).toHaveAttribute('data-ui-version', 'v2')
  })

  it('shows trust badge in v2 mode', () => {
    setV2(true)
    render(<DoctorSignupPage />)
    expect(screen.getByText(/secure · india's physio platform/i)).toBeInTheDocument()
  })

  it('does not show trust badge in v1 mode', () => {
    setV2(false)
    render(<DoctorSignupPage />)
    expect(screen.queryByText(/secure · india's physio platform/i)).not.toBeInTheDocument()
  })

  it('shows +91 phone prefix on step 1 in v2 mode', () => {
    setV2(true)
    render(<DoctorSignupPage />)
    expect(screen.getByPlaceholderText('98765 43210')).toBeInTheDocument()
  })

  it('step 1 Zod validation rejects empty name in v2 mode', async () => {
    setV2(true)
    render(<DoctorSignupPage />)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next: professional details/i })).toBeInTheDocument()
    })
    fireEvent.click(screen.getByRole('button', { name: /next: professional details/i }))
    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })
})
