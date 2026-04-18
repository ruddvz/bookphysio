'use client'

import { useUiV2 } from '@/hooks/useUiV2'
import { Badge } from '@/components/dashboard/primitives/Badge'
import { cn } from '@/lib/utils'

const SPECIALTIES: { slug: string; label: string }[] = [
  { slug: 'back-pain', label: 'Back Pain' },
  { slug: 'neck-pain', label: 'Neck Pain' },
  { slug: 'knee-pain', label: 'Knee Pain' },
  { slug: 'sports-injury', label: 'Sports Injury' },
  { slug: 'post-surgery', label: 'Post-Surgery' },
  { slug: 'neurological', label: 'Neurological' },
  { slug: 'paediatric', label: 'Paediatric' },
]

const MODES: { mode: 'clinic' | 'home_visit' | 'video'; label: string }[] = [
  { mode: 'clinic', label: 'Clinic' },
  { mode: 'home_visit', label: 'Home visit' },
  { mode: 'video', label: 'Video' },
]

const PINCODE_PATTERN = /^[1-9][0-9]{5}$/

export interface PatientSearchV2RailProps {
  selectedSpecialty?: string | null
  onSpecialtyChange?: (slug: string | null) => void
  selectedMode?: 'clinic' | 'home_visit' | 'video' | null
  onModeChange?: (mode: 'clinic' | 'home_visit' | 'video' | null) => void
  pincode?: string
  onPincodeChange?: (v: string) => void
}

export function PatientSearchV2Rail({
  selectedSpecialty,
  onSpecialtyChange,
  selectedMode,
  onModeChange,
  pincode = '',
  onPincodeChange,
}: PatientSearchV2RailProps) {
  const v2 = useUiV2()
  let activeFilters = 0
  if (selectedSpecialty) activeFilters += 1
  if (selectedMode) activeFilters += 1
  if (pincode && PINCODE_PATTERN.test(pincode)) activeFilters += 1

  if (!v2) return null

  function toggleSpecialty(slug: string) {
    const next = selectedSpecialty === slug ? null : slug
    onSpecialtyChange?.(next)
  }

  function toggleMode(mode: 'clinic' | 'home_visit' | 'video') {
    const next = selectedMode === mode ? null : mode
    onModeChange?.(next)
  }

  return (
    <div
      data-ui-version="v2"
      data-testid="patient-search-v2-rail"
      className="mb-10 space-y-6"
      aria-label="Search filters"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-pt-primary)]">
            FIND A PHYSIO
          </p>
          <h1 className="text-[28px] font-bold tracking-tight text-[var(--color-pt-ink)]">
            Search Physiotherapists
          </h1>
        </div>
        {activeFilters > 0 ? (
          <Badge
            role="patient"
            variant="soft"
            tone={2}
            data-testid="active-filter-count"
            aria-label={`${activeFilters} active filters`}
          >
            {activeFilters} filter{activeFilters === 1 ? '' : 's'}
          </Badge>
        ) : null}
      </div>

      <div
        className="flex flex-col gap-4 rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-white p-4"
        role="region"
        aria-label="Filter options"
      >
        <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-0 flex-nowrap gap-2" aria-label="Specialties">
            {SPECIALTIES.map(({ slug, label }) => {
              const active = selectedSpecialty === slug
              return (
                <button
                  key={slug}
                  type="button"
                  data-testid={`specialty-chip-${slug}`}
                  onClick={() => toggleSpecialty(slug)}
                  className="shrink-0"
                >
                  <Badge
                    role="patient"
                    variant={active ? 'solid' : 'outline'}
                    className={cn('cursor-pointer !normal-case', active && 'shadow-sm')}
                  >
                    {label}
                  </Badge>
                </button>
              )
            })}
          </div>

          <div
            className="hidden h-8 w-px shrink-0 self-center bg-[var(--color-pt-border)] sm:block"
            aria-hidden
          />

          <div className="flex min-w-0 flex-nowrap gap-2" aria-label="Visit modes">
            {MODES.map(({ mode, label }) => {
              const active = selectedMode === mode
              return (
                <button
                  key={mode}
                  type="button"
                  data-testid={`mode-chip-${mode}`}
                  onClick={() => toggleMode(mode)}
                  className="shrink-0"
                >
                  <Badge
                    role="patient"
                    variant={active ? 'solid' : 'outline'}
                    className={cn('cursor-pointer !normal-case', active && 'shadow-sm')}
                  >
                    {label}
                  </Badge>
                </button>
              )
            })}
          </div>

          <div
            className="hidden h-8 w-px shrink-0 self-center bg-[var(--color-pt-border)] sm:block"
            aria-hidden
          />

          <input
            data-testid="pincode-input"
            type="text"
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="Pincode"
            maxLength={6}
            pattern="[1-9][0-9]{5}"
            value={pincode}
            onChange={(e) => onPincodeChange?.(e.target.value.replace(/\D/g, '').slice(0, 6))}
            aria-label="Filter by 6-digit Indian pincode"
            className="h-10 min-w-[140px] shrink-0 rounded-[var(--sq-lg)] border border-[var(--color-pt-border-soft)] bg-[var(--color-pt-tile-1-bg)] px-3 text-[14px] text-[var(--color-pt-ink)] outline-none focus:border-[var(--color-pt-primary)] focus:ring-2 focus:ring-[var(--color-pt-primary)]/20"
          />
        </div>
      </div>
    </div>
  )
}
