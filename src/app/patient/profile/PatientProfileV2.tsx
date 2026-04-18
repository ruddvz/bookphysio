'use client'

/**
 * v2 overlay for the patient profile page.
 * Self-gates via useUiV2() — returns null when v2 is off.
 *
 * v2 additions:
 *   - Avatar with large initials circle + "Patient" role Badge
 *   - Pill fields for read-only contact info (phone + Verified Badge / email)
 *   - Consent toggles (marketing email, appointment SMS reminders)
 *   - Security card with lock icon + "Secure account" Badge
 *   - Improved layout with max-width 900px (single focused column + sidebar)
 */

import { useState } from 'react'
import Image from 'next/image'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  User,
  Smartphone,
  Mail,
  Check,
  Loader2,
  AlertCircle,
  Shield,
  Lock,
  Bell,
  AtSign,
  type LucideIcon,
} from 'lucide-react'
import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { cn } from '@/lib/utils'

interface ProfileData {
  id: string
  full_name: string
  phone: string | null
  email: string | null
  role: string
  avatar_url: string | null
}

function profileInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

interface ReadOnlyPillProps {
  label: string
  value: string
  icon: LucideIcon
  badge?: React.ReactNode
}

function ReadOnlyPill({ label, value, icon: Icon, badge }: ReadOnlyPillProps) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
        {label}
      </span>
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-100 border border-slate-200 rounded-[var(--sq-sm)]">
        <Icon className="w-4 h-4 text-slate-400 shrink-0" aria-hidden="true" />
        <span className="flex-1 text-[13px] text-slate-500">{value}</span>
        {badge}
      </div>
    </div>
  )
}

interface ConsentToggleProps {
  id: string
  label: string
  description: string
  checked: boolean
  onChange: (checked: boolean) => void
}

function ConsentToggle({ id, label, description, checked, onChange }: ConsentToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="flex-1">
        <label htmlFor={id} className="text-[13px] font-semibold text-slate-800 cursor-pointer">
          {label}
        </label>
        <p className="text-[12px] text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        data-testid={`v2-consent-toggle-${id}`}
        className={cn(
          'relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 mt-0.5',
          checked ? 'bg-[var(--color-pt-primary)]' : 'bg-slate-200'
        )}
        aria-label={label}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}

export function PatientProfileV2() {
  const isV2 = useUiV2()
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [initialised, setInitialised] = useState(false)
  const [marketingEmail, setMarketingEmail] = useState(true)
  const [appointmentSms, setAppointmentSms] = useState(true)

  const { data: profile, isLoading, isError, refetch } = useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to load')
      return res.json()
    },
    select: (data) => {
      if (!initialised) {
        setName(data.full_name)
        setInitialised(true)
      }
      return data
    },
  })

  const saveMut = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: name }),
      })
      if (!res.ok) throw new Error('Save failed')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  if (!isV2) return null

  if (isLoading) {
    return (
      <div
        className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[300px]"
        data-ui-version="v2"
      >
        <Loader2 className="w-7 h-7 animate-spin text-[var(--color-pt-primary)]" aria-hidden="true" />
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div
        className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12"
        data-ui-version="v2"
      >
        <button
          className="text-[13px] text-rose-600 hover:underline flex items-center gap-1.5"
          onClick={() => void refetch()}
        >
          <AlertCircle size={16} aria-hidden="true" />
          Couldn&apos;t load profile — retry
        </button>
      </div>
    )
  }

  const initials = profileInitials(profile.full_name)
  const isDirty = name.trim() !== profile.full_name

  return (
    <div
      className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8"
      data-ui-version="v2"
      data-testid="v2-profile-root"
    >
      {/* Page header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-pt-primary)] mb-1">
          SETTINGS
        </p>
        <h1 className="text-[22px] font-bold text-slate-900 leading-none">Account Profile</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left: identity + form */}
        <div className="lg:col-span-2 space-y-6">

          {/* Identity card */}
          <div
            className="bg-white border border-[var(--color-pt-border)] rounded-[var(--sq-lg)] p-6"
            data-testid="v2-identity-card"
          >
            {/* Avatar row */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-[var(--sq-lg)] bg-[var(--color-pt-tile-2-bg)] text-[var(--color-pt-tile-2-fg)] text-[20px] font-bold flex items-center justify-center overflow-hidden ring-4 ring-white shadow-sm"
                  aria-label={`Avatar for ${profile.full_name}`}
                  data-testid="v2-avatar"
                >
                  {profile.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      width={80}
                      height={80}
                      alt={profile.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-slate-900 mb-1.5">{profile.full_name}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge role="patient" variant="soft" tone={1} data-testid="v2-role-badge">
                    Patient
                  </Badge>
                  {profile.phone && (
                    <Badge role="patient" variant="success" data-testid="v2-phone-verified-badge">
                      Phone Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Editable name */}
            <form
              onSubmit={e => {
                e.preventDefault()
                if (isDirty) saveMut.mutate()
              }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="v2-full-name"
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    id="v2-full-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    aria-label="Full name"
                    data-testid="v2-name-input"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[var(--color-pt-primary)] transition-all outline-none"
                  />
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-pt-primary)]"
                    aria-hidden="true"
                  />
                </div>
              </div>

              {/* Read-only contact pills */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReadOnlyPill
                  label="Mobile Number"
                  value={profile.phone ?? '—'}
                  icon={Smartphone}
                  badge={
                    profile.phone ? (
                      <Badge role="patient" variant="success" data-testid="v2-phone-pill-badge">
                        Verified
                      </Badge>
                    ) : undefined
                  }
                />
                <ReadOnlyPill
                  label="Email Address"
                  value={profile.email ?? '—'}
                  icon={Mail}
                />
              </div>

              {/* Save footer */}
              <div className="flex items-center justify-between pt-2">
                <div className="h-5">
                  {saveMut.isSuccess && (
                    <p
                      className="text-[12px] text-emerald-600 font-bold flex items-center gap-1.5"
                      data-testid="v2-save-success"
                    >
                      <Check size={13} aria-hidden="true" /> Changes saved
                    </p>
                  )}
                  {saveMut.isError && (
                    <p
                      className="text-[12px] text-rose-600 font-bold flex items-center gap-1.5"
                      data-testid="v2-save-error"
                    >
                      <AlertCircle size={13} aria-hidden="true" /> Failed to save
                    </p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saveMut.isPending || !isDirty}
                  aria-label="Save profile changes"
                  data-testid="v2-save-btn"
                  className="px-7 py-2.5 bg-[var(--color-pt-primary)] text-white text-[13px] font-bold rounded-full hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  {saveMut.isPending && (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Consent & Preferences */}
          <div
            className="bg-white border border-[var(--color-pt-border)] rounded-[var(--sq-lg)] p-6"
            data-testid="v2-consent-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-[var(--sq-xs)] bg-[var(--color-pt-tile-1-bg)] flex items-center justify-center"
                aria-hidden="true"
              >
                <Bell className="w-4 h-4 text-[var(--color-pt-primary)]" />
              </div>
              <h3 className="text-[14px] font-bold text-slate-900">Notifications & Consent</h3>
            </div>
            <div className="divide-y divide-[var(--color-pt-border-soft)]">
              <ConsentToggle
                id="marketing-email"
                label="Health tips & updates"
                description="Receive email newsletters with physiotherapy tips and platform updates."
                checked={marketingEmail}
                onChange={setMarketingEmail}
              />
              <ConsentToggle
                id="appointment-sms"
                label="Appointment SMS reminders"
                description="Get SMS reminders 24h before your upcoming appointments."
                checked={appointmentSms}
                onChange={setAppointmentSms}
              />
            </div>
          </div>
        </div>

        {/* Right: Security + Trust */}
        <div className="space-y-6">
          {/* Security card */}
          <div
            className="bg-white border border-[var(--color-pt-border)] rounded-[var(--sq-lg)] p-5"
            data-testid="v2-security-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-8 h-8 rounded-[var(--sq-xs)] bg-[var(--color-pt-tile-1-bg)] flex items-center justify-center"
                aria-hidden="true"
              >
                <Lock className="w-4 h-4 text-[var(--color-pt-primary)]" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-900">Security</h3>
                <Badge role="patient" variant="success" data-testid="v2-secure-badge">
                  Secure account
                </Badge>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-t border-[var(--color-pt-border-soft)]">
                <span className="text-[12px] text-slate-600">Password</span>
                <button
                  disabled
                  aria-label="Change password (coming soon)"
                  className="text-[11px] font-bold text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full cursor-not-allowed"
                >
                  Change
                </button>
              </div>
              <div className="flex items-center justify-between py-2 border-t border-[var(--color-pt-border-soft)]">
                <span className="text-[12px] text-slate-600">Two-factor auth</span>
                <Badge role="patient" variant="warning" data-testid="v2-2fa-badge">
                  Coming soon
                </Badge>
              </div>
            </div>
          </div>

          {/* Trust & Privacy card */}
          <div
            className="bg-white border border-[var(--color-pt-border)] rounded-[var(--sq-lg)] p-5"
            data-testid="v2-trust-card"
          >
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <h3 className="text-[14px] font-bold text-slate-900">Privacy</h3>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed mb-4">
              Your data is protected by industry-standard encryption and will never be shared without your consent.
            </p>
            <div className="flex items-center gap-2 p-3 bg-[var(--color-pt-tile-1-bg)] rounded-[var(--sq-sm)]">
              <AtSign className="w-3.5 h-3.5 text-[var(--color-pt-primary)] shrink-0" aria-hidden="true" />
              <span className="text-[11px] text-[var(--color-pt-primary)] font-semibold">
                support@bookphysio.in
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
