'use client'

import { useCallback, useRef, useState, type ChangeEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Camera, User, ShieldCheck, Check, Loader2, AlertCircle } from 'lucide-react'
import { useUiV2 } from '@/hooks/useUiV2'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { getProviderDisplayName, getProviderInitials } from '@/lib/providers/display-name'
import { resizeImage } from '@/lib/providers/resize-image'
import { cn } from '@/lib/utils'

type ProviderTitle = 'Dr.' | 'PT' | 'BPT' | 'MPT'

interface ProfilePayload {
  full_name: string
  bio: string | null
  consultation_fee_inr: number | null
  experience_years: number | null
  avatar_url: string | null
  title: ProviderTitle | null
  iap_registration_no: string | null
}

interface FormState {
  full_name: string
  bio: string
  consultation_fee_inr: string
  experience_years: string
}

function toForm(p: ProfilePayload): FormState {
  return {
    full_name: p.full_name ?? '',
    bio: p.bio ?? '',
    consultation_fee_inr:
      p.consultation_fee_inr !== null && p.consultation_fee_inr !== undefined
        ? String(p.consultation_fee_inr)
        : '',
    experience_years:
      p.experience_years !== null && p.experience_years !== undefined
        ? String(p.experience_years)
        : '',
  }
}

function mergeForm(profile: ProfilePayload, overrides: Partial<FormState>): FormState {
  return { ...toForm(profile), ...overrides }
}

function parseOptionalInteger(value: string): number | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const parsed = Number(trimmed)
  if (!Number.isFinite(parsed)) return undefined
  return parsed
}

export function ProviderProfileV2() {
  const isV2 = useUiV2()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [overrides, setOverrides] = useState<Partial<FormState>>({})
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [avatarError, setAvatarError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data: profile, isLoading, isError, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await fetch('/api/profile')
      if (!res.ok) throw new Error('Failed to load')
      return res.json() as Promise<ProfilePayload & { full_name: string }>
    },
  })

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!profile) throw new Error('No profile')
      const form = mergeForm(profile, overrides)
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          bio: form.bio.trim(),
          consultation_fee_inr: parseOptionalInteger(form.consultation_fee_inr),
          experience_years: parseOptionalInteger(form.experience_years),
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      return res.json()
    },
    onSuccess: async () => {
      setOverrides({})
      await queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })

  const handleAvatarFile = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError(null)
    setAvatarUploading(true)
    try {
      const blob = await resizeImage(file)
      const resizedFile = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
      setAvatarPreview(URL.createObjectURL(blob))
      const form = new FormData()
      form.append('file', resizedFile)
      const res = await fetch('/api/auth/avatar', { method: 'POST', body: form })
      if (!res.ok) throw new Error('Upload failed')
      const { avatar_url } = await res.json() as { avatar_url: string }
      queryClient.setQueryData(['profile'], (old: ProfilePayload | undefined) =>
        old ? { ...old, avatar_url } : old
      )
    } catch {
      setAvatarError('Upload failed — please try again')
      setAvatarPreview(null)
    } finally {
      setAvatarUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [queryClient])

  if (!isV2) return null

  if (isLoading || !profile) {
    return (
      <div
        className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center min-h-[300px]"
        data-ui-version="v2"
      >
        <Loader2 className="w-7 h-7 animate-spin text-[var(--color-pv-primary)]" aria-hidden="true" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-12" data-ui-version="v2">
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

  const form = mergeForm(profile, overrides)
  const displayName = form.full_name.trim()
    ? getProviderDisplayName({ full_name: form.full_name, title: profile.title })
    : 'New Provider'
  const initials = getProviderInitials(displayName)
  const baseline = toForm(profile)
  const isDirty = JSON.stringify(form) !== JSON.stringify(baseline)
  const hasCredential = Boolean(profile.iap_registration_no?.trim())

  return (
    <div
      className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8"
      data-ui-version="v2"
      data-testid="v2-profile-root"
    >
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-[var(--color-pv-primary)] mb-1">
          PRACTICE CONFIG
        </p>
        <h1 className="text-[22px] font-bold text-slate-900 leading-none">Practice Profile</h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Manage your clinical identity and public visibility
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div
            className="bg-white border border-[var(--color-pv-border)] rounded-[var(--sq-lg)] p-6"
            data-testid="v2-identity-card"
          >
            <div className="flex items-center gap-5 mb-6">
              <div className="relative group/avatar">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  aria-label="Change profile photo"
                  data-testid="v2-avatar"
                  className="w-20 h-20 rounded-[var(--sq-lg)] bg-[var(--color-pv-tile-2-bg)] text-[var(--color-pv-tile-2-fg)] text-[20px] font-bold flex items-center justify-center overflow-hidden ring-4 ring-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-pv-primary)]"
                >
                  {avatarUploading ? (
                    <Loader2 className="w-6 h-6 animate-spin" aria-hidden="true" />
                  ) : (avatarPreview ?? profile.avatar_url) ? (
                    <Image
                      src={avatarPreview ?? profile.avatar_url!}
                      width={80}
                      height={80}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  aria-label="Change profile photo"
                  className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--color-pv-primary)] text-white rounded-full flex items-center justify-center shadow-md opacity-0 group-hover/avatar:opacity-100 transition-opacity"
                >
                  <Camera size={12} aria-hidden="true" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  aria-label="Upload profile photo"
                  onChange={handleAvatarFile}
                />
              </div>
              <div>
                {avatarError && (
                  <p className="text-[11px] font-bold text-rose-500 mb-1">{avatarError}</p>
                )}
                <h2 className="text-[17px] font-bold text-slate-900 mb-1.5">{displayName}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge role="provider" variant="soft" tone={1} data-testid="v2-role-badge">
                    Physiotherapist
                  </Badge>
                </div>
              </div>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault()
                if (isDirty) saveMut.mutate()
              }}
              className="space-y-5"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="v2-provider-full-name"
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block"
                >
                  Full Name
                </label>
                <div className="relative group">
                  <input
                    id="v2-provider-full-name"
                    type="text"
                    value={form.full_name}
                    onChange={e =>
                      setOverrides(o => ({ ...o, full_name: e.target.value }))
                    }
                    aria-label="Full name"
                    data-testid="v2-name-input"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)] transition-all outline-none"
                  />
                  <User
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[var(--color-pv-primary)]"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="v2-consultation-fee"
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block"
                  >
                    Consultation Fee (₹)
                  </label>
                  <input
                    id="v2-consultation-fee"
                    type="number"
                    value={form.consultation_fee_inr}
                    onChange={e =>
                      setOverrides(o => ({ ...o, consultation_fee_inr: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)] outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="v2-experience-years"
                    className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block"
                  >
                    Years of Practice
                  </label>
                  <input
                    id="v2-experience-years"
                    type="number"
                    value={form.experience_years}
                    onChange={e =>
                      setOverrides(o => ({ ...o, experience_years: e.target.value }))
                    }
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)] outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  NCAHP / IAP registration
                </span>
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 bg-slate-100 border border-slate-200 rounded-[var(--sq-sm)]'
                  )}
                  data-testid="v2-credential-pill"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-[13px] text-slate-600 truncate">
                    {profile.iap_registration_no?.trim() || 'Not on file'}
                  </span>
                  {hasCredential ? (
                    <Badge role="provider" variant="success" data-testid="v2-credential-verified">
                      Verified
                    </Badge>
                  ) : (
                    <Badge role="provider" variant="warning" data-testid="v2-credential-pending">
                      Pending
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="v2-provider-bio"
                  className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block"
                >
                  Provider Biography
                </label>
                <textarea
                  id="v2-provider-bio"
                  rows={5}
                  value={form.bio}
                  onChange={e => setOverrides(o => ({ ...o, bio: e.target.value }))}
                  className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-[var(--sq-lg)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-[var(--color-pv-primary)] outline-none resize-none leading-relaxed"
                />
              </div>

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
                  className="px-7 py-2.5 bg-[var(--color-pv-primary)] text-white text-[13px] font-bold rounded-full hover:opacity-90 disabled:opacity-40 transition-all flex items-center gap-2"
                >
                  {saveMut.isPending && (
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-[var(--color-pv-border)] rounded-[var(--sq-lg)] p-5">
            <h3 className="text-[14px] font-bold text-slate-900 mb-4">Public presence</h3>
            <p className="text-[12px] text-slate-500 mb-4">
              Preview how patients discover your practice on the public doctor profile.
            </p>
            {user?.id ? (
              <Link
                href={`/doctor/${user.id}`}
                className="flex items-center justify-center w-full py-3 bg-slate-50 border border-[var(--color-pv-border)] rounded-[var(--sq-sm)] text-[13px] font-bold text-[var(--color-pv-ink)] hover:bg-slate-100 transition-colors"
                data-testid="v2-view-public-profile"
              >
                View Public Profile
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
