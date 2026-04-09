'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { ArrowRight } from 'lucide-react'
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
        <div className="flex flex-col items-center text-center space-y-4">
          <BpLogo
            href="/"
            size="auth"
            className="h-12 w-[220px]"
            linkClassName="justify-center"
          />
          <h1 className="text-[32px] font-bold leading-tight tracking-[-0.03em] text-bp-primary sm:text-[36px]">
            {t.loginHeading}
          </h1>
          <p className="max-w-[36ch] text-[15px] leading-6 text-bp-body/70">
            {t.loginSubheading}
          </p>
        </div>

        <section className="rounded-[28px] border border-bp-border/70 bg-white p-6 shadow-sm shadow-bp-primary/5 sm:p-7">
          {errors.general && (
            <div role="alert" className="mb-5 flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-3.5 text-[13px] font-semibold text-red-600">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
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

        <div className="relative flex items-center gap-4">
          <div className="h-px flex-1 bg-bp-border/70" />
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-bp-body/45">or</span>
          <div className="h-px flex-1 bg-bp-border/70" />
        </div>

        <EmailSignInDialog
          locale={locale}
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          returnTo={returnTo}
          triggerClassName="w-full justify-center bg-white border border-bp-border/70 shadow-sm shadow-bp-primary/5"
        />

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
