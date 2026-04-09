'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight, ShieldCheck, Smartphone } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import EmailSignInDialog from '@/components/auth/EmailSignInDialog'
import { DemoAccessPanel } from '@/components/auth/DemoAccessPanel'
import { savePendingOtp } from '@/lib/auth/pending-otp'
import { sanitizeReturnPath } from '@/lib/demo/session'
import { cn } from '@/lib/utils'
import { formatIndianPhone, stripPhoneFormat } from '@/lib/format-phone'
import { AUTH_COPY, type StaticLocale } from '@/lib/i18n/dynamic-pages'


const loginSchema = z.object({
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'),
})

interface LoginErrors {
  phone?: string
  general?: string
}

export default function LoginPage({ locale }: { locale?: StaticLocale } = {}) {
  const t = AUTH_COPY[locale ?? 'en']
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})
  const [loading, setLoading] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [signupHref, setSignupHref] = useState('/signup')
  const [returnTo, setReturnTo] = useState<string | null>(null)
  const phoneHintId = 'login-phone-hint'
  const phoneErrorId = 'login-phone-error'

  useEffect(() => {
    phoneInputRef.current?.focus()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const returnPath = sanitizeReturnPath(params.get('return'))
    if (returnPath) {
      setSignupHref(`/signup?return=${encodeURIComponent(returnPath)}`)
      setReturnTo(returnPath)
    }

    if (params.get('mode') === 'email') {
      setEmailDialogOpen(true)
    }
  }, [])

  function handlePhoneChange(value: string) {
    setPhone(stripPhoneFormat(value))
    if (errors.phone || errors.general) setErrors({})
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      const result = loginSchema.safeParse({ phone })
      if (!result.success) {
        setErrors({ phone: result.error.issues[0].message })
        setLoading(false)
        return
      }

      const rawPhone = phone.replace(/\D/g, '')
      const cleanPhone = rawPhone.length === 10 ? `+91${rawPhone}` : (rawPhone.startsWith('91') && rawPhone.length === 12 ? `+${rawPhone}` : `+91${rawPhone}`)
      const flowId = crypto.randomUUID()

      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, flow: 'login', flow_id: flowId, return_to: returnTo }),
      })

      if (!res.ok) {
        throw new Error(t.loginOtpRequestError)
      }

      const otpStateSaved = savePendingOtp({
        flow: 'login',
        flowId,
        returnTo,
      })

      if (!otpStateSaved) {
        console.warn('Pending OTP metadata could not be persisted in sessionStorage; continuing with server cookie state only.')
      }

      router.push(`/verify-otp?flow=${encodeURIComponent(flowId)}`)
    } catch {
      setErrors({ general: t.loginOtpRequestError })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full rounded-[42px] border border-white/80 bg-white/82 p-8 pb-10 shadow-[0_30px_80px_-40px_rgba(33,42,71,0.35)] ring-1 ring-bp-primary/5 backdrop-blur-3xl animate-in fade-in slide-in-from-bottom-8 duration-700 sm:p-10 sm:pb-12">
      <div className="space-y-7">
        <div className="space-y-5">
          <span className="inline-flex items-center rounded-full bg-bp-primary-light px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-bp-primary">
            {t.loginEyebrow}
          </span>
          <BpLogo
            href="/"
            size="auth"
            className="h-10 w-[190px] sm:h-12 sm:w-[220px]"
            linkClassName="justify-start"
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-[36px] font-bold leading-none tracking-[-0.04em] text-bp-primary sm:text-[40px]">
            {t.loginHeading}
          </h1>
          <p className="max-w-[34ch] text-[15px] leading-7 text-bp-body/70 sm:text-[16px]">
            {t.loginSubheading}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <span className="inline-flex items-center gap-2 rounded-full border border-bp-border/70 bg-[#fbfaf7] px-3 py-1.5 text-[11px] font-semibold text-bp-primary">
              <Smartphone className="h-3.5 w-3.5 text-bp-accent" />
              {t.loginFastBadge}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-bp-border/70 bg-[#fbfaf7] px-3 py-1.5 text-[11px] font-semibold text-bp-primary">
              <ShieldCheck className="h-3.5 w-3.5 text-bp-accent" />
              {t.loginPrivateBadge}
            </span>
          </div>
        </div>

        <section className="rounded-[32px] border border-bp-border/70 bg-[#fbfaf7] p-5 shadow-sm shadow-bp-primary/5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-bp-border/70 bg-white text-bp-accent shadow-sm shadow-bp-primary/5">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-bp-body/45">{t.loginPrimaryEyebrow}</p>
              <h2 className="text-[20px] font-bold tracking-tight text-bp-primary">{t.loginPhonePanelTitle}</h2>
              <p className="max-w-[34ch] text-[14px] leading-6 text-bp-body/65">{t.loginPhonePanelBody}</p>
            </div>
          </div>

          {errors.general && (
            <div role="alert" className="mt-5 flex items-center gap-3 rounded-3xl border border-red-100 bg-red-50/60 p-4 text-[13px] font-semibold text-red-600 animate-in fade-in zoom-in-95 backdrop-blur-md">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500 shadow-sm shadow-red-200" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-6">
            <div className="space-y-3">
              <label htmlFor="phone" className="ml-2 block text-[11px] font-bold uppercase tracking-[0.24em] text-bp-body/45">{t.loginLabelPhone}</label>
              <div className={cn(
                'flex overflow-hidden rounded-[30px] border-2 bg-white transition-all duration-500 group shadow-sm shadow-bp-primary/5',
                errors.phone ? 'border-red-100 bg-red-50/40' : inputFocused ? 'border-bp-accent shadow-xl shadow-bp-primary/10 ring-4 ring-bp-accent/5' : 'border-bp-border/70 hover:border-bp-border'
              )}>
                <span className="flex items-center gap-2 border-r border-bp-border/70 bg-[#fffdfa] px-6 py-5 text-[16px] font-bold text-bp-primary transition-colors group-focus-within:text-bp-accent">
                  +91
                </span>
                <input
                  ref={phoneInputRef}
                  id="phone"
                  type="tel"
                  placeholder="98765 43210"
                  maxLength={12}
                  {...(errors.phone
                    ? {
                        'aria-invalid': 'true',
                        'aria-describedby': `${phoneHintId} ${phoneErrorId}`,
                      }
                    : {
                        'aria-describedby': phoneHintId,
                      })}
                  value={formatIndianPhone(phone)}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  className="flex-1 border-none bg-transparent px-6 py-5 text-[18px] font-semibold tracking-tight text-bp-primary outline-none placeholder:text-bp-primary/25"
                />
              </div>
              <p id={phoneHintId} className="ml-2 text-[12px] leading-5 text-bp-body/55">{t.loginPhoneHelper}</p>
              {errors.phone && <p id={phoneErrorId} className="ml-2 text-[12px] font-semibold text-red-500 animate-in slide-in-from-top-2">{errors.phone}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-[30px] py-5 text-[16px] font-bold text-white shadow-xl transition-all active:scale-[0.98] group',
                loading ? 'bg-gray-200 cursor-not-allowed' : 'bg-bp-primary hover:bg-bp-accent shadow-bp-primary/20'
              )}
            >
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-3 border-white/30 border-t-white animate-spin" />
                  <span>{t.loginButtonLoading}</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">{t.loginButtonPhone}</span>
                  <ArrowRight size={18} strokeWidth={3} className="relative z-10 text-bp-accent/70 transition-transform group-hover:translate-x-1" />
                  <div className="absolute inset-0 bg-gradient-to-r from-bp-accent to-bp-accent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                </>
              )}
            </button>
          </form>
        </section>

        <section className="rounded-[32px] border border-bp-border/70 bg-[#fbfaf7] p-5 shadow-sm shadow-bp-primary/5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-bp-border/70 bg-white text-bp-accent shadow-sm shadow-bp-primary/5">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-bp-body/45">{t.loginSecondaryEyebrow}</p>
              <h2 className="text-[20px] font-bold tracking-tight text-bp-primary">{t.loginEmailPanelTitle}</h2>
              <p className="max-w-[34ch] text-[14px] leading-6 text-bp-body/65">{t.loginEmailPanelBody}</p>
            </div>
          </div>

          <EmailSignInDialog
            locale={locale}
            open={emailDialogOpen}
            onOpenChange={setEmailDialogOpen}
            returnTo={returnTo}
            triggerClassName="mt-5 w-full justify-center bg-white shadow-sm shadow-bp-primary/5"
          />
        </section>

        <DemoAccessPanel variant="compact" />

        <div className="space-y-3 text-center">
          <p className="text-[14px] font-semibold tracking-tight text-bp-body/60">
            {t.loginNewUser}{' '}
            <Link href={signupHref} className="font-bold text-bp-accent no-underline transition-colors hover:text-bp-accent/80">
              {t.loginCreateAccount}
            </Link>
          </p>

          <p className="flex items-center justify-center gap-1 text-center text-[14px] font-semibold tracking-tight text-bp-body/45">
            {t.loginIsDoctor}{' '}
            <Link href="/doctor-signup" className="inline-flex items-center gap-1 font-bold text-bp-primary no-underline transition-colors hover:text-bp-accent">
              {t.loginJoinDoctor}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
