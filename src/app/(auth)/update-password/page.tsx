'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react'

import BpLogo from '@/components/BpLogo'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const MIN_PASSWORD_LENGTH = 8

export default function UpdatePasswordPage() {
  const supabase = createClient()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [updated, setUpdated] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setUpdated(true)
      setPassword('')
      setConfirmPassword('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-[40px] p-8 pb-10 sm:p-12 sm:pb-12 max-w-[440px] w-full shadow-2xl shadow-bp-primary/5 border border-bp-border animate-in fade-in slide-in-from-bottom-8 duration-700">
      <BpLogo href="/" />

      {!updated ? (
        <>
          <h1 className="text-[28px] font-black text-bp-primary mb-2 mt-10 tracking-tighter leading-none">
            Set a new password
          </h1>
          <p className="text-[15px] font-bold text-bp-body/40 mb-10">
            Finish recovering your account with a fresh password.
          </p>

          {error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-[13px] font-bold text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-6">
              <label htmlFor="password" className="block text-[11px] font-black uppercase tracking-[0.2em] text-bp-body/40 mb-2 ml-1">
                New Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className={cn(
                    'w-full pl-12 pr-4 py-4 text-[16px] font-bold text-bp-primary bg-bp-surface rounded-2xl outline-none border-2 transition-all',
                    error ? 'border-red-200 bg-red-50/30' : 'border-transparent hover:border-bp-border focus:border-bp-accent focus:bg-white focus:shadow-xl focus:shadow-bp-primary/5'
                  )}
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bp-body/20" />
              </div>
            </div>

            <div className="mb-10">
              <label htmlFor="confirm-password" className="block text-[11px] font-black uppercase tracking-[0.2em] text-bp-body/40 mb-2 ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Re-enter your new password"
                  className={cn(
                    'w-full pl-12 pr-4 py-4 text-[16px] font-bold text-bp-primary bg-bp-surface rounded-2xl outline-none border-2 transition-all',
                    error ? 'border-red-200 bg-red-50/30' : 'border-transparent hover:border-bp-border focus:border-bp-accent focus:bg-white focus:shadow-xl focus:shadow-bp-primary/5'
                  )}
                />
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bp-body/20" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full flex items-center justify-center gap-3 py-5 text-[16px] font-black text-white rounded-[24px] transition-all shadow-xl shadow-bp-primary/10 active:scale-[0.98]',
                loading ? 'bg-bp-primary/40 cursor-not-allowed' : 'bg-bp-primary hover:bg-bp-accent hover:shadow-bp-accent/20'
              )}
            >
              {loading ? 'Updating…' : (
                <>
                  Update Password
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center mt-10">
          <div className="w-20 h-20 mx-auto rounded-[24px] bg-bp-accent/10 flex items-center justify-center mb-8">
            <CheckCircle2 className="w-10 h-10 text-bp-accent" />
          </div>
          <h1 className="text-[28px] font-black text-bp-primary mb-2 tracking-tighter leading-none">
            Password updated
          </h1>
          <p className="text-[15px] font-bold text-bp-body/40 mb-10 leading-relaxed">
            Your password has been changed. You can now sign back in with your new credentials.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-3 px-6 py-4 text-[15px] font-black text-white bg-bp-primary hover:bg-bp-accent rounded-[24px] transition-all shadow-xl shadow-bp-primary/10"
          >
            Go to Login
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      <div className="mt-10 text-center border-t border-bp-border pt-8">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-bp-body/40 font-bold text-[14px] hover:text-bp-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  )
}