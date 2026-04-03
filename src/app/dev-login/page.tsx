'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { launchDemoSession } from '@/lib/demo/client'
import type { DemoRole } from '@/lib/demo/session'

// Dev-only login page — only renders in development
// Gives one-click access to patient / provider / admin demo sessions

const ACCOUNTS: Array<{
  role: DemoRole
  label: string
  email: string
  phone: string
  color: string
  badge: string
  emoji: string
}> = [
  {
    role: 'patient',
    label: 'Patient',
    email: 'dev-patient@bookphysio.in',
    phone: '+91 90000 00001',
    color: 'bg-bp-accent/10 border-bp-accent/20 hover:border-bp-accent',
    badge: 'bg-bp-accent/10 text-bp-accent',
    emoji: '🧑‍⚕️',
  },
  {
    role: 'provider',
    label: 'Physiotherapist',
    email: 'dev-provider@bookphysio.in',
    phone: '+91 90000 00002',
    color: 'bg-bp-accent/10 border-bp-accent/30 hover:border-bp-accent',
    badge: 'bg-bp-accent/15 text-bp-accent',
    emoji: '🏥',
  },
  {
    role: 'admin',
    label: 'Admin',
    email: 'dev-admin@bookphysio.in',
    phone: '+91 90000 00003',
    color: 'bg-bp-secondary/10 border-bp-secondary/30 hover:border-orange-400',
    badge: 'bg-orange-100 text-bp-secondary',
    emoji: '🔑',
  },
]

export default function DevLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // In production builds, this page should not exist at all —
  // the route is only registered in development via next.config enforcement
  // But as an extra safeguard, the API route already returns 404 in production
  if (process.env.NODE_ENV !== 'development') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-bp-body">Not available in this environment.</p>
      </div>
    )
  }

  async function loginAs(role: DemoRole) {
    setLoading(role)
    setError(null)

    try {
      const redirectTo = await launchDemoSession(role)
      router.push(redirectTo)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#fffaf4] flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 bg-yellow-100 border border-yellow-300 text-yellow-800 text-xs font-mono px-3 py-1 rounded-full">
          ⚠️ DEV ONLY — not visible in production
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-4">Dev Login</h1>
        <p className="text-bp-body text-sm">One-click demo access for testing patient, provider, and admin flows.</p>
      </div>

      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ACCOUNTS.map((account) => (
          <button
            key={account.role}
            onClick={() => loginAs(account.role)}
            disabled={loading !== null}
            className={`flex flex-col items-start gap-3 p-5 border-2 rounded-xl transition-all text-left disabled:opacity-60 ${account.color}`}
          >
            <span className="text-3xl">{account.emoji}</span>
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-900">{account.label}</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${account.badge}`}>
                  {account.role}
                </span>
              </div>
              <p className="text-xs text-bp-body font-mono">{account.email}</p>
              <p className="text-xs text-bp-body/40 font-mono">{account.phone}</p>
            </div>
            {loading === account.role ? (
              <span className="text-xs text-bp-body animate-pulse">Redirecting…</span>
            ) : (
              <span className="text-xs font-medium text-bp-body mt-auto">
                Log in as {account.label} →
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg max-w-lg text-center">
          {error}
        </div>
      )}

      <div className="text-xs text-bp-body/40 text-center max-w-md space-y-1">
        <p>Each option launches a role-specific demo session without creating a new Supabase auth user.</p>
        <p>The same role routing is used by the preview gate on the live site.</p>
        <p className="font-mono text-bp-body/30">POST /api/auth/demo-session</p>
      </div>
    </div>
  )
}
