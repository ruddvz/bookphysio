'use client'

import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock, LogOut } from 'lucide-react'
import BpLogo from '@/components/BpLogo'
import { createClient } from '@/lib/supabase/client'
import { useUiV2 } from '@/hooks/useUiV2'
import { PendingStepperV2 } from './PendingV2'

export default function ProviderPendingPage() {
  const uiV2 = useUiV2()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-bp-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">

        <div className="flex justify-center mb-8">
          <BpLogo href="/" size="auth" linkClassName="mx-auto" />
        </div>

        {/* Status icon */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-full bg-bp-primary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-bp-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-bp-primary mb-2">
            Application under review
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your account has been created and your email is confirmed.
            Our team is reviewing your credentials — once approved, you will have full access to your provider dashboard.
          </p>
        </div>

        {/* Progress steps */}
        {uiV2 ? (
          <div className="mb-8">
            <PendingStepperV2 />
          </div>
        ) : (
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Account created</p>
                <p className="text-xs text-emerald-600">Registration complete</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Email confirmed</p>
                <p className="text-xs text-emerald-600">Identity verified</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <Clock className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Credentials review</p>
                <p className="text-xs text-amber-600">Our team is reviewing your details</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-400">Dashboard access</p>
                <p className="text-xs text-gray-400">Available after approval</p>
              </div>
            </div>
          </div>
        )}

        <p className="text-xs text-center text-gray-400 mb-6">
          Once approved you can sign in and your dashboard will be ready.
          Check back in 1–2 business days.
        </p>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}
