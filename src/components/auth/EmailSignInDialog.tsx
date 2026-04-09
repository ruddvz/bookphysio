"use client"

import { useEffect, useId, useState } from "react"
import { ArrowRight, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AUTH_COPY, type StaticLocale } from "@/lib/i18n/dynamic-pages"
import { cn } from "@/lib/utils"

interface EmailSignInDialogProps {
  locale?: StaticLocale
  open?: boolean
  onOpenChange?: (open: boolean) => void
  returnTo?: string | null
  triggerClassName?: string
}

export default function EmailSignInDialog({
  locale,
  open,
  onOpenChange,
  returnTo,
  triggerClassName,
}: EmailSignInDialogProps) {
  const t = AUTH_COPY[locale ?? "en"]
  const id = useId()
  const emailErrorId = `${id}-email-error`
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  useEffect(() => {
    if (!open) {
      setEmail("")
      setError("")
      setLoading(false)
      setMagicLinkSent(false)
    }
  }, [open])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (loading) {
      return
    }

    const normalizedEmail = email.trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError(t.loginEmailValidationError)
      return
    }

    setLoading(true)
    setError("")
    setEmail(normalizedEmail)

    try {
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(returnTo ? { email: normalizedEmail, returnTo } : { email: normalizedEmail }),
      })

      if (!response.ok) {
        throw new Error(t.emailRequestError)
      }

      setMagicLinkSent(true)
    } catch {
      setError(t.emailRequestError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex min-h-12 items-center justify-center rounded-full border border-bp-border/80 bg-white px-4 py-2 text-[13px] font-bold text-bp-primary shadow-lg shadow-bp-primary/5 transition-all hover:-translate-y-0.5 hover:border-bp-accent/40 hover:text-bp-accent',
            triggerClassName,
          )}
        >
          {t.loginEmailTrigger}
        </button>
      </DialogTrigger>
      <DialogContent className="rounded-[34px] border-bp-border bg-[#fffdfa] p-6 shadow-2xl shadow-black/10 sm:max-w-[430px] sm:p-8">
        {magicLinkSent ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex size-14 items-center justify-center rounded-full border border-bp-border bg-white text-bp-primary shadow-sm shadow-bp-primary/5">
              <Mail className="size-6" />
            </div>
            <DialogHeader className="items-center">
              <DialogTitle className="text-2xl text-bp-primary">{t.loginInboxTitle}</DialogTitle>
              <DialogDescription className="max-w-sm text-sm text-bp-body/70">
                {t.loginInboxBody(email)}
              </DialogDescription>
            </DialogHeader>
            <Button type="button" className="h-12 w-full rounded-2xl text-base" onClick={() => onOpenChange?.(false)}>
              {t.loginBackToLogin}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-4 text-center">
              <span className="inline-flex items-center rounded-full bg-bp-primary-light px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-bp-primary">
                {t.loginEmailEyebrow}
              </span>
              <div
                className="flex size-12 shrink-0 items-center justify-center rounded-full border border-bp-border bg-white text-bp-primary shadow-sm shadow-bp-primary/5"
                aria-hidden="true"
              >
                <Mail className="size-5" />
              </div>
              <DialogHeader className="items-center">
                <DialogTitle className="text-[28px] leading-none text-bp-primary">{t.loginEmailDialogTitle}</DialogTitle>
                <DialogDescription className="max-w-sm text-[14px] leading-6 text-bp-body/70">
                  {t.loginEmailDialogBody}
                </DialogDescription>
              </DialogHeader>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="space-y-2.5">
                <Label htmlFor={`${id}-email`} className="text-[11px] font-bold uppercase tracking-[0.18em] text-bp-body/55">
                  {t.loginLabelEmail}
                </Label>
                <Input
                  id={`${id}-email`}
                  value={email}
                  placeholder="hi@yourcompany.com"
                  type="email"
                  required
                  {...(error
                    ? {
                        'aria-invalid': 'true',
                        'aria-describedby': emailErrorId,
                      }
                    : {})}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (error) {
                      setError("")
                    }
                  }}
                  className="h-13 rounded-2xl border-bp-border bg-white px-4 text-base text-bp-primary shadow-sm shadow-bp-primary/5"
                />
              </div>

              {error ? <p id={emailErrorId} role="alert" className="text-sm font-bold text-red-500">{error}</p> : null}

              <Button type="submit" disabled={loading} className="h-13 w-full rounded-2xl text-base shadow-lg shadow-bp-primary/10">
                {loading ? t.loginButtonLoading : t.loginButtonEmail}
              </Button>
            </form>

            <div className="rounded-2xl border border-bp-border/70 bg-white px-4 py-3 text-center text-xs font-bold text-bp-body/60">
              {t.loginEmailDialogHint}
            </div>

            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 text-sm font-bold text-bp-body/50 transition-colors hover:text-bp-accent"
              onClick={() => onOpenChange?.(false)}
            >
              {t.loginTabPhone}
              <ArrowRight className="size-4" />
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}