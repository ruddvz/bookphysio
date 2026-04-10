'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight, Camera, Smartphone, User } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { savePendingOtp } from '@/lib/auth/pending-otp'
import { sanitizeReturnPath } from '@/lib/demo/session'
import { cn } from '@/lib/utils'
import { formatIndianPhone, stripPhoneFormat } from '@/lib/format-phone'
import { AUTH_COPY, type StaticLocale } from '@/lib/i18n/dynamic-pages'

const signupSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
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
  const [loginHref, setLoginHref] = useState('/login')
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const nameErrorId = 'signup-name-error'
  const phoneHintId = 'signup-phone-hint'
  const phoneErrorId = 'signup-phone-error'

  useEffect(() => {
    const returnTo = sanitizeReturnPath(new URLSearchParams(window.location.search).get('return'))
    if (returnTo) {
      setLoginHref(`/login?return=${encodeURIComponent(returnTo)}`)
    }
  }, [])

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setAvatarPreview(dataUrl)
      try {
        sessionStorage.setItem('bp-pending-avatar', JSON.stringify({ dataUrl, mimeType: file.type, fileName: file.name }))
      } catch {
        // sessionStorage unavailable — avatar will be skipped
      }
    }
    reader.readAsDataURL(file)
  }

  function handleChange(field: keyof SignupFormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
      general: undefined,
    }))
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
    const normalizedName = result.data.name
    const rawPhone = form.phone.replace(/\D/g, '')
    const cleanPhone = rawPhone.length === 10 ? `+91${rawPhone}` : (rawPhone.startsWith('91') && rawPhone.length === 12 ? `+${rawPhone}` : `+91${rawPhone}`)
    const returnTo = sanitizeReturnPath(typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('return'))
    const flowId = crypto.randomUUID()

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanPhone,
          flow: 'signup',
          flow_id: flowId,
          full_name: normalizedName,
          return_to: returnTo,
        }),
      })

      if (!res.ok) {
        setErrors({ general: t.signupRequestError })
        return
      }

      const otpStateSaved = savePendingOtp({
        flow: 'signup',
        flowId,
        returnTo,
      })

      if (!otpStateSaved) {
        console.warn('Pending OTP metadata could not be persisted in sessionStorage; continuing with server cookie state only.')
      }

      router.push(`/verify-otp?flow=${encodeURIComponent(flowId)}`)
    } catch {
      setErrors({ general: t.signupRequestError })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full rounded-[42px] border border-white/80 bg-white/82 p-8 pb-10 shadow-[0_30px_80px_-40px_rgba(33,42,71,0.35)] ring-1 ring-bp-primary/5 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 sm:p-10 sm:pb-12">
      <div className="space-y-7">
        <div className="flex flex-col items-center text-center space-y-4">
          <BpLogo
            href="/"
            size="auth"
            className="h-12 w-[220px]"
            linkClassName="justify-center"
          />
          <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em] text-bp-primary sm:text-[36px]">
            {t.signupHeading}
          </h1>
          <p className="max-w-[36ch] text-[15px] leading-6 text-bp-body/70">{t.signupSubheading}</p>
        </div>

        {/* Avatar picker */}
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="group relative h-20 w-20 overflow-hidden rounded-full border-2 border-dashed border-bp-border/70 bg-bp-surface transition-all hover:border-bp-accent hover:bg-bp-accent/5 focus:outline-none focus:ring-2 focus:ring-bp-accent/30"
            aria-label="Upload profile photo"
          >
            {avatarPreview ? (
              <Image src={avatarPreview} alt="Profile preview" fill className="object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1">
                <Camera className="h-6 w-6 text-bp-body/30 transition-colors group-hover:text-bp-accent" />
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/0 transition-all group-hover:bg-black/10">
              <Camera className={cn('h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100', avatarPreview ? 'drop-shadow' : 'hidden')} />
            </div>
          </button>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-bp-body/35">
            {avatarPreview ? 'Tap to change photo' : 'Add profile photo (optional)'}
          </p>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleAvatarChange}
            aria-hidden="true"
          />
        </div>

        <section className="rounded-[28px] border border-bp-border/70 bg-white p-6 shadow-sm shadow-bp-primary/5 sm:p-7">
          {errors.general && (
            <div role="alert" className="mt-5 flex items-center gap-3 rounded-3xl border border-red-100 bg-red-50/50 p-4 text-[13px] font-semibold text-red-600 animate-in fade-in zoom-in-95 backdrop-blur-md">
              <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 shadow-sm shadow-red-200" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
            <div className="space-y-3">
              <label htmlFor="name" className="ml-2 block text-[11px] font-bold uppercase tracking-[0.24em] text-bp-body/45">
                {t.signupLabelName}
              </label>
              <div className="relative group">
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  {...(errors.name
                    ? {
                        'aria-invalid': 'true',
                        'aria-describedby': nameErrorId,
                      }
                    : {})}
                  className={cn(
                    'w-full rounded-[30px] border-2 bg-white py-5 pl-14 pr-6 text-[17px] font-semibold text-bp-primary outline-none shadow-sm shadow-bp-primary/5 transition-all duration-500',
                    errors.name
                      ? 'border-red-100 bg-red-50/30'
                      : nameFocused
                        ? 'border-bp-accent shadow-xl shadow-bp-primary/10 ring-4 ring-bp-accent/5'
                        : 'border-bp-border/70 hover:border-bp-border'
                  )}
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => { setNameFocused(false); handleBlur('name') }}
                />
                <User className={cn('absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors duration-500', nameFocused ? 'text-bp-accent' : 'text-bp-primary/30')} />
              </div>
              {errors.name && <p id={nameErrorId} className="ml-2 text-[12px] font-semibold text-red-500 animate-in slide-in-from-top-2">{errors.name}</p>}
            </div>

            <div className="space-y-3">
              <label htmlFor="phone" className="ml-2 block text-[11px] font-bold uppercase tracking-[0.24em] text-bp-body/45">
                {t.signupLabelPhone}
              </label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 z-10 flex -translate-y-1/2 items-center gap-2">
                  <Smartphone className={cn('h-5 w-5 transition-colors duration-500', phoneFocused ? 'text-bp-accent' : 'text-bp-primary/30')} />
                  <span className={cn('text-[17px] font-bold transition-colors duration-500', phoneFocused ? 'text-bp-accent' : 'text-bp-primary/40')}>+91</span>
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="98765 43210"
                  {...(errors.phone
                    ? {
                        'aria-invalid': 'true',
                        'aria-describedby': `${phoneHintId} ${phoneErrorId}`,
                      }
                    : {
                        'aria-describedby': phoneHintId,
                      })}
                  className={cn(
                    'w-full rounded-[30px] border-2 bg-white py-5 pl-28 pr-6 text-[18px] font-semibold text-bp-primary outline-none shadow-sm shadow-bp-primary/5 transition-all duration-500',
                    errors.phone
                      ? 'border-red-100 bg-red-50/30'
                      : phoneFocused
                        ? 'border-bp-accent shadow-xl shadow-bp-primary/10 ring-4 ring-bp-accent/5'
                        : 'border-bp-border/70 hover:border-bp-border'
                  )}
                  value={formatIndianPhone(form.phone)}
                  onChange={(e) => handleChange('phone', stripPhoneFormat(e.target.value))}
                  onFocus={() => setPhoneFocused(true)}
                  onBlur={() => { setPhoneFocused(false); handleBlur('phone') }}
                />
              </div>
              <p id={phoneHintId} className="ml-2 text-[12px] leading-5 text-bp-body/55">{t.signupPhoneHelper}</p>
              {errors.phone && <p id={phoneErrorId} className="ml-2 text-[12px] font-semibold text-red-500 animate-in slide-in-from-top-2">{errors.phone}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'relative mt-2 flex w-full items-center justify-center gap-3 overflow-hidden rounded-[30px] py-6 text-[16px] font-bold text-white transition-all active:scale-[0.98] group shadow-xl',
                loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-bp-primary hover:bg-bp-accent shadow-bp-primary/20'
              )}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-3 border-white/30 border-t-white animate-spin" />
                  <span>{t.signupButtonLoading}</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">{t.signupButtonSubmit}</span>
                  <ArrowRight size={18} strokeWidth={4} className="relative z-10 text-bp-accent/70 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-bp-accent to-bp-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </>
              )}
            </button>
          </form>
        </section>

        <p className="text-center text-[14px] font-semibold tracking-tight text-bp-body/60">
          {t.signupAlreadyAccount}{' '}
          <Link href={loginHref} className="font-bold text-bp-accent no-underline transition-colors hover:text-bp-accent/80">
            {t.signupLoginOtpLink}
          </Link>
        </p>
      </div>
    </div>
  )
}
