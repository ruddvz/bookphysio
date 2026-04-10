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
  window.history.replaceState({}, '', '/verify-otp')
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
    expect(screen.getByRole('button', { name: /email magic link/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument()
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

  it('keeps the polished login chrome locale-aware when a locale override is provided', () => {
    render(<LoginPage locale="hi" />)

    expect(screen.getByText(/वापस स्वागत है/i)).toBeInTheDocument()
    expect(screen.getByText(/मोबाइल नंबर/i)).toBeInTheDocument()
    expect(screen.queryByText(/Welcome back/i)).not.toBeInTheDocument()
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

    fireEvent.click(screen.getByRole('button', { name: /continue with secure otp|send otp|secure login/i }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/verify-otp\?flow=/))
    })

    expect(readPendingOtp()).toEqual({
      flow: 'login',
      flowId: expect.any(String),
      returnTo: null,
    })

    expect(window.sessionStorage.getItem('bp-pending-otp')).not.toContain('9876543210')
  })

  it('masks login OTP failures behind generic UI copy', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: 'Provider-only failure detail' }),
      })
    )

    render(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/mobile number/i), {
      target: { value: '9876543210' },
    })

    fireEvent.click(screen.getByRole('button', { name: /continue with secure otp|send otp|secure login/i }))

    await waitFor(() => {
      expect(screen.getByText(/unable to send a login code right now/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/provider-only failure detail/i)).not.toBeInTheDocument()
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

    fireEvent.click(screen.getByRole('button', { name: /continue with secure otp|create account|start your recovery/i }))

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/verify-otp\?flow=/))
    })

    expect(readPendingOtp()).toEqual({
      flow: 'signup',
      flowId: expect.any(String),
      returnTo: null,
    })

    expect(window.sessionStorage.getItem('bp-pending-otp')).not.toContain('9876543210')
  })

  it('masks signup OTP failures behind generic UI copy', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: 'User already exists in shard 2' }),
      })
    )

    render(<SignupPage />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'Rahul Sharma' },
    })
    fireEvent.change(screen.getByLabelText(/mobile number/i), {
      target: { value: '9876543210' },
    })

    fireEvent.click(screen.getByRole('button', { name: /continue with secure otp|create account|start your recovery/i }))

    await waitFor(() => {
      expect(screen.getByText(/unable to start account verification right now/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/user already exists in shard 2/i)).not.toBeInTheDocument()
  })

  it('uses generic success copy for magic-link login requests without echoing the email address', async () => {
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

    fireEvent.click(screen.getByRole('button', { name: /email magic link/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue with email instead/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in with email/i })).toBeInTheDocument()
    })

    fireEvent.change(screen.getByRole('textbox', { name: /email address/i }), {
      target: { value: 'person@example.com' },
    })

    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))

    await waitFor(() => {
      expect(screen.getByText(/if an account exists for/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/person@example.com/i)).not.toBeInTheDocument()
  })

  it('keeps the email dialog error state accessible and generic on validation and request failures', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        json: vi.fn().mockResolvedValue({ error: 'Unknown email address' }),
      })
    )

    render(<LoginPage />)

    fireEvent.click(screen.getByRole('button', { name: /email magic link/i }))
    fireEvent.click(screen.getByRole('button', { name: /continue with email instead/i }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in with email/i })).toBeInTheDocument()
    })

    const emailInput = screen.getByRole('textbox', { name: /email address/i })

    fireEvent.change(emailInput, {
      target: { value: 'not-an-email' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))

    await waitFor(() => {
      expect(screen.getByRole('textbox', { name: /email address/i })).toHaveAttribute('aria-invalid', 'true')
    })

    expect(screen.getByRole('textbox', { name: /email address/i }).getAttribute('aria-describedby')).toMatch(/-email-error$/)
    expect(screen.getByRole('alert')).toHaveTextContent(/please enter a valid email address/i)

    fireEvent.change(emailInput, {
      target: { value: 'person@example.com' },
    })
    fireEvent.click(screen.getByRole('button', { name: /send magic link/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/unable to send a magic link right now/i)
    })

    expect(screen.queryByText(/unknown email address/i)).not.toBeInTheDocument()
  })

  it('marks the login phone field invalid with accessible error wiring when validation fails', async () => {
    render(<LoginPage />)

    const phoneInput = screen.getByLabelText(/mobile number/i)

    fireEvent.change(phoneInput, {
      target: { value: '12345' },
    })

    fireEvent.click(screen.getByRole('button', { name: /continue with secure otp|send otp|secure login/i }))

    await waitFor(() => {
      expect(phoneInput).toHaveAttribute('aria-invalid', 'true')
    })

    expect(phoneInput).toHaveAttribute('aria-describedby', expect.stringContaining('-phone-hint'))
    expect(screen.getByText(/enter a valid 10-digit indian mobile number/i).id).toMatch(/-phone-error$/)
  })

  it('offers both mobile otp and email magic-link login paths from signup', () => {
    render(<SignupPage />)

    expect(screen.getByRole('link', { name: /sign in with mobile otp/i })).toHaveAttribute('href', '/login')
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
      expect(push).toHaveBeenCalledWith(expect.stringMatching(/^\/verify-otp\?flow=/))
    })

    expect(readPendingOtp()).toEqual({
      flow: 'login',
      flowId: expect.any(String),
      returnTo: '/update-password',
    })
  })

  it('shows a recovery state when verify-otp is opened without an active flow', async () => {
    render(<VerifyOtpPage />)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /session expired/i })).toBeInTheDocument()
    })

    expect(screen.queryByRole('button', { name: /complete otp/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /start again/i }))

    expect(push).toHaveBeenCalledWith('/login')
  })

  it('uses the flow query param as a verify fallback when session metadata is missing', async () => {
    window.history.replaceState({}, '', '/verify-otp?flow=flow-1')

    render(<VerifyOtpPage />)

    await waitFor(() => {
      expect(screen.getByText(/if an account exists, a code was sent to your mobile number/i)).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /complete otp/i })).toBeInTheDocument()
    expect(screen.queryByText(/session expired/i)).not.toBeInTheDocument()
  })

  it('prefers the query flow id over stale stored OTP metadata', async () => {
    savePendingOtp({
      flow: 'login',
      flowId: 'stale-flow',
      returnTo: null,
    })
    window.history.replaceState({}, '', '/verify-otp?flow=fresh-flow')

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ role: 'patient', user: { id: 'user-1' } }),
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<VerifyOtpPage />)

    fireEvent.click(screen.getByRole('button', { name: /complete otp/i }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/otp/verify',
        expect.objectContaining({
          body: expect.stringContaining('fresh-flow'),
        })
      )
    })

    expect((fetchMock.mock.calls[0]?.[1] as { body?: string } | undefined)?.body).not.toContain('stale-flow')
  })

  it('uses masked delivery copy on the verify screen for login OTP flows', async () => {
    savePendingOtp({
      flow: 'login',
      flowId: 'flow-1',
      returnTo: null,
    })

    render(<VerifyOtpPage />)

    await waitFor(() => {
      expect(screen.getByText(/if an account exists, a code was sent to your mobile number/i)).toBeInTheDocument()
    })

    expect(screen.queryByText(/98765 43210/i)).not.toBeInTheDocument()
  })

  it('submits 264200 through the server flow instead of opening the local dev role picker', async () => {
    savePendingOtp({
      flow: 'login',
      flowId: 'flow-1',
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