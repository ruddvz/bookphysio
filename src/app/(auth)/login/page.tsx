'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { createClient } from '@/lib/supabase/client'
import { sanitizeReturnPath } from '@/lib/demo/session'
import { cn } from '@/lib/utils'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Enter your password'),
})

interface LoginErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const router = useRouter()
  const id = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<LoginErrors>({})
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)
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
  }, [])

  function clearFieldError(field: keyof LoginErrors) {
    if (errors[field] || errors.general) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})

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

      router.push(data.redirectTo ?? '/patient/dashboard')
    } catch {
      setErrors({ general: 'Unable to sign in right now. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  async function handleOAuth(provider: 'google' | 'apple') {
    setOauthLoading(provider)
    try {
      const supabase = createClient()
      const callbackUrl = new URL('/api/auth/callback', window.location.origin)
      if (returnTo) callbackUrl.searchParams.set('return_to', returnTo)

      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: callbackUrl.toString() },
      })
    } catch {
      setErrors({ general: 'Could not connect to the sign-in provider. Please try again.' })
      setOauthLoading(null)
    }
  }

  const inputBase = 'flex-1 border-none bg-transparent py-4 text-[15px] font-semibold text-bp-primary outline-none placeholder:text-bp-primary/25'

  return (
    <div className="w-full rounded-[42px] border border-white/80 bg-white/82 p-8 pb-10 shadow-[0_30px_80px_-40px_rgba(33,42,71,0.35)] ring-1 ring-bp-primary/5 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 sm:p-10 sm:pb-12">
      <div className="space-y-7">

        {/* Logo + heading */}
        <div className="flex flex-col items-center text-center space-y-3">
          <BpLogo href="/" size="auth" className="h-12 w-[220px]" linkClassName="justify-center" />
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-bp-primary sm:text-[32px]">
            Welcome back
          </h1>
          <p className="text-[14px] text-bp-body/60 font-medium">Sign in to your BookPhysio account</p>
        </div>

        {/* OAuth buttons */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={!!oauthLoading || loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-[16px] border-2 border-bp-border/80 bg-white py-3 text-[13px] font-bold text-bp-primary transition-all hover:border-bp-border hover:shadow-md disabled:opacity-50"
          >
            {oauthLoading === 'google' ? (
              <div className="h-4 w-4 rounded-full border-2 border-bp-primary/20 border-t-bp-primary animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('apple')}
            disabled={!!oauthLoading || loading}
            className="flex w-full items-center justify-center gap-2.5 rounded-[16px] border-2 border-bp-border/80 bg-white py-3 text-[13px] font-bold text-bp-primary transition-all hover:border-bp-border hover:shadow-md disabled:opacity-50"
          >
            {oauthLoading === 'apple' ? (
              <div className="h-4 w-4 rounded-full border-2 border-bp-primary/20 border-t-bp-primary animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
              </svg>
            )}
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-bp-border/60" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-bp-body/35">or</span>
          <div className="h-px flex-1 bg-bp-border/60" />
        </div>

        {/* Email + password form */}
        <section className="rounded-[28px] border border-bp-border/70 bg-white p-6 shadow-sm shadow-bp-primary/5 sm:p-7">
          {errors.general && (
            <div role="alert" className="mb-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-3.5 text-[13px] font-semibold text-red-600 animate-in fade-in zoom-in-95">
              <div className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div className="space-y-2">
              <label htmlFor={emailId} className="ml-1 block text-[11px] font-bold uppercase tracking-[0.24em] text-bp-body/45">
                Email address
              </label>
              <div className={cn(
                'flex overflow-hidden rounded-[20px] border-2 bg-white transition-all duration-200 shadow-sm',
                errors.email ? 'border-red-200 bg-red-50/30' : emailFocused ? 'border-bp-accent shadow-lg shadow-bp-primary/8 ring-4 ring-bp-accent/5' : 'border-bp-border/70 hover:border-bp-border'
              )}>
                <span className="flex shrink-0 items-center pl-4 pr-3">
                  <Mail className={cn('h-4 w-4 transition-colors', emailFocused ? 'text-bp-accent' : 'text-bp-primary/30')} />
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
                  className={cn(inputBase, 'pr-5')}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="ml-1 text-[12px] font-semibold text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor={passwordId} className="ml-1 block text-[11px] font-bold uppercase tracking-[0.24em] text-bp-body/45">
                  Password
                </label>
                <Link href="/forgot-password" className="text-[12px] font-bold text-bp-accent no-underline hover:text-bp-primary transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className={cn(
                'flex overflow-hidden rounded-[20px] border-2 bg-white transition-all duration-200 shadow-sm',
                errors.password ? 'border-red-200 bg-red-50/30' : passwordFocused ? 'border-bp-accent shadow-lg shadow-bp-primary/8 ring-4 ring-bp-accent/5' : 'border-bp-border/70 hover:border-bp-border'
              )}>
                <span className="flex shrink-0 items-center pl-4 pr-3">
                  <Lock className={cn('h-4 w-4 transition-colors', passwordFocused ? 'text-bp-accent' : 'text-bp-primary/30')} />
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
                  className="flex shrink-0 items-center pr-4 pl-2 text-bp-primary/30 hover:text-bp-primary transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="ml-1 text-[12px] font-semibold text-red-500">{errors.password}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!oauthLoading}
              className={cn(
                'relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-[20px] py-4 text-[15px] font-bold text-white shadow-lg transition-all active:scale-[0.98] group',
                loading || oauthLoading ? 'bg-gray-200 cursor-not-allowed' : 'bg-bp-primary hover:bg-bp-accent shadow-bp-primary/20'
              )}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Signing in…</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">Sign in</span>
                  <ArrowRight size={16} strokeWidth={3} className="relative z-10 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-bp-accent to-bp-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </>
              )}
            </button>
          </form>
        </section>

        {/* Footer links */}
        <div className="space-y-3 text-center">
          <p className="text-[14px] font-semibold tracking-tight text-bp-body/60">
            New to BookPhysio?{' '}
            <Link href={signupHref} className="font-bold text-bp-accent no-underline hover:text-bp-accent/80 transition-colors">
              Create an account
            </Link>
          </p>
          <p className="flex items-center justify-center gap-1 text-[14px] font-semibold tracking-tight text-bp-body/45">
            Are you a doctor?{' '}
            <Link href="/doctor-signup" className="inline-flex items-center gap-1 font-bold text-bp-primary no-underline hover:text-bp-accent transition-colors">
              Join as a doctor
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
