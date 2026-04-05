'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight, Smartphone, User } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { savePendingOtp } from '@/lib/auth/pending-otp'
import { sanitizeReturnPath } from '@/lib/demo/session'
import { cn } from '@/lib/utils'
import { AUTH_COPY, localePath, type StaticLocale } from '@/lib/i18n/dynamic-pages'

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

export default function SignupPage({ locale }: { locale?: StaticLocale } = {}) {
  const t = AUTH_COPY[locale ?? 'en']
  const router = useRouter()
  const [form, setForm] = useState<SignupFormState>({ name: '', phone: '' })
  const [errors, setErrors] = useState<SignupErrors>({})
  const [loading, setLoading] = useState(false)
  const [nameFocused, setNameFocused] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const [loginHref, setLoginHref] = useState(localePath(locale ?? 'en', '/login'))

  useEffect(() => {
    const returnTo = sanitizeReturnPath(new URLSearchParams(window.location.search).get('return'))
    if (returnTo) {
      setLoginHref(`${localePath(locale ?? 'en', '/login')}?return=${encodeURIComponent(returnTo)}`)
    }
  }, [locale])

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
        body: JSON.stringify({ phone: cleanPhone, flow: 'signup' }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { error?: string }
        setErrors({ general: data.error ?? 'Failed to send OTP. Try again.' })
        return
      }

      const otpStateSaved = savePendingOtp({
        phone: '91' + form.phone,
        flow: 'signup',
        fullName: form.name,
        returnTo,
      })

      if (!otpStateSaved) {
        setErrors({ general: 'Unable to continue. Please retry.' })
        return
      }

      router.push(localePath(locale ?? 'en', '/verify-otp'))
    } catch {
      setErrors({ general: 'Unable to reach the OTP service. Try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-center">
        <BpLogo href="/" size="auth" linkClassName="mx-auto" />
      </div>

      <h1 className="text-[32px] font-bold text-bp-primary mb-2 mt-10 tracking-tighter leading-none">
        {t.signupHeading}
      </h1>
      <p className="text-[16px] font-bold text-bp-body/40 mb-10">{t.signupSubheading}</p>

      {errors.general && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 p-5 text-[13px] font-bold text-red-600 animate-in fade-in zoom-in-95 flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="name" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-bp-body/40 mb-3 ml-2">
            {t.signupLabelName}
          </label>
          <div className="relative group">
            <input
              id="name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              className={cn(
                "w-full pl-14 pr-6 py-5 text-[17px] font-bold text-bp-primary bg-bp-surface/50 rounded-2xl outline-none border-2 transition-all duration-500",
                errors.name 
                  ? "border-red-100 bg-red-50/20" 
                  : nameFocused 
                    ? "border-bp-accent bg-white shadow-2xl shadow-bp-primary/5 ring-4 ring-bp-accent/5" 
                    : "border-bp-border hover:border-bp-border"
              )}
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => { setNameFocused(false); handleBlur('name') }}
            />
            <User className={cn("absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-500", nameFocused ? "text-bp-accent" : "text-bp-body/30")} />
          </div>
          {errors.name && <p className="text-[12px] font-bold text-red-500 mt-3 ml-4 animate-in slide-in-from-top-2">{errors.name}</p>}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="phone" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-bp-body/40 mb-3 ml-2">
            {t.signupLabelPhone}
          </label>
          <div className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-2 z-10">
              <Smartphone className={cn("w-5 h-5 transition-colors duration-500", phoneFocused ? "text-bp-accent" : "text-bp-body/30")} />
              <span className={cn("text-[17px] font-bold transition-colors duration-500", phoneFocused ? "text-bp-accent" : "text-bp-body/40")}>+91</span>
            </div>
            <input
              id="phone"
              type="tel"
              placeholder="98765 43210"
              className={cn(
                "w-full pl-28 pr-6 py-5 text-[18px] font-bold text-bp-primary bg-bp-surface/50 rounded-2xl outline-none border-2 transition-all duration-500",
                errors.phone 
                  ? "border-red-100 bg-red-50/20" 
                  : phoneFocused 
                    ? "border-bp-accent bg-white shadow-2xl shadow-bp-primary/5 ring-4 ring-bp-accent/5" 
                    : "border-bp-border hover:border-bp-border"
              )}
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value.replace(/\D/g, ''))}
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => { setPhoneFocused(false); handleBlur('phone') }}
            />
          </div>
          {errors.phone && <p className="text-[12px] font-bold text-red-500 mt-3 ml-4 animate-in slide-in-from-top-2">{errors.phone}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full flex items-center justify-center gap-3 py-6 text-[16px] font-bold text-white rounded-2xl transition-all active:scale-[0.98] relative overflow-hidden group shadow-xl mt-4",
            loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-bp-primary hover:bg-bp-accent shadow-bp-primary/10'
          )}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              <span>{t.signupButtonLoading}</span>
            </div>
          ) : (
            <>
              <span className="relative z-10">{t.signupButtonSubmit}</span>
              <ArrowRight size={18} strokeWidth={4} className="text-bp-accent/70 group-hover:translate-x-1 transition-transform relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-r from-bp-accent to-bp-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </>
          )}
        </button>
      </form>

      <div className="mt-10 text-center border-t border-bp-border pt-8">
        <p className="text-[14px] font-bold text-bp-body/40">
          {t.signupAlreadyAccount}{' '}
          <Link
            href={loginHref}
            className="text-bp-accent hover:text-bp-primary transition-colors ml-1"
          >
            {t.signupLoginLink}
          </Link>
        </p>
      </div>
    </div>
  )
}
