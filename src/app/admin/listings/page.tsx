'use client'

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, Clock, XCircle, RefreshCw, UserCheck } from 'lucide-react'
import {
  PageHeader,
  SectionCard,
  StatTile,
} from '@/components/dashboard/primitives'

type ApprovalStatus = 'pending' | 'approved' | 'rejected'

interface ProviderListing {
  id: string
  slug: string
  title: string | null
  experience_years: number | null
  iap_registration_no: string | null
  specialty_ids: string[]
  consultation_fee_inr: number | null
  verified: boolean
  active: boolean
  approval_status: ApprovalStatus
  onboarding_step: number
  created_at: string
  users: { full_name: string; phone: string | null } | null
}

type ActionState = { type: 'approving' | 'rejecting'; providerId: string } | null

const TABS: { label: string; value: ApprovalStatus; icon: typeof Clock }[] = [
  { label: 'Pending', value: 'pending', icon: Clock },
  { label: 'Approved', value: 'approved', icon: CheckCircle },
  { label: 'Rejected', value: 'rejected', icon: XCircle },
]

export default function AdminListings() {
  const [activeTab, setActiveTab] = useState<ApprovalStatus>('pending')
  const [listings, setListings] = useState<ProviderListing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionState, setActionState] = useState<ActionState>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const loadListings = useCallback(async (status: ApprovalStatus) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/listings?status=${status}`)
      if (!res.ok) throw new Error(`Failed to load listings (${res.status})`)
      const data = await res.json() as { listings: ProviderListing[] }
      setListings(data.listings ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadListings(activeTab)
  }, [activeTab, loadListings])

  function switchTab(tab: ApprovalStatus) {
    setActiveTab(tab)
    setActionError(null)
  }

  async function handleAction(providerId: string, approved: boolean) {
    setActionState({ type: approved ? 'approving' : 'rejecting', providerId })
    setActionError(null)
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_id: providerId, approved }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? `Request failed (${res.status})`)
      }
      setListings((prev) => prev.filter((p) => p.id !== providerId))
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Action failed. Please try again.')
    } finally {
      setActionState(null)
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const pendingCount = activeTab === 'pending' ? listings.length : 0

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-8">
      <PageHeader
        role="admin"
        kicker="OPERATIONS"
        title="Listing verification"
        subtitle="Review and approve physiotherapist applications"
        action={{
          label: 'Refresh',
          icon: RefreshCw,
          onClick: () => { void loadListings(activeTab) },
        }}
      />

      {/* Summary tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatTile
          role="admin"
          icon={Clock}
          label="Pending review"
          value={loading && activeTab === 'pending' ? '—' : activeTab === 'pending' ? String(listings.length) : '—'}
          tone={4}
        />
        <StatTile
          role="admin"
          icon={UserCheck}
          label="Approve to activate"
          value="Live"
          tone={2}
        />
        <StatTile
          role="admin"
          icon={CheckCircle}
          label="Rejection deactivates"
          value="Listing"
          tone={1}
        />
      </div>

      <SectionCard
        role="admin"
        title={`Provider approval queue ${pendingCount > 0 ? `(${pendingCount})` : ''}`}
      >
        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-100">
          {TABS.map(({ label, value, icon: Icon }) => (
            <button
              key={value}
              onClick={() => switchTab(value)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-colors ${
                activeTab === value
                  ? 'border-bp-primary text-bp-primary bg-bp-primary/5'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>

        {actionError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-700">
            {actionError}
          </div>
        )}

        {loading && (
          <div className="py-12 flex flex-col items-center gap-3 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <p className="text-sm">Loading {activeTab} applications…</p>
          </div>
        )}

        {!loading && error && (
          <div className="py-12 text-center">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button
              onClick={() => { void loadListings(activeTab) }}
              className="text-sm font-medium text-bp-primary hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && listings.length === 0 && (
          <div className="py-12 flex flex-col items-center gap-2 text-gray-400">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <p className="text-sm font-medium text-gray-500">No {activeTab} applications</p>
            <p className="text-xs text-gray-400">
              {activeTab === 'pending'
                ? 'All provider submissions have been reviewed'
                : `No providers in ${activeTab} state`}
            </p>
          </div>
        )}

        {!loading && !error && listings.length > 0 && (
          <div className="divide-y divide-slate-100">
            {listings.map((provider) => {
              const isActing = actionState?.providerId === provider.id
              const name = provider.users?.full_name ?? 'Unknown'
              const initials = name.split(' ').filter(Boolean).map((n) => n[0] ?? '').join('').slice(0, 2).toUpperCase() || '??'
              const regNo = provider.iap_registration_no ?? '—'
              const fee = provider.consultation_fee_inr != null ? `₹${provider.consultation_fee_inr}` : '—'
              const date = formatDate(provider.created_at)
              const isPending = provider.approval_status === 'pending'

              return (
                <div key={provider.id} className="py-4 flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl bg-bp-primary flex items-center justify-center text-white text-sm font-black shrink-0">
                    {initials}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-bp-primary">
                        {provider.title ? `${provider.title} ` : ''}{name}
                      </span>
                      {provider.experience_years != null && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500">
                          {provider.experience_years}y exp
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                        provider.approval_status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                        provider.approval_status === 'rejected' ? 'bg-red-50 text-red-600' :
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {provider.approval_status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                      <span>Reg: {regNo}</span>
                      <span>Fee: {fee}</span>
                      <span>Applied: {date}</span>
                      {provider.users?.phone && <span>Ph: {provider.users.phone}</span>}
                    </div>
                  </div>

                  {/* Actions — only shown for pending providers */}
                  {isPending && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => { void handleAction(provider.id, true) }}
                        disabled={isActing}
                        title="Approve"
                        className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isActing && actionState?.type === 'approving'
                          ? <RefreshCw className="w-5 h-5 animate-spin" />
                          : <CheckCircle className="w-5 h-5" strokeWidth={2} />
                        }
                      </button>
                      <button
                        onClick={() => { void handleAction(provider.id, false) }}
                        disabled={isActing}
                        title="Reject"
                        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isActing && actionState?.type === 'rejecting'
                          ? <RefreshCw className="w-5 h-5 animate-spin" />
                          : <XCircle className="w-5 h-5" strokeWidth={2} />
                        }
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
