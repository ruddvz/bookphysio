import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import AuthLayout from './layout'
import { metadata as forgotPasswordMetadata } from './forgot-password/layout'
import ForgotPasswordPage from './forgot-password/page'
import LoginPage from './login/page'
import SignupPage from './signup/page'
import VerifyOtpPage from './verify-otp/page'
import { metadata as doctorSignupMetadata } from './doctor-signup/layout'
import { metadata as loginMetadata } from './login/layout'
import { metadata as signupMetadata } from './signup/layout'
import { metadata as updatePasswordMetadata } from './update-password/layout'
import { metadata as verifyOtpMetadata } from './verify-otp/layout'
import { clearPendingOtp, readPendingOtp, savePendingOtp } from '@/lib/auth/pending-otp'

const push = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/components/auth/DemoAccessPanel', () => ({
  DemoAccessPanel: () => <div>Demo access panel</div>,
}))

vi.mock('@/components/BpLogo', () => ({
  default: ({ href }: { href?: string }) => (href ? <a href={href}>BookPhysio Logo</a> : <div>BookPhysio Logo</div>),
}))

vi.mock('@/components/OtpInput', () => ({
  default: ({ onComplete, disabled }: { onComplete: (code: string) => void; disabled?: boolean }) => (
    <button type="button" disabled={disabled} onClick={() => onComplete('264200')}>
      Complete OTP
    </button>
  ),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      resetPasswordForEmail: vi.fn(),
    },
  }),
}))

afterEach(() => {
  push.mockReset()
  clearPendingOtp()
  vi.unstubAllGlobals()
})

describe('Auth regressions', () => {
  it('renders a minimal auth footer instead of the full marketing footer', () => {
    render(
      <AuthLayout>
        <div>Auth card</div>
      </AuthLayout>
    )

    expect(screen.getByText('Auth card')).toBeInTheDocument()
    expect(screen.getByText(/© 2026 BookPhysio/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /privacy/i })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: /terms/i })).toHaveAttribute('href', '/terms')
    expect(screen.queryByText(/BookPhysio is a booking platform/i)).not.toBeInTheDocument()
  })

  it('keeps the login page logo linked home and uses the arrow icon for doctor signup', () => {
    const { container } = render(<LoginPage />)

    expect(screen.getByRole('link', { name: /bookphysio logo/i })).toHaveAttribute('href', '/')
    expect(screen.getByText(/demo access panel/i)).toBeInTheDocument()
    expect(screen.queryByText(/demo accounts/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/90000 00000/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/99999 99999/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/51972 92391/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/999999/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/111111/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/264200/i)).not.toBeInTheDocument()

    const doctorLink = screen.getByRole('link', { name: /join as a doctor/i })
    expect(doctorLink).toHaveAttribute('href', '/doctor-signup')
    expect(doctorLink).not.toHaveTextContent('→')
    expect(doctorLink.querySelector('svg')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('pb-10')
  })

  it('stores login OTP state in session storage and navigates with a clean verify URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      })
    )

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/mobile number/i), {
      target: { value: '9876543210' },
    })

    fireEvent.click(screen.getByRole('button', { name: /send otp|secure login/i }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/verify-otp')
    })

    expect(readPendingOtp()).toEqual({
      phone: '919876543210',
      flow: 'login',
      fullName: undefined,
      returnTo: null,
    })
  })

  it('stores signup OTP state in session storage and avoids leaking name in the URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      })
    )

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Rahul Sharma' },
    })
    fireEvent.change(screen.getByLabelText(/mobile number/i), {
      target: { value: '9876543210' },
    })

    fireEvent.click(screen.getByRole('button', { name: /create account|start your recovery/i }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/verify-otp')
    })

    expect(readPendingOtp()).toEqual({
      phone: '919876543210',
      flow: 'signup',
      fullName: 'Rahul Sharma',
      returnTo: null,
    })
  })

  it('uses masked success copy for magic-link login requests', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          message: 'If an account exists, a magic link has been sent.',
        }),
      })
    )

    render(<LoginPage />)

    fireEvent.click(screen.getByRole('button', { name: /magic link/i }))
    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'person@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))

    await waitFor(() => {
      expect(screen.getByText(/if an account exists for/i)).toBeInTheDocument()
    })
  })

  it('exports route-specific metadata for login and doctor signup', () => {
    expect(loginMetadata.title).toBe("Log in to BookPhysio — India's Physiotherapy Network")
    expect(loginMetadata.alternates).toEqual({ canonical: '/login' })
    expect(signupMetadata.title).toBe('Create your BookPhysio account')
    expect(signupMetadata.alternates).toEqual({ canonical: '/signup' })
    expect(verifyOtpMetadata.title).toBe('Verify your mobile number — BookPhysio')
    expect(verifyOtpMetadata.alternates).toEqual({ canonical: '/verify-otp' })
    expect(forgotPasswordMetadata.title).toBe('Recover access to BookPhysio')
    expect(forgotPasswordMetadata.alternates).toEqual({ canonical: '/forgot-password' })
    expect(doctorSignupMetadata.title).toBe('Join as a Physiotherapist — BookPhysio')
    expect(doctorSignupMetadata.alternates).toEqual({ canonical: '/doctor-signup' })
    expect(updatePasswordMetadata.title).toBe('Set a new password — BookPhysio')
    expect(updatePasswordMetadata.alternates).toEqual({ canonical: '/update-password' })
  })

  it('routes phone recovery to the OTP screen after the OTP request succeeds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      })
    )

    render(<ForgotPasswordPage />)

    fireEvent.change(screen.getByLabelText(/mobile number or email/i), {
      target: { value: '9876543210' },
    })

    fireEvent.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/verify-otp')
    })

    expect(readPendingOtp()).toEqual({
      phone: '919876543210',
      flow: 'login',
      fullName: undefined,
      returnTo: '/update-password',
    })
  })

  it('shows recovery actions when the verify screen is opened without pending OTP state', () => {
    render(<VerifyOtpPage />)

    expect(screen.getByText(/otp session expired/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to login/i })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: /recover access/i })).toHaveAttribute('href', '/forgot-password')
    expect(screen.queryByRole('button', { name: /^verify$/i })).not.toBeInTheDocument()
  })

  it('uses masked delivery copy on the verify screen for login OTP flows', async () => {
    savePendingOtp({
      phone: '919876543210',
      flow: 'login',
      returnTo: null,
    })

    render(<VerifyOtpPage />)

    await waitFor(() => {
      expect(screen.getByText(/if an account exists, a code was sent to/i)).toBeInTheDocument()
    })
  })

  it('submits 264200 through the server flow instead of opening the local dev role picker', async () => {
    savePendingOtp({
      phone: '919876543210',
      flow: 'login',
      returnTo: null,
    })

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({ role: 'patient', user: { id: 'user-1' } }),
      })
    )

    render(<VerifyOtpPage />)

    fireEvent.click(screen.getByRole('button', { name: /complete otp/i }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/patient/dashboard')
    })

    expect(screen.queryByText(/sign in as/i)).not.toBeInTheDocument()
  })
})