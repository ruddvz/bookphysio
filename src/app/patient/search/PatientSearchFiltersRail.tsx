'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  X,
  ChevronDown,
  Check,
  MapPin,
  Activity,
  Home,
  Building2,
  SlidersHorizontal,
  CalendarClock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPECIALTIES as SPECIALTY_DEFS } from '@/lib/specialties'

const SPECIALTIES = SPECIALTY_DEFS.map((s) => s.label)

const VISIT_TYPES = ['In-clinic', 'Home Visit'] as const
const VISIT_TYPE_URL: Record<string, string> = {
  'In-clinic': 'in_clinic',
  'Home Visit': 'home_visit',
}
const VISIT_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(VISIT_TYPE_URL).map(([k, v]) => [v, k])
)

type VisitSegment = 'Any' | (typeof VISIT_TYPES)[number]

const VISIT_TYPE_ICONS: Record<string, typeof Home> = {
  Any: SlidersHorizontal,
  'In-clinic': Building2,
  'Home Visit': Home,
}

const AVAILABILITY_OPTIONS = [
  { label: 'Any', value: '' as const },
  { label: 'Soonest slot', value: 'availability' as const },
]

const PINCODE_REGEX = /^[1-9][0-9]{5}$/

function FilterPill({
  label,
  value,
  options,
  onChange,
  icon: Icon,
}: {
  label: string
  value: string
  options: string[]
  onChange: (val: string) => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={cn(
          'flex h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold whitespace-nowrap transition-all duration-200',
          value
            ? 'border-[var(--color-pt-primary)] bg-[var(--color-pt-primary)] text-white shadow-sm'
            : 'border-[var(--color-pt-border)] bg-white text-[var(--color-pt-ink)] hover:border-[var(--color-pt-primary)]/35 hover:bg-[var(--color-pt-surface)]'
        )}
      >
        {Icon && (
          <Icon size={15} className={value ? 'text-white/80' : 'text-[var(--color-pt-primary)]'} />
        )}
        <span>{value || label}</span>
        <ChevronDown
          size={13}
          className={cn('transition-transform duration-200', open && 'rotate-180', value ? 'text-white/60' : 'text-slate-400')}
        />
      </button>

      {open && (
        <>
          <button type="button" className="fixed inset-0 z-40 cursor-default bg-transparent" aria-hidden onClick={() => setOpen(false)} />
          <div
            role="listbox"
            aria-label={label}
            className="absolute top-full left-0 z-50 mt-2 max-h-56 w-56 overflow-y-auto rounded-[var(--sq-sm)] border border-[var(--color-pt-border)] bg-white py-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
          >
            <button
              role="option"
              aria-selected={!value}
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] font-medium transition-colors',
                !value ? 'bg-[var(--color-pt-surface)] text-[var(--color-pt-primary)]' : 'text-[var(--color-pt-ink)] hover:bg-slate-50'
              )}
            >
              All specialties
              {!value && <Check className="h-3.5 w-3.5 text-[var(--color-pt-primary)]" />}
            </button>
            <div className="my-1 border-t border-slate-100" />
            {options.map((opt) => (
              <button
                key={opt}
                role="option"
                aria-selected={value === opt}
                type="button"
                onClick={() => {
                  onChange(opt)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between px-4 py-2.5 text-left text-[13px] font-medium transition-colors',
                  value === opt ? 'bg-[var(--color-pt-surface)] text-[var(--color-pt-primary)]' : 'text-[var(--color-pt-ink)] hover:bg-slate-50'
                )}
              >
                {opt}
                {value === opt && <Check className="h-3.5 w-3.5 text-[var(--color-pt-primary)]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export interface PatientSearchFiltersRailProps {
  basePath?: string
  total?: number
}

/**
 * v2 filter rail for in-dashboard patient search — specialty, pincode, visit mode,
 * and availability (sort) chips aligned with public `/search` filter semantics.
 */
export function PatientSearchFiltersRail({ basePath = '/patient/search', total = 0 }: PatientSearchFiltersRailProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSpecialty = searchParams.get('specialty') ?? ''
  const rawPincode = searchParams.get('pincode') ?? ''
  const currentVisitRaw = searchParams.get('visit_type') ?? ''
  const currentVisit: VisitSegment = (VISIT_TYPE_LABEL[currentVisitRaw] as VisitSegment) ?? 'Any'
  const currentSort = searchParams.get('sort') ?? ''

  const [pinDraft, setPinDraft] = useState(rawPincode)
  const [pinError, setPinError] = useState(false)

  useEffect(() => {
    setPinDraft(rawPincode)
  }, [rawPincode])

  const pushParams = useCallback(
    (updates: Record<string, string | null>, options?: { replace?: boolean }) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      }
      const nextUrl = `${basePath}?${next.toString()}`
      if (options?.replace) {
        router.replace(nextUrl)
        return
      }
      router.push(nextUrl)
    },
    [basePath, router, searchParams]
  )

  const commitPincode = () => {
    const trimmed = pinDraft.trim()
    if (trimmed === '') {
      setPinError(false)
      pushParams({ pincode: null })
      return
    }
    if (!PINCODE_REGEX.test(trimmed)) {
      setPinError(true)
      return
    }
    setPinError(false)
    pushParams({ pincode: trimmed })
  }

  const hasActive =
    currentSpecialty !== '' ||
    rawPincode !== '' ||
    currentVisit !== 'Any' ||
    (currentSort !== '' && currentSort !== 'relevance')

  const clearAll = () => {
    setPinDraft('')
    setPinError(false)
    const next = new URLSearchParams(searchParams.toString())
    next.delete('specialty')
    next.delete('pincode')
    next.delete('visit_type')
    next.delete('sort')
    router.push(`${basePath}?${next.toString()}`)
  }

  return (
    <div className="w-full space-y-3" data-testid="patient-search-filters-rail-v2">
      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-end">
        <FilterPill
          label="Specialty"
          value={currentSpecialty}
          options={SPECIALTIES}
          icon={Activity}
          onChange={(val) => pushParams({ specialty: val || null })}
        />

        <div className="flex min-w-[200px] flex-col gap-1">
          <label htmlFor="patient-search-pincode" className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Pincode
          </label>
          <div
            className={cn(
              'flex h-10 items-center gap-2 rounded-full border bg-white px-3 transition-colors',
              pinError ? 'border-rose-400' : 'border-[var(--color-pt-border)] focus-within:border-[var(--color-pt-primary)]/40'
            )}
          >
            <MapPin size={16} className="shrink-0 text-[var(--color-pt-primary)]" aria-hidden />
            <input
              id="patient-search-pincode"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={6}
              placeholder="560001"
              value={pinDraft}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                setPinDraft(v)
                setPinError(false)
              }}
              onBlur={() => commitPincode()}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  commitPincode()
                }
              }}
              className="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[var(--color-pt-ink)] outline-none placeholder:text-slate-400"
            />
          </div>
          {pinError ? <p className="text-[11px] font-medium text-rose-600">Enter a valid 6-digit pincode</p> : null}
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Visit mode</span>
          <div className="flex items-center rounded-full border border-[var(--color-pt-border)] bg-[var(--color-pt-surface)]/80 p-0.5">
            {(['Any', ...VISIT_TYPES] as const).map((type) => {
              const IconComp = VISIT_TYPE_ICONS[type] ?? SlidersHorizontal
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => pushParams({ visit_type: type === 'Any' ? null : VISIT_TYPE_URL[type] })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition-all',
                    currentVisit === type
                      ? 'bg-white text-[var(--color-pt-primary)] shadow-sm'
                      : 'text-slate-600 hover:text-[var(--color-pt-ink)]'
                  )}
                >
                  <IconComp size={13} />
                  {type}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Availability</span>
          <div className="flex flex-wrap items-center gap-2">
            {AVAILABILITY_OPTIONS.map((opt) => {
              const active =
                opt.value === ''
                  ? currentSort === '' || currentSort === 'relevance'
                  : currentSort === opt.value
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    if (opt.value === '') {
                      pushParams({ sort: null })
                    } else {
                      pushParams({ sort: opt.value })
                    }
                  }}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all',
                    active
                      ? 'border-[var(--color-pt-primary)] bg-[var(--color-pt-primary)] text-white shadow-sm'
                      : 'border-[var(--color-pt-border)] bg-white text-[var(--color-pt-ink)] hover:border-[var(--color-pt-primary)]/30'
                  )}
                >
                  <CalendarClock size={14} className={active ? 'text-white/90' : 'text-[var(--color-pt-primary)]'} />
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        {hasActive && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full border border-transparent px-3 text-[12px] font-semibold text-slate-500 transition-colors hover:border-[#FF6B35]/20 hover:bg-[#FFF7F1] hover:text-[#FF6B35] lg:ml-0"
          >
            <X size={13} />
            Clear filters
          </button>
        )}
      </div>

      <p className="text-[12px] font-medium text-slate-500">
        {total} result{total === 1 ? '' : 's'}
        {rawPincode ? ` · Pin ${rawPincode}` : ''}
      </p>
    </div>
  )
}
