'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { clearDemoSession, launchDemoSession } from '@/lib/demo/client'
import type { DemoRole } from '@/lib/demo/session'

const ROLES: Array<{
  role: DemoRole
  label: string
  description: string
  emoji: string
  color: string
  badge: string
}> = [
  {
    role: 'patient',
    label: 'Patient',
    description: 'Book sessions, view appointments, manage profile',
    emoji: '🧑‍⚕️',
    color: 'border-blue-200 hover:border-blue-400 bg-blue-50/50',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    role: 'provider',
    label: 'Physiotherapist',
    description: 'Manage availability, view bookings, track earnings',
    emoji: '🏥',
    color: 'border-teal-200 hover:border-teal-400 bg-teal-50/50',
    badge: 'bg-teal-100 text-teal-700',
  },
  {
    role: 'admin',
    label: 'Admin',
    description: 'Review listings, manage users, platform stats',
    emoji: '🔑',
    color: 'border-orange-200 hover:border-orange-400 bg-orange-50/50',
    badge: 'bg-orange-100 text-orange-700',
  },
]

function PasswordForm() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/auth/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      window.location.reload()
    } else {
      const data = await res.json().catch(() => ({} as { error?: string }))
      setError(data.error ?? 'Wrong password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fffaf4] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00766C] mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 3C8.477 3 4 7.477 4 13s4.477 10 10 10 10-4.477 10-10S19.523 3 14 3z" fill="white" fillOpacity="0.3"/>
              <path d="M14 7c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" fill="white"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">BookPhysio Preview</h1>
          <p className="text-gray-500 text-sm mt-1">Enter the access password to explore</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Access password"
              autoFocus
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00766C]/30 focus:border-[#00766C] bg-white"
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-[#00766C] text-white rounded-xl text-sm font-medium hover:bg-[#005A52] transition-colors disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Enter →'}
          </button>
        </form>
      </div>
    </div>
  )
}

function RolePicker() {
  const router = useRouter()
  const [loading, setLoading] = useState<DemoRole | null>(null)
  const [error, setError] = useState('')

  async function loginAs(role: DemoRole) {
    setLoading(role)
    setError('')

    try {
      const redirectTo = await launchDemoSession(role)
      router.push(redirectTo)
    } catch (launchError) {
      setError(launchError instanceof Error ? launchError.message : 'Unable to start the preview session.')
      setLoading(null)
    }
  }

  async function logout() {
    await clearDemoSession()
    await fetch('/api/auth/preview', { method: 'DELETE' })
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#fffaf4] flex flex-col items-center justify-center p-6 gap-8">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#00766C] mb-4">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M14 3C8.477 3 4 7.477 4 13s4.477 10 10 10 10-4.477 10-10S19.523 3 14 3z" fill="white" fillOpacity="0.3"/>
            <path d="M14 7c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6z" fill="white"/>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">BookPhysio Preview</h1>
        <p className="text-gray-500 text-sm mt-1">Choose a role to explore</p>
      </div>

      <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ROLES.map((account) => (
          <button
            key={account.role}
            onClick={() => loginAs(account.role)}
            disabled={loading !== null}
            className={`flex flex-col items-start gap-3 p-5 border-2 rounded-2xl transition-all text-left disabled:opacity-60 ${account.color}`}
          >
            <span className="text-3xl">{account.emoji}</span>
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-900">{account.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${account.badge}`}>
                  {account.role}
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{account.description}</p>
            </div>
            {loading === account.role ? (
              <span className="text-xs text-gray-400 animate-pulse">Signing in…</span>
            ) : (
              <span className="text-xs font-medium text-[#00766C] mt-auto">Explore as {account.label} →</span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center">{error}</p>
      )}

      <p className="text-xs text-gray-400 text-center max-w-sm">
        This preview opens a role-specific guided session so you can explore the product without creating a live auth account.
      </p>

      <button
        onClick={logout}
        className="text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
      >
        Sign out of preview
      </button>
    </div>
  )
}

export default function PreviewGate({ unlocked }: { unlocked: boolean }) {
  return unlocked ? <RolePicker /> : <PasswordForm />
}
