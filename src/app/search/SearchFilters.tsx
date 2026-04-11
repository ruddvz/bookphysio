'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, ChevronDown, Check, MapPin, Activity, Wallet, Home, Building2, SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SPECIALTIES = [
  'Sports Physio', 'Neuro Physio', 'Ortho Physio', 'Paediatric Physio',
  "Women's Health", 'Geriatric Physio', 'Post-Surgery Rehab', 'Pain Management',
]

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad',
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Surat',
]

const VISIT_TYPES = ['In-clinic', 'Home Visit']
const VISIT_TYPE_URL: Record<string, string> = {
  'In-clinic': 'in_clinic',
  'Home Visit': 'home_visit',
}
const VISIT_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(VISIT_TYPE_URL).map(([k, v]) => [v, k])
)

type VisitType = 'Any' | 'In-clinic' | 'Home Visit'

const DEFAULT_MAX_FEE = 2000
const DEFAULT_CITY = ''

const VISIT_TYPE_ICONS: Record<string, typeof Home> = {
  'Any': SlidersHorizontal,
  'In-clinic': Building2,
  'Home Visit': Home,
}

// ---------------------------------------------------------------------------
// FilterPill — compact filter chip for desktop
// ---------------------------------------------------------------------------

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
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = !!value

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 h-10 px-4 rounded-full text-[13px] font-semibold transition-all duration-200 whitespace-nowrap border",
          isActive
            ? "bg-[#00766C] text-white border-[#00766C] shadow-sm"
            : "bg-white text-[#333333] border-[#E5E7EB] hover:border-[#00766C]/40 hover:bg-[#E6F4F3]/50"
        )}
      >
        {Icon && <Icon size={15} className={isActive ? "text-white/80" : "text-[#666666]"} />}
        <span>{value || label}</span>
        <ChevronDown size={13} className={cn("transition-transform duration-200", isOpen && "rotate-180", isActive ? "text-white/60" : "text-[#999]")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-xl shadow-lg shadow-black/8 z-50 py-1.5 animate-in fade-in slide-in-from-top-1 duration-150 overflow-hidden">
          <button
            onClick={() => { onChange(''); setIsOpen(false) }}
            className={cn(
              "w-full px-4 py-2.5 text-left text-[13px] font-medium transition-colors flex items-center justify-between",
              !value ? "text-[#00766C] bg-[#E6F4F3]/50" : "text-[#333] hover:bg-[#F5F5F5]"
            )}
          >
            All {label}s
            {!value && <Check className="w-3.5 h-3.5 text-[#00766C]" />}
          </button>
          <div className="border-t border-[#F3F4F6] my-1" />
          <div className="max-h-56 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false) }}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-[13px] font-medium transition-colors flex items-center justify-between",
                  value === opt ? "text-[#00766C] bg-[#E6F4F3]/50" : "text-[#333] hover:bg-[#F5F5F5]"
                )}
              >
                {opt}
                {value === opt && <Check className="w-3.5 h-3.5 text-[#00766C]" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function SearchFilters({ total = 0, basePath = '/search' }: { total?: number; basePath?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCity = searchParams.get('city') ?? DEFAULT_CITY
  const currentVisitTypeRaw = searchParams.get('visit_type') ?? ''
  const currentVisitType: VisitType = (VISIT_TYPE_LABEL[currentVisitTypeRaw] as VisitType) ?? 'Any'
  const currentMaxFee = Number(searchParams.get('max_fee') ?? DEFAULT_MAX_FEE)
  const currentSpecialty = searchParams.get('specialty') ?? ''

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [localMaxFee, setLocalMaxFee] = useState(currentMaxFee)

  useEffect(() => {
    setLocalMaxFee(currentMaxFee)
  }, [currentMaxFee])

  const hasActiveFilters =
    currentCity !== DEFAULT_CITY ||
    currentVisitType !== 'Any' ||
    currentMaxFee !== DEFAULT_MAX_FEE ||
    currentSpecialty !== ''

  const activeCount = [
    currentCity !== DEFAULT_CITY,
    currentVisitType !== 'Any',
    currentMaxFee !== DEFAULT_MAX_FEE,
    currentSpecialty !== '',
  ].filter(Boolean).length

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

  const clearAll = () => {
    setLocalMaxFee(DEFAULT_MAX_FEE)
    const next = new URLSearchParams(searchParams.toString())
    next.delete('city')
    next.delete('visit_type')
    next.delete('max_fee')
    next.delete('specialty')
    router.push(`${basePath}?${next.toString()}`)
    setDrawerOpen(false)
  }

  return (
    <div className="w-full">
      {/* ── Desktop Horizontal Bar ── */}
      <div className="hidden md:flex items-center gap-2.5 flex-wrap">
        <FilterPill
          label="Location"
          value={currentCity}
          options={CITIES}
          icon={MapPin}
          onChange={(val) => pushParams({ city: val })}
        />

        <FilterPill
          label="Specialty"
          value={currentSpecialty}
          options={SPECIALTIES}
          icon={Activity}
          onChange={(val) => pushParams({ specialty: val })}
        />

        {/* Visit Type Pills */}
        <div className="flex items-center bg-[#F5F5F5] rounded-full p-0.5 border border-[#E5E7EB]">
          {['Any', ...VISIT_TYPES].map((type) => {
            const IconComp = VISIT_TYPE_ICONS[type] ?? SlidersHorizontal
            return (
              <button
                key={type}
                onClick={() => pushParams({ visit_type: type === 'Any' ? null : VISIT_TYPE_URL[type] })}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-semibold transition-all duration-200",
                  currentVisitType === type
                    ? "bg-white text-[#00766C] shadow-sm"
                    : "text-[#666] hover:text-[#333]"
                )}
              >
                <IconComp size={13} />
                {type}
              </button>
            )
          })}
        </div>

        {/* Fee Range */}
        <div className="flex items-center gap-3 h-10 px-4 rounded-full border border-[#E5E7EB] bg-white">
          <Wallet size={14} className="text-[#666] shrink-0" />
          <span id="desktop-fee-label" className="text-[12px] text-[#999] font-medium shrink-0">Max</span>
          <span className="text-[13px] font-bold text-[#00766C] shrink-0">₹{localMaxFee}</span>
          <input
            type="range"
            min={0}
            max={2000}
            step={100}
            aria-labelledby="desktop-fee-label"
            value={localMaxFee}
            onChange={(e) => setLocalMaxFee(Number(e.target.value))}
            onPointerUp={() => pushParams({ max_fee: localMaxFee === DEFAULT_MAX_FEE ? null : String(localMaxFee) }, { replace: true })}
            onKeyUp={() => pushParams({ max_fee: localMaxFee === DEFAULT_MAX_FEE ? null : String(localMaxFee) }, { replace: true })}
            className="w-20 accent-[#00766C] cursor-pointer"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 h-10 px-3.5 rounded-full text-[12px] font-semibold text-[#999] hover:text-[#FF6B35] hover:bg-[#FFF7F1] border border-transparent hover:border-[#FF6B35]/20 transition-all ml-auto"
          >
            <X size={13} />
            Clear all
          </button>
        )}
      </div>

      {/* ── Mobile Filter Button ── */}
      <div className="md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center justify-between w-full h-12 px-4 rounded-xl border border-[#E5E7EB] bg-white text-[14px] font-semibold text-[#333] active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={16} className="text-[#00766C]" />
            <span>Filters</span>
            {activeCount > 0 && (
              <span className="flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-[#00766C] text-white text-[10px] font-bold">
                {activeCount}
              </span>
            )}
          </div>
          <span className="text-[12px] text-[#999] font-medium">{total} results</span>
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative bg-white rounded-t-3xl max-h-[88vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom duration-300">
            {/* Handle */}
            <div className="sticky top-0 bg-white pt-3 pb-2 z-10 rounded-t-3xl">
              <div className="w-10 h-1 bg-[#E5E7EB] rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between px-6 pb-3 border-b border-[#F3F4F6]">
                <h2 className="text-[18px] font-bold text-[#333]">Filters</h2>
                <button
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close filters"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F5] text-[#666]"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="px-6 py-5 space-y-7">
              {/* Specialty */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Activity size={15} className="text-[#00766C]" />
                  <label className="text-[13px] font-semibold text-[#333]">Specialty</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => (
                    <button
                      key={s}
                      onClick={() => pushParams({ specialty: s === currentSpecialty ? null : s })}
                      className={cn(
                        "text-[13px] font-medium py-2 px-3.5 rounded-full border transition-all",
                        currentSpecialty === s
                          ? "bg-[#00766C] text-white border-[#00766C]"
                          : "bg-white text-[#333] border-[#E5E7EB] active:scale-95"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              {/* Location */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={15} className="text-[#00766C]" />
                  <label className="text-[13px] font-semibold text-[#333]">City</label>
                </div>
                <div className="flex flex-wrap gap-2">
                  {CITIES.map(c => (
                    <button
                      key={c}
                      onClick={() => pushParams({ city: c === currentCity ? null : c })}
                      className={cn(
                        "text-[13px] font-medium py-2 px-3.5 rounded-full border transition-all",
                        currentCity === c
                          ? "bg-[#00766C] text-white border-[#00766C]"
                          : "bg-white text-[#333] border-[#E5E7EB] active:scale-95"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </section>

              {/* Fee */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Wallet size={15} className="text-[#00766C]" />
                  <label className="text-[13px] font-semibold text-[#333]">Max Consultation Fee</label>
                </div>
                <div className="bg-[#F9FAFB] p-5 rounded-2xl border border-[#F3F4F6]">
                  <div className="flex justify-between items-baseline mb-4">
                    <span className="text-[28px] font-bold text-[#00766C] tracking-tight">₹{localMaxFee}</span>
                    <span id="mobile-fee-label" className="text-[11px] text-[#999] font-medium">max per session</span>
                  </div>
                  <input
                    type="range" min={0} max={2000} step={100} value={localMaxFee}
                    aria-labelledby="mobile-fee-label"
                    onChange={(e) => setLocalMaxFee(Number(e.target.value))}
                    className="w-full accent-[#00766C] cursor-pointer"
                  />
                  <div className="flex justify-between mt-2 text-[11px] text-[#999]">
                    <span>₹0</span>
                    <span>₹2,000</span>
                  </div>
                </div>
              </section>

              {/* Visit Type */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Home size={15} className="text-[#00766C]" />
                  <label className="text-[13px] font-semibold text-[#333]">Visit Type</label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {['Any', ...VISIT_TYPES].map(type => {
                    const IconComp = VISIT_TYPE_ICONS[type] ?? SlidersHorizontal
                    return (
                      <button
                        key={type}
                        onClick={() => pushParams({ visit_type: type === 'Any' ? null : VISIT_TYPE_URL[type] })}
                        className={cn(
                          "flex flex-col items-center gap-1.5 py-3.5 px-3 rounded-xl border text-center transition-all",
                          currentVisitType === type
                            ? "bg-[#00766C] text-white border-[#00766C]"
                            : "bg-white text-[#333] border-[#E5E7EB] active:scale-95"
                        )}
                      >
                        <IconComp size={18} />
                        <span className="text-[12px] font-semibold">{type}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
            </div>

            {/* Bottom actions */}
            <div className="sticky bottom-0 bg-white border-t border-[#F3F4F6] px-6 py-4 flex gap-3">
              <button
                onClick={clearAll}
                className="flex-1 py-3 text-[14px] font-semibold text-[#666] rounded-xl border border-[#E5E7EB] hover:bg-[#F5F5F5] transition-colors"
              >
                Reset
              </button>
              <button
                onClick={() => {
                  pushParams({ max_fee: localMaxFee === DEFAULT_MAX_FEE ? null : String(localMaxFee) })
                  setDrawerOpen(false)
                }}
                className="flex-[2] py-3 rounded-xl bg-[#00766C] text-white text-[14px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
              >
                Show {total} results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
