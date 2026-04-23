'use client'

import { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Smartphone, User } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { sanitizeReturnPath } from '@/lib/demo/session'
import { cn } from '@/lib/utils'
import { formatIndianPhone, stripPhoneFormat } from '@/lib/format-phone'
import { useUiV2 } from '@/hooks/useUiV2'

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
  const isV2 = useUiV2()
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
    const cleanPhone = rawPhone.length === 10 ? `+91${rawPhone}` : undefined

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: result.data.name.trim(),
          email: result.data.email,
          password: result.data.password,
          phone: cleanPhone,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: unknown }
        const msg = typeof data.error === 'string' ? data.error : 'Could not create your account. Please try again.'
        setErrors({ general: msg })
        return
      }

      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`)
    } catch {
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const fieldWrap = (field: keyof SignupForm, hasError: boolean) =>
    cn(
      'flex overflow-hidden rounded-[var(--sq-xs)] border bg-white transition-colors',
      hasError
        ? 'border-red-300'
        : focused === field
        ? 'border-bp-primary ring-3 ring-bp-primary/10'
        : 'border-gray-200 hover:border-gray-300'
    )

  const inputClass = 'flex-1 border-none bg-transparent py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 pr-4'
  const iconClass = (field: keyof SignupForm) =>
    cn('h-4 w-4 transition-colors', focused === field ? 'text-bp-primary' : 'text-gray-400')

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
            Create your account
          </h1>
          <p className="text-sm text-gray-500">We&apos;ll send a confirmation link to your email</p>
        </div>

        <div>
          {errors.general && (
            <div role="alert" className="mb-4 flex items-center gap-2.5 rounded-[var(--sq-xs)] border border-red-100 bg-red-50 px-3.5 py-3 text-sm font-medium text-red-600">
              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full name */}
            <div className="space-y-1.5">
              <label htmlFor={nameId} className="block text-sm font-medium text-gray-700">
                Full name
              </label>
              <div className={fieldWrap('name', !!errors.name)}>
                <span className="flex shrink-0 items-center pl-3 pr-2">
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
              {errors.name && <p className="text-xs font-medium text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor={emailId} className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className={fieldWrap('email', !!errors.email)}>
                <span className="flex shrink-0 items-center pl-3 pr-2">
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
              {errors.email && <p className="text-xs font-medium text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor={passwordId} className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className={fieldWrap('password', !!errors.password)}>
                <span className="flex shrink-0 items-center pl-3 pr-2">
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
                  className="flex-1 border-none bg-transparent py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
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

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor={phoneId} className="block text-sm font-medium text-gray-700">
                Mobile number
              </label>
              <div className={fieldWrap('phone', !!errors.phone)}>
                <span className="flex shrink-0 items-center gap-1.5 border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-600">
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
                  className="flex-1 border-none bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  aria-invalid={!!errors.phone}
                />
              </div>
              {errors.phone
                ? <p className="text-xs font-medium text-red-500">{errors.phone}</p>
                : null
              }
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
                  <span>Creating account…</span>
                </>
              ) : (
                <>
                  Create account
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href={loginHref} className="font-semibold text-bp-primary hover:text-bp-primary-dark transition-colors">
            Sign in
          </Link>
        </p>

        {isV2 && (
          <div className="flex justify-center pt-2">
            <Badge variant="success">Secure · India&apos;s physio platform</Badge>
          </div>
        )}

      </div>
    </div>
  )
}
