'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight, Smartphone, User } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { DemoAccessPanel } from '@/components/auth/DemoAccessPanel'
import { sanitizeReturnPath } from '@/lib/demo/session'
import { cn } from '@/lib/utils'

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

interface SignupFormState {
  name: string
  phone: string
}

interface SignupErrors {
  name?: string
  phone?: string
  general?: string
}

export default function SignupPage() {
  const router = useRouter()
  const [form, setForm] = useState<SignupFormState>({ name: '', phone: '' })
  const [errors, setErrors] = useState<SignupErrors>({})
  const [loading, setLoading] = useState(false)
  const [nameFocused, setNameFocused] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [loginHref, setLoginHref] = useState('/login')

  useEffect(() => {
    const returnTo = sanitizeReturnPath(new URLSearchParams(window.location.search).get('return'))
    if (returnTo) {
      setLoginHref(`/login?return=${encodeURIComponent(returnTo)}`)
    }
  }, [])

  function handleChange(field: keyof SignupFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof SignupErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined, general: undefined }))
    }
  }

  function handleBlur(field: keyof SignupFormState) {
    const value = form[field]
    if (!value) return
    const singleField = signupSchema.pick({ [field]: true } as Record<typeof field, true>)
    const result = singleField.safeParse({ [field]: value })
    if (!result.success) {
      setErrors((prev) => ({ ...prev, [field]: result.error.issues[0].message }))
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const result = signupSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: SignupErrors = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignupErrors
        fieldErrors[field] = issue.message
      }
      setErrors(fieldErrors)
      return
    }
    setLoading(true)
    const rawPhone = form.phone.replace(/\D/g, '')
    const cleanPhone = rawPhone.length === 10 ? `+91${rawPhone}` : (rawPhone.startsWith('91') && rawPhone.length === 12 ? `+${rawPhone}` : `+91${rawPhone}`)
    const returnTo = sanitizeReturnPath(typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('return'))

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        // On static export (GitHub Pages), API routes don't exist — still allow navigation
        if (res.status === 404) {
          const params = new URLSearchParams({ phone: '91' + form.phone, name: form.name, flow: 'signup' })
          if (returnTo) {
            params.set('return', returnTo)
          }
          router.push('/verify-otp?' + params.toString())
          return
        }
        setErrors({ general: data.error ?? 'Failed to send OTP. Try again.' })
        return
      }
      const params = new URLSearchParams({
        phone: '91' + form.phone,
        name: form.name,
        flow: 'signup',
      })
      if (returnTo) {
        params.set('return', returnTo)
      }
      router.push('/verify-otp?' + params.toString())
    } catch {
      // Network error on static export — still navigate to OTP page
      const params = new URLSearchParams({ phone: '91' + form.phone, name: form.name, flow: 'signup' })
      if (returnTo) {
        params.set('return', returnTo)
      }
      router.push('/verify-otp?' + params.toString())
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[40px] p-8 sm:p-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
      <BpLogo />

      <h1 className="text-[28px] font-black text-bp-primary mb-2 mt-10 tracking-tighter leading-none">
        Create your account
      </h1>
      <p className="text-[15px] font-bold text-bp-body/40 mb-10">Find and book physios near you</p>

      {errors.general && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] font-bold text-red-600 animate-in fade-in zoom-in-95">
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Full Name */}
        <div className="mb-6">
          <label htmlFor="name" className="block text-[11px] font-black uppercase tracking-[0.2em] text-bp-body/40 mb-2 ml-1">
            Full Name
          </label>
          <div className="relative group">
            <input
              id="name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              className={cn(
                "w-full pl-12 pr-4 py-4 text-[16px] font-bold text-bp-primary bg-bp-surface rounded-2xl outline-none border-2 transition-all",
                errors.name ? "border-red-200 bg-red-50/30" : nameFocused ? "border-bp-accent bg-white shadow-xl shadow-bp-primary/5" : "border-transparent hover:border-bp-border"
              )}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => { setNameFocused(false); handleBlur('name') }}
            />
            <User className={cn("absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors", nameFocused ? "text-bp-accent" : "text-bp-body/20")} />
          </div>
          {errors.name && (
            <p className="text-[11px] font-bold text-red-500 mt-1.5 ml-1">{errors.name}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div className="mb-10">
          <label htmlFor="phone" className="block text-[11px] font-black uppercase tracking-[0.2em] text-bp-body/40 mb-2 ml-1">
            Mobile Number
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Smartphone className={cn("w-5 h-5 transition-colors", phoneFocused ? "text-bp-accent" : "text-bp-body/20")} />
              <span className="text-[16px] font-bold text-bp-primary/40 border-r border-bp-border pr-2">+91</span>
            </div>
            <input
              id="phone"
              type="tel"
              placeholder="98765 43210"
              className={cn(
                "w-full pl-24 pr-4 py-4 text-[16px] font-bold text-bp-primary bg-bp-surface rounded-2xl outline-none border-2 transition-all",
                errors.phone ? "border-red-200 bg-red-50/30" : phoneFocused ? "border-bp-accent bg-white shadow-xl shadow-bp-primary/5" : "border-transparent hover:border-bp-border"
              )}
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => { setPhoneFocused(false); handleBlur('phone') }}
            />
          </div>
          {errors.phone && (
            <p className="text-[11px] font-bold text-red-500 mt-1.5 ml-1">{errors.phone}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-white rounded-[24px] transition-all shadow-xl shadow-bp-primary/10 active:scale-[0.98]",
            loading ? "bg-bp-primary/40 cursor-not-allowed" : "bg-bp-primary hover:bg-bp-accent hover:shadow-bp-accent/20"
          )}
        >
          {loading ? 'Creating account...' : (
            <>
              Create Account
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-10 text-center border-t border-bp-border pt-8">
        <p className="text-[14px] font-bold text-bp-body/40">
          Already have an account?{' '}
          <Link
            href={loginHref}
            className="text-bp-accent hover:text-bp-primary transition-colors ml-1"
          >
            Log in here
          </Link>
        </p>
      </div>
    </div>
  )
}
