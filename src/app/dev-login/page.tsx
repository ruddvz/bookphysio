'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

// Dev-only login page — only renders in development
// Gives one-click access to patient / provider / admin test accounts
// Calls /api/auth/dev-signup?role=X which creates stable test users + magic link auth

const ACCOUNTS = [
  {
    role: 'patient',
    label: 'Patient',
    email: 'dev-patient@bookphysio.in',
    phone: '+91 90000 00001',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    badge: 'bg-blue-100 text-blue-700',
    emoji: '🧑‍⚕️',
  },
  {
    role: 'provider',
    label: 'Physiotherapist',
    email: 'dev-provider@bookphysio.in',
    phone: '+91 90000 00002',
    color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
    badge: 'bg-teal-100 text-teal-700',
    emoji: '🏥',
  },
  {
    role: 'admin',
    label: 'Admin',
    email: 'dev-admin@bookphysio.in',
    phone: '+91 90000 00003',
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    badge: 'bg-orange-100 text-orange-700',
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
        <p className="text-gray-500">Not available in this environment.</p>
      </div>
    )
  }

  async function loginAs(role: string) {
    setLoading(role)
    setError(null)
    try {
      // The API route redirects through Supabase magic link → /auth/callback → dashboard
      // window.location.href handles the redirect chain correctly
      window.location.href = `/api/auth/dev-signup?role=${role}`
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
        <p className="text-gray-500 text-sm">One-click login for testing. Stable accounts, same user every run.</p>
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
              <p className="text-xs text-gray-500 font-mono">{account.email}</p>
              <p className="text-xs text-gray-400 font-mono">{account.phone}</p>
            </div>
            {loading === account.role ? (
              <span className="text-xs text-gray-500 animate-pulse">Redirecting…</span>
            ) : (
              <span className="text-xs font-medium text-gray-600 mt-auto">
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

      <div className="text-xs text-gray-400 text-center max-w-md space-y-1">
        <p>First login per account creates the user in Supabase and sets the correct role.</p>
        <p>Subsequent logins reuse the same stable user (email: dev-[role]@bookphysio.in).</p>
        <p className="font-mono text-gray-300">GET /api/auth/dev-signup?role=[patient|provider|admin]</p>
      </div>
    </div>
  )
}
