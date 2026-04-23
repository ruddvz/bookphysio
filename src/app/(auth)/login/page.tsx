'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { createClient } from '@/lib/supabase/client'
import { sanitizeReturnPath } from '@/lib/demo/session'
import { cn } from '@/lib/utils'
import { useUiV2 } from '@/hooks/useUiV2'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

interface LoginErrors {
  email?: string
  password?: string
  general?: string
}

type LoginBanner = { kind: 'error'; message: string } | { kind: 'success'; message: string } | null

export default function LoginPage() {
  const isV2 = useUiV2()
  const router = useRouter()
  const id = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [banner, setBanner] = useState<LoginBanner>(null)
  const [loading, setLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [signupHref, setSignupHref] = useState('/signup')
  const [returnTo, setReturnTo] = useState<string | null>(null)

  const emailId = `${id}-email`
  const passwordId = `${id}-password`

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const returnPath = sanitizeReturnPath(params.get('return'))
    if (returnPath) {
      setSignupHref(`/signup?return=${encodeURIComponent(returnPath)}`)
      setReturnTo(returnPath)
    }
    const authError = params.get('error')
    if (authError === 'auth_failed') {
      setErrors({ general: 'Sign-in failed. Please try again.' })
    }
    if (params.get('reset') === '1') {
      setBanner({ kind: 'success', message: 'Password updated — sign in with your new password.' })
    }
  }, [])

  function clearFieldError(field: keyof LoginErrors) {
    if (errors[field] || errors.general) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
    }
    if (banner) setBanner(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setBanner(null)

    const result = loginSchema.safeParse({ email, password })
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      setErrors({ email: flat.email?.[0], password: flat.password?.[0] })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, return_to: returnTo }),
      })
      const data = await res.json() as { redirectTo?: string; error?: string }

      if (!res.ok) {
        setErrors({ general: 'Incorrect email or password. Please try again.' })
        return
      }

      // Sign in on the client-side Supabase instance so onAuthStateChange fires
      // and AuthContext picks up the session without a full page reload.
      const supabase = createClient()
      await supabase.auth.signInWithPassword({ email, password }).catch(() => {
        // Best-effort — the server already authenticated, cookies are set.
        // The router.refresh() below will revalidate server components anyway.
      })

      router.push(data.redirectTo ?? '/patient/dashboard')
      router.refresh()
    } catch {
      setErrors({ general: 'Unable to sign in right now. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const inputBase = 'flex-1 border-none bg-transparent py-4 text-[15px] text-gray-900 outline-none placeholder:text-gray-400'

  const cardClass = isV2
    ? 'bg-white rounded-[8px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700'
    : 'w-full rounded-[var(--sq-lg)] border border-gray-200 bg-white p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500'

  return (
    <div className={cardClass} data-ui-version={isV2 ? 'v2' : 'v1'}>
      <div className="space-y-6">

        {/* Logo + heading */}
        <div className="flex flex-col items-center text-center space-y-2">
          <BpLogo href="/" size="auth" className="h-10 w-[200px]" linkClassName="justify-center" />
          <h1 className={cn('mt-1 text-2xl font-bold tracking-tight', isV2 ? 'text-bp-primary' : 'text-gray-900')}>
            Welcome back
          </h1>
          <p className="text-sm text-gray-500">Sign in to your BookPhysio account</p>
        </div>

        {/* Email + password form */}
        <div>
          {errors.general && (
            <div role="alert" className="mb-4 flex items-center gap-2.5 rounded-[var(--sq-xs)] border border-red-100 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-600">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              {errors.general}
            </div>
          )}
          {banner && !errors.general && (
            <div
              role="status"
              className={cn(
                'mb-4 flex items-center gap-2.5 rounded-[var(--sq-xs)] border px-3.5 py-3 text-sm font-medium',
                banner.kind === 'success'
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
                  : 'border-red-100 bg-red-50 text-red-600',
              )}
            >
              {banner.message}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor={emailId} className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className={cn(
                'flex overflow-hidden rounded-[var(--sq-xs)] border bg-white transition-colors',
                errors.email ? 'border-red-300' : emailFocused ? 'border-bp-primary ring-3 ring-bp-primary/10' : 'border-gray-200 hover:border-gray-300'
              )}>
                <span className="flex shrink-0 items-center pl-3 pr-2">
                  <Mail className={cn('h-4 w-4 transition-colors', emailFocused ? 'text-bp-primary' : 'text-gray-400')} />
                </span>
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearFieldError('email') }}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className={cn(inputBase, 'pr-4')}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="text-xs font-medium text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor={passwordId} className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link href="/forgot-password" className="text-xs font-medium text-bp-primary hover:text-bp-primary-dark transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className={cn(
                'flex overflow-hidden rounded-[var(--sq-xs)] border bg-white transition-colors',
                errors.password ? 'border-red-300' : passwordFocused ? 'border-bp-primary ring-3 ring-bp-primary/10' : 'border-gray-200 hover:border-gray-300'
              )}>
                <span className="flex shrink-0 items-center pl-3 pr-2">
                  <Lock className={cn('h-4 w-4 transition-colors', passwordFocused ? 'text-bp-primary' : 'text-gray-400')} />
                </span>
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearFieldError('password') }}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  className={cn(inputBase, 'flex-1')}
                  aria-invalid={!!errors.password}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="flex shrink-0 items-center pr-3 pl-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs font-medium text-red-500">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-2 rounded-[var(--sq-xs)] bg-bp-primary py-2.5 text-sm font-semibold text-white transition-colors hover:bg-bp-primary-dark disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer links */}
        <div className="space-y-2.5 text-center text-sm">
          <p className="text-gray-500">
            New to BookPhysio?{' '}
            <Link href={signupHref} className="font-semibold text-bp-primary hover:text-bp-primary-dark transition-colors">
              Create an account
            </Link>
          </p>
          <p className="text-gray-400">
            Are you a doctor?{' '}
            <Link href="/doctor-signup" className="font-semibold text-gray-700 hover:text-bp-primary transition-colors">
              Join as a doctor
            </Link>
          </p>
        </div>

        {isV2 && (
          <div className="flex justify-center pt-2">
            <Badge variant="success">Secure · India&apos;s physio platform</Badge>
          </div>
        )}

      </div>
    </div>
  )
}
