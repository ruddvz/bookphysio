'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Smartphone, User } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { savePendingOtp } from '@/lib/auth/pending-otp'
import { sanitizeReturnPath } from '@/lib/demo/session'
import { cn } from '@/lib/utils'
import { formatIndianPhone, stripPhoneFormat } from '@/lib/format-phone'

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

interface SignupForm {
  name: string
  email: string
  password: string
  phone: string
}

interface SignupErrors {
  name?: string
  email?: string
  password?: string
  phone?: string
  general?: string
}

export default function SignupPage() {
  const router = useRouter()
  const id = useId()
  const [form, setForm] = useState<SignupForm>({ name: '', email: '', password: '', phone: '' })
  const [errors, setErrors] = useState<SignupErrors>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [focused, setFocused] = useState<keyof SignupForm | null>(null)
  const [loginHref, setLoginHref] = useState('/login')

  const nameId = `${id}-name`
  const emailId = `${id}-email`
  const passwordId = `${id}-password`
  const phoneId = `${id}-phone`

  useEffect(() => {
    const returnTo = sanitizeReturnPath(new URLSearchParams(window.location.search).get('return'))
    if (returnTo) setLoginHref(`/login?return=${encodeURIComponent(returnTo)}`)
  }, [])

  function set(field: keyof SignupForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field] || errors.general) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
    }
  }

  function handleBlur(field: keyof SignupForm) {
    const value = form[field]
    if (!value) return
    const partial = signupSchema.pick({ [field]: true } as Record<typeof field, true>)
    const result = partial.safeParse({ [field]: value })
    if (!result.success) {
      setErrors((prev) => ({ ...prev, [field]: result.error.issues[0].message }))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})

    const result = signupSchema.safeParse(form)
    if (!result.success) {
      const flat = result.error.flatten().fieldErrors
      setErrors({
        name: flat.name?.[0],
        email: flat.email?.[0],
        password: flat.password?.[0],
        phone: flat.phone?.[0],
      })
      return
    }

    setLoading(true)
    const rawPhone = form.phone.replace(/\D/g, '')
    const cleanPhone = rawPhone.length === 10 ? `+91${rawPhone}` : `+91${rawPhone}`
    const returnTo = sanitizeReturnPath(new URLSearchParams(window.location.search).get('return'))
    const flowId = crypto.randomUUID()

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          flow: 'signup',
          flow_id: flowId,
          full_name: result.data.name.trim(),
          return_to: returnTo,
        }),
      })

      if (!res.ok) {
        setErrors({ general: 'Could not send the verification code. Please try again.' })
        return
      }

      // Store credentials in sessionStorage — used after OTP to link email+password
      try {
        sessionStorage.setItem('bp-pending-credentials', JSON.stringify({
          email: result.data.email,
          password: result.data.password,
        }))
      } catch {
        // sessionStorage unavailable — credentials will be skipped, user can set via forgot-password
      }

      savePendingOtp({ flow: 'signup', flowId, returnTo })
      router.push(`/verify-otp?flow=${encodeURIComponent(flowId)}`)
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const fieldWrap = (field: keyof SignupForm, hasError: boolean) =>
    cn(
      'flex overflow-hidden rounded-[20px] border-2 bg-white transition-all duration-200 shadow-sm',
      hasError
        ? 'border-red-200 bg-red-50/30'
        : focused === field
        ? 'border-bp-accent shadow-lg shadow-bp-primary/8 ring-4 ring-bp-accent/5'
        : 'border-bp-border/70 hover:border-bp-border'
    )

  const inputClass = 'flex-1 border-none bg-transparent py-4 text-[15px] font-semibold text-bp-primary outline-none placeholder:text-bp-primary/25 pr-5'
  const iconClass = (field: keyof SignupForm) =>
    cn('h-4 w-4 transition-colors', focused === field ? 'text-bp-accent' : 'text-bp-primary/30')

  return (
    <div className="w-full rounded-[42px] border border-white/80 bg-white/82 p-8 pb-10 shadow-[0_30px_80px_-40px_rgba(33,42,71,0.35)] ring-1 ring-bp-primary/5 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 sm:p-10 sm:pb-12">
      <div className="space-y-7">

        {/* Logo + heading */}
        <div className="flex flex-col items-center text-center space-y-3">
          <BpLogo href="/" size="auth" className="h-12 w-[220px]" linkClassName="justify-center" />
          <h1 className="text-[28px] font-bold leading-tight tracking-[-0.03em] text-bp-primary sm:text-[32px]">
            Create your account
          </h1>
          <p className="text-[14px] text-bp-body/60 font-medium">Your phone number is verified via OTP — once only</p>
        </div>

        <section className="rounded-[28px] border border-bp-border/70 bg-white p-6 shadow-sm shadow-bp-primary/5 sm:p-7">
          {errors.general && (
            <div role="alert" className="mb-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-3.5 text-[13px] font-semibold text-red-600 animate-in fade-in zoom-in-95">
              <div className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full name */}
            <div className="space-y-2">
              <label htmlFor={nameId} className="ml-1 block text-[11px] font-bold uppercase tracking-[0.24em] text-bp-body/45">
                Full name
              </label>
              <div className={fieldWrap('name', !!errors.name)}>
                <span className="flex shrink-0 items-center pl-4 pr-3">
                  <User className={iconClass('name')} />
                </span>
                <input
                  id={nameId}
                  type="text"
                  autoComplete="name"
                  placeholder="Rahul Sharma"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  onFocus={() => setFocused('name')}
                  onBlur={() => { setFocused(null); handleBlur('name') }}
                  className={inputClass}
                  aria-invalid={!!errors.name}
                />
              </div>
              {errors.name && <p className="ml-1 text-[12px] font-semibold text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor={emailId} className="ml-1 block text-[11px] font-bold uppercase tracking-[0.24em] text-bp-body/45">
                Email address
              </label>
              <div className={fieldWrap('email', !!errors.email)}>
                <span className="flex shrink-0 items-center pl-4 pr-3">
                  <Mail className={iconClass('email')} />
                </span>
                <input
                  id={emailId}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  onFocus={() => setFocused('email')}
                  onBlur={() => { setFocused(null); handleBlur('email') }}
                  className={inputClass}
                  aria-invalid={!!errors.email}
                />
              </div>
              {errors.email && <p className="ml-1 text-[12px] font-semibold text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor={passwordId} className="ml-1 block text-[11px] font-bold uppercase tracking-[0.24em] text-bp-body/45">
                Password
              </label>
              <div className={fieldWrap('password', !!errors.password)}>
                <span className="flex shrink-0 items-center pl-4 pr-3">
                  <Lock className={iconClass('password')} />
                </span>
                <input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  onFocus={() => setFocused('password')}
                  onBlur={() => { setFocused(null); handleBlur('password') }}
                  className="flex-1 border-none bg-transparent py-4 text-[15px] font-semibold text-bp-primary outline-none placeholder:text-bp-primary/25"
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

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor={phoneId} className="ml-1 block text-[11px] font-bold uppercase tracking-[0.24em] text-bp-body/45">
                Mobile number <span className="normal-case font-normal text-bp-body/40">(for OTP verification)</span>
              </label>
              <div className={fieldWrap('phone', !!errors.phone)}>
                <span className="flex shrink-0 items-center border-r border-bp-border/70 bg-bp-surface/60 px-4 py-4 text-[14px] font-bold text-bp-primary gap-2">
                  <Smartphone className={iconClass('phone')} />
                  +91
                </span>
                <input
                  id={phoneId}
                  type="tel"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  maxLength={12}
                  value={formatIndianPhone(form.phone)}
                  onChange={(e) => set('phone', stripPhoneFormat(e.target.value))}
                  onFocus={() => setFocused('phone')}
                  onBlur={() => { setFocused(null); handleBlur('phone') }}
                  className="flex-1 border-none bg-transparent px-4 py-4 text-[15px] font-semibold text-bp-primary outline-none placeholder:text-bp-primary/25"
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone
                ? <p className="ml-1 text-[12px] font-semibold text-red-500">{errors.phone}</p>
                : <p className="ml-1 text-[12px] text-bp-body/45">We&apos;ll send a one-time code to verify your number.</p>
              }
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={cn(
                'relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-[20px] py-4 text-[15px] font-bold text-white shadow-lg transition-all active:scale-[0.98] group',
                loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-bp-primary hover:bg-bp-accent shadow-bp-primary/20'
              )}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Sending code…</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">Continue — verify phone</span>
                  <ArrowRight size={16} strokeWidth={3} className="relative z-10 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-bp-accent to-bp-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </>
              )}
            </button>
          </form>
        </section>

        <p className="text-center text-[14px] font-semibold tracking-tight text-bp-body/60">
          Already have an account?{' '}
          <Link href={loginHref} className="font-bold text-bp-accent no-underline hover:text-bp-accent/80 transition-colors">
            Sign in
          </Link>
        </p>

      </div>
    </div>
  )
}
