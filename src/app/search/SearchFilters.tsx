'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SlidersHorizontal, X, ChevronDown, Check } from 'lucide-react'
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

const VISIT_TYPES = ['In-clinic', 'Home Visit', 'Online']
const VISIT_TYPE_URL: Record<string, string> = {
  'In-clinic': 'in_clinic',
  'Home Visit': 'home_visit',
  'Online': 'online',
}
const VISIT_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  Object.entries(VISIT_TYPE_URL).map(([k, v]) => [v, k])
)

type VisitType = 'Any' | 'In-clinic' | 'Home Visit' | 'Online'

const DEFAULT_MAX_FEE = 2000
const DEFAULT_CITY = ''

// ---------------------------------------------------------------------------
// Help Component: Custom Dropdown
// ---------------------------------------------------------------------------

function FilterDropdown({ 
  label, 
  value, 
  options, 
  onChange,
  className 
}: { 
  label: string, 
  value: string, 
  options: string[], 
  onChange: (val: string) => void,
  className?: string
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

  return (
    <div className={cn("relative", className)} ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-full border text-[14px] font-bold transition-all whitespace-nowrap",
          value 
            ? "border-[#00766C] bg-[#E6F4F3] text-[#00766C]" 
            : "border-[#E5E5E5] bg-white text-[#333333] hover:border-gray-400"
        )}
      >
        {value || label}
        <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[#E5E5E5] rounded-xl shadow-xl z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={() => { onChange(''); setIsOpen(false); }}
            className="w-full px-4 py-2 text-left text-[14px] font-medium text-gray-500 hover:bg-gray-50 flex items-center justify-between"
          >
            Any {label}
            {!value && <Check className="w-4 h-4 text-[#00766C]" />}
          </button>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className="w-full px-4 py-2 text-left text-[14px] font-medium text-[#333333] hover:bg-gray-50 flex items-center justify-between"
            >
              {opt}
              {value === opt && <Check className="w-4 h-4 text-[#00766C]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export — horizontal bar (desktop) + drawer trigger (mobile)
// ---------------------------------------------------------------------------

export default function SearchFilters({ total = 0 }: { total?: number }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentCity = searchParams.get('city') ?? DEFAULT_CITY
  const currentVisitTypeRaw = searchParams.get('visit_type') ?? ''
  const currentVisitType: VisitType = (VISIT_TYPE_LABEL[currentVisitTypeRaw] as VisitType) ?? 'Any'
  const currentMaxFee = Number(searchParams.get('max_fee') ?? DEFAULT_MAX_FEE)
  const currentSpecialty = searchParams.get('specialty') ?? ''

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [localMaxFee, setLocalMaxFee] = useState(currentMaxFee)

  const hasActiveFilters =
    currentCity !== DEFAULT_CITY ||
    currentVisitType !== 'Any' ||
    currentMaxFee !== DEFAULT_MAX_FEE ||
    currentSpecialty !== ''

  const pushParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          next.delete(key)
        } else {
          next.set(key, value)
        }
      }
      router.push(`/search?${next.toString()}`)
    },
    [router, searchParams]
  )

  const clearAll = () => {
    setLocalMaxFee(DEFAULT_MAX_FEE)
    const next = new URLSearchParams(searchParams.toString())
    next.delete('city')
    next.delete('visit_type')
    next.delete('max_fee')
    next.delete('specialty')
    router.push(`/search?${next.toString()}`)
    setDrawerOpen(false)
  }

  return (
    <div className="w-full">
      {/* ── Desktop Horizontal Bar ── */}
      <div className="hidden md:flex items-center gap-3 flex-wrap">
        <FilterDropdown 
          label="Location"
          value={currentCity}
          options={CITIES}
          onChange={(val) => pushParams({ city: val })}
        />

        <FilterDropdown 
          label="Specialty"
          value={currentSpecialty}
          options={SPECIALTIES}
          onChange={(val) => pushParams({ specialty: val })}
        />

        {/* Visit Type Toggle */}
        <div className="flex bg-[#F5F5F5] p-1 rounded-full border border-[#E5E5E5] ml-1">
          {['Any', ...VISIT_TYPES].map((type) => (
            <button
              key={type}
              onClick={() => pushParams({ visit_type: type === 'Any' ? null : VISIT_TYPE_URL[type] })}
              className={cn(
                "px-4 py-1.5 rounded-full text-[13px] font-bold transition-all",
                currentVisitType === type 
                  ? "bg-white text-[#00766C] shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Pricing Filter */}
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full border border-[#E5E5E5] bg-white ml-1">
          <span className="text-[13px] font-extrabold text-gray-500 whitespace-nowrap">Max ₹{localMaxFee}</span>
          <input
            type="range"
            min={0}
            max={2000}
            step={100}
            value={localMaxFee}
            onChange={(e) => setLocalMaxFee(Number(e.target.value))}
            onMouseUp={() => pushParams({ max_fee: localMaxFee === DEFAULT_MAX_FEE ? null : String(localMaxFee) })}
            className="w-24 accent-[#00766C] cursor-pointer"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-[13px] font-bold text-[#FF6B35] hover:underline px-2 ml-auto"
          >
            Reset all filters
          </button>
        )}
      </div>

      {/* ── Mobile: Toggle ── */}
      <div className="md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#E5E5E5] bg-white text-[14px] font-bold text-[#333333] shadow-sm active:scale-95 transition-transform"
        >
          <SlidersHorizontal className="w-4 h-4 text-[#00766C]" />
          Filters
          {hasActiveFilters && (
            <span className="flex h-2 w-2 rounded-full bg-[#FF6B35]" />
          )}
        </button>
      </div>

      {/* ── Mobile: Slide-up Drawer ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
          <div className="relative bg-white rounded-t-[32px] p-8 max-h-[90vh] overflow-y-auto shadow-2xl transition-transform">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
            
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-[#333333] tracking-tight">Filter Results</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-2.5 bg-gray-100 rounded-full text-gray-400">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-10">
              <section>
                <label className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Specialty</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {SPECIALTIES.map(s => (
                    <button
                      key={s}
                      onClick={() => pushParams({ specialty: s === currentSpecialty ? null : s })}
                      className={cn(
                        "text-[13px] font-bold py-3.5 px-4 rounded-xl border text-left transition-all",
                        currentSpecialty === s 
                          ? "bg-[#00766C] text-white border-[#00766C] shadow-lg shadow-teal-100" 
                          : "bg-white text-gray-600 border-gray-200"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">City</label>
                <div className="grid grid-cols-2 gap-2.5">
                   {CITIES.slice(0, 8).map(c => (
                     <button 
                       key={c}
                       onClick={() => pushParams({ city: c === currentCity ? null : c })}
                       className={cn(
                        "text-[13px] font-bold py-3.5 px-4 rounded-xl border text-left transition-all",
                        currentCity === c 
                          ? "bg-[#00766C] text-white border-[#00766C]" 
                          : "bg-white text-gray-600 border-gray-200"
                      )}
                     >
                       {c}
                     </button>
                   ))}
                </div>
              </section>

              <section>
                <label className="text-[12px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 block">Consultation Fee</label>
                <div className="bg-[#F9FAFB] p-6 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-end mb-4">
                    <div className="text-3xl font-black text-[#00766C]">₹{localMaxFee}</div>
                    <div className="text-[13px] font-bold text-gray-400">MAX FEE</div>
                  </div>
                  <input
                    type="range" min={0} max={2000} step={100} value={localMaxFee}
                    onChange={(e) => setLocalMaxFee(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00766C]"
                  />
                </div>
              </section>
            </div>

            <div className="mt-12 flex gap-4 sticky bottom-0 bg-white pt-4 pb-2">
              <button onClick={clearAll} className="flex-1 py-4 text-[15px] font-bold text-gray-400">Reset All</button>
              <button 
                onClick={() => {
                  pushParams({ max_fee: localMaxFee === DEFAULT_MAX_FEE ? null : String(localMaxFee) })
                  setDrawerOpen(false)
                }}
                className="flex-[2] py-4 rounded-2xl bg-[#00766C] text-white text-[16px] font-black shadow-xl shadow-teal-100 active:scale-[0.98] transition-transform"
              >
                Show {total} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
