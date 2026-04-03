'use client'

import { useCallback, useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, ChevronDown, Check, MapPin, Activity, Wallet, Filter } from 'lucide-react'
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

// ---------------------------------------------------------------------------
// Help Component: Custom Dropdown (Premium)
// ---------------------------------------------------------------------------

function FilterDropdown({ 
  label, 
  value, 
  options, 
  onChange,
  icon: Icon,
  className 
}: { 
  label: string, 
  value: string, 
  options: string[], 
  onChange: (val: string) => void,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon?: any,
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
          "flex items-center gap-2.5 px-6 py-3 rounded-2xl border text-[14px] font-black tracking-tight transition-all whitespace-nowrap active:scale-95 group",
          value 
            ? "border-teal-500/30 bg-teal-50/50 text-teal-700 shadow-sm shadow-teal-50" 
            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50/50"
        )}
      >
        {Icon && <Icon size={16} className={cn("transition-colors", value ? "text-teal-600" : "text-gray-400 group-hover:text-gray-500")} />}
        <span>{value || label}</span>
        <ChevronDown size={14} className={cn("transition-all duration-300 text-gray-400 group-hover:text-gray-500", isOpen && "rotate-180 text-teal-600")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-gray-100 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 py-3 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
          <div className="px-4 py-2 text-[11px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-2">
            Select {label}
          </div>
          <button
            onClick={() => { onChange(''); setIsOpen(false); }}
            className="w-full px-5 py-3 text-left text-[14px] font-bold text-gray-500 hover:bg-teal-50 transition-colors flex items-center justify-between group"
          >
            Any {label}
            {!value && <Check className="w-4 h-4 text-[#00766C]" />}
          </button>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setIsOpen(false); }}
                className="w-full px-5 py-3 text-left text-[14px] font-bold text-[#333333] hover:bg-teal-50 transition-colors flex items-center justify-between"
              >
                {opt}
                {value === opt && <Check className="w-4 h-4 text-[#00766C]" />}
              </button>
            ))}
          </div>
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
  const currentLat = searchParams.get('lat')
  const currentLng = searchParams.get('lng')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [localMaxFee, setLocalMaxFee] = useState(currentMaxFee)
  const [geoLoading, setGeoLoading] = useState(false)

  useEffect(() => {
    setLocalMaxFee(currentMaxFee)
  }, [currentMaxFee])

  const hasActiveFilters =
    currentCity !== DEFAULT_CITY ||
    currentVisitType !== 'Any' ||
    currentMaxFee !== DEFAULT_MAX_FEE ||
    currentSpecialty !== '' ||
    currentLat !== null

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
      // If we select a city, remove lat/lng
      if (updates.city) {
        next.delete('lat')
        next.delete('lng')
      }
      const nextUrl = `/search?${next.toString()}`
      if (options?.replace) {
        router.replace(nextUrl)
        return
      }

      router.push(nextUrl)
    },
    [router, searchParams]
  )

  const handleNearMe = () => {
    if (!navigator.geolocation) return
    setGeoLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pushParams({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
          city: null
        })
        setGeoLoading(false)
        setDrawerOpen(false)
      },
      () => {
        setGeoLoading(false)
        alert("Location access denied. Please enable it in your browser settings.")
      }
    )
  }

  const clearAll = () => {
    setLocalMaxFee(DEFAULT_MAX_FEE)
    const next = new URLSearchParams(searchParams.toString())
    next.delete('city')
    next.delete('visit_type')
    next.delete('max_fee')
    next.delete('specialty')
    next.delete('lat')
    next.delete('lng')
    router.push(`/search?${next.toString()}`)
    setDrawerOpen(false)
  }


  return (
    <div className="w-full">
      {/* ── Desktop Horizontal Bar ── */}
      <div className="hidden md:flex items-center gap-4 flex-wrap">
        <FilterDropdown 
          label="Location"
          value={currentCity}
          options={CITIES}
          icon={MapPin}
          onChange={(val) => pushParams({ city: val })}
        />

        {/* Near Me Button (Premium) */}
        <button
          onClick={handleNearMe}
          disabled={geoLoading}
          className={cn(
            "flex items-center gap-2.5 px-6 py-3 rounded-2xl border text-[14px] font-black tracking-tight transition-all active:scale-95 group relative overflow-hidden",
            currentLat 
              ? "bg-[#00766C] border-[#00766C] text-white shadow-xl shadow-teal-100/50" 
              : "border-gray-200 bg-white text-gray-600 hover:border-teal-100 hover:bg-teal-50/30 hover:text-teal-700"
          )}
        >
          {currentLat && (
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/10 to-transparent opacity-50" />
          )}
          {geoLoading ? (
            <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
          ) : (
            <div className="relative">
               {currentLat && <div className="absolute -inset-1 bg-white rounded-full animate-ping opacity-20" />}
               <MapPin size={16} className={cn("relative z-10 transition-colors", currentLat ? "text-white" : "group-hover:text-teal-600")} />
            </div>
          )}
          <span className="relative z-10">{currentLat ? 'Near Me Active' : 'Around Me'}</span>
        </button>


        <FilterDropdown 
          label="Specialty"
          value={currentSpecialty}
          options={SPECIALTIES}
          icon={Activity}
          onChange={(val) => pushParams({ specialty: val })}
        />

        {/* Visit Type Toggle (Modern Segmented Control) */}
        <div className="flex bg-[#F8F9FA] p-1.5 rounded-2xl border border-gray-100 ml-1 shadow-inner">
          {['Any', ...VISIT_TYPES].map((type) => (
            <button
              key={type}
              onClick={() => pushParams({ visit_type: type === 'Any' ? null : VISIT_TYPE_URL[type] })}
              className={cn(
                "px-5 py-2 rounded-xl text-[13px] font-black transition-all duration-300",
                currentVisitType === type 
                  ? "bg-white text-[#00766C] shadow-[0_4px_12px_rgba(0,0,0,0.05)] translate-y-[-1px]" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Pricing Filter (Premium Slider) */}
        <div className="flex items-center gap-4 px-6 py-2.5 rounded-2xl border border-gray-200 bg-white ml-1 hover:border-gray-300 transition-colors">
          <div className="flex flex-col">
             <span id="max-fee-label" className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Max Fee</span>
             <span className="text-[14px] font-black text-[#00766C] whitespace-nowrap leading-none">₹{localMaxFee}</span>
          </div>
          <input
            type="range"
            min={0}
            max={2000}
            step={100}
            aria-labelledby="max-fee-label"
            aria-label="Maximum consultation fee"
            value={localMaxFee}
            onChange={(e) => setLocalMaxFee(Number(e.target.value))}
            onPointerUp={() => pushParams({ max_fee: localMaxFee === DEFAULT_MAX_FEE ? null : String(localMaxFee) }, { replace: true })}
            onKeyUp={() => pushParams({ max_fee: localMaxFee === DEFAULT_MAX_FEE ? null : String(localMaxFee) }, { replace: true })}
            className="w-24 accent-[#00766C] cursor-pointer"
          />
        </div>

        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-[14px] font-black text-[#FF6B35] hover:text-[#E85D2A] px-4 ml-auto transition-colors flex items-center gap-2 group"
          >
            <X size={14} className="group-hover:rotate-90 transition-transform" />
            Reset
          </button>
        )}
      </div>

      {/* ── Mobile: Toggle ── */}
      <div className="md:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="inline-flex items-center justify-between w-full px-6 py-4 rounded-2xl border border-gray-200 bg-white text-[15px] font-black text-[#333333] shadow-md active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#00766C]">
                <Filter size={16} strokeWidth={3} />
             </div>
             Filters
             {hasActiveFilters && (
               <span className="flex h-2.5 w-2.5 rounded-full bg-[#FF6B35] ring-4 ring-[#FF6B35]/10 animate-pulse" />
             )}
          </div>
          <div className="text-[13px] text-gray-400 font-bold">{total} Results</div>
        </button>
      </div>

      {/* ── Mobile: Slide-up Drawer (Premium) ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setDrawerOpen(false)} />
          <div className="relative bg-white rounded-t-[48px] p-8 max-h-[92vh] overflow-y-auto shadow-2xl animate-in slide-in-from-bottom-24 duration-700 ease-out">
            <div className="w-16 h-1.5 bg-gray-100 rounded-full mx-auto mb-10" />
            
            <div className="flex items-center justify-between mb-10">
              <div>
                 <h2 className="text-3xl font-black text-[#333333] tracking-tight mb-1">Search Filters</h2>
                 <p className="text-[14px] font-bold text-gray-400 tracking-tight">Personalize your results</p>
              </div>
              <button 
                onClick={() => setDrawerOpen(false)} 
                className="w-12 h-12 bg-gray-50 flex items-center justify-center rounded-2xl text-gray-400 active:scale-90 transition-transform"
              >
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            <div className="space-y-12">
              <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-[#00766C]"><Activity size={20} /></div>
                   <label className="text-[13px] font-black text-[#333333] uppercase tracking-[0.1em]">Specialty</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {SPECIALTIES.map(s => (
                    <button
                      key={s}
                      onClick={() => pushParams({ specialty: s === currentSpecialty ? null : s })}
                      className={cn(
                        "text-[14px] font-bold py-4 px-4 rounded-2xl border text-left transition-all active:scale-[0.97]",
                        currentSpecialty === s 
                          ? "bg-[#00766C] text-white border-[#00766C] shadow-xl shadow-teal-100" 
                          : "bg-white text-gray-500 border-gray-100"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">


                   <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><MapPin size={20} /></div>
                   <label className="text-[13px] font-black text-[#333333] uppercase tracking-[0.1em]">Location</label>
                </div>

                {/* Mobile Near Me Action */}
                <button
                  onClick={handleNearMe}
                  disabled={geoLoading}
                  className={cn(
                    "w-full mb-6 py-6 rounded-[28px] border-2 transition-all flex items-center justify-center gap-4 active:scale-[0.98]",
                    currentLat 
                      ? "bg-[#00766C] border-[#00766C] text-white shadow-2xl shadow-teal-100" 
                      : "bg-white border-blue-50 text-blue-600 shadow-sm"
                  )}
                >
                  {geoLoading ? (
                    <div className="w-6 h-6 rounded-full border-2 border-blue-100 border-t-transparent animate-spin" />
                  ) : (
                    <div className="relative">
                      {currentLat && <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-50" />}
                      <MapPin size={24} strokeWidth={3} className="relative z-10" />
                    </div>
                  )}
                  <div className="flex flex-col items-start translate-y-[-1px]">
                     <span className="text-[16px] font-black leading-none mb-1">{currentLat ? 'Using Current Location' : 'Near My Location'}</span>
                     <span className={cn("text-[11px] font-bold uppercase tracking-widest leading-none", currentLat ? "text-white/60" : "text-blue-400")}>
                        {currentLat ? 'High Precision GPS Active' : 'Sort experts by distance'}
                     </span>
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-3">

                   {CITIES.slice(0, 8).map(c => (
                     <button 
                       key={c}
                       onClick={() => pushParams({ city: c === currentCity ? null : c })}
                       className={cn(
                        "text-[14px] font-bold py-4 px-4 rounded-2xl border text-left transition-all active:scale-[0.97]",
                        currentCity === c 
                          ? "bg-[#333333] text-white border-[#333333]" 
                          : "bg-white text-gray-500 border-gray-100"
                      )}
                     >
                       {c}
                     </button>
                   ))}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600"><Wallet size={20} /></div>
                   <label className="text-[13px] font-black text-[#333333] uppercase tracking-[0.1em]">Consultation Fee</label>
                </div>
                <div className="bg-[#FCFDFD] p-8 rounded-[32px] border border-gray-50">
                  <div className="flex justify-between items-end mb-6">
                    <div className="text-4xl font-black text-[#00766C] tracking-tighter">₹{localMaxFee}</div>
                    <div className="text-[12px] font-black text-gray-300 uppercase tracking-widest leading-none pb-2">Limit</div>
                  </div>
                  <input
                    type="range" min={0} max={2000} step={100} value={localMaxFee}
                    aria-label="Maximum consultation fee"
                    onChange={(e) => setLocalMaxFee(Number(e.target.value))}
                    className="w-full h-2.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#00766C]"
                  />
                  <div className="flex justify-between mt-3 text-[11px] font-bold text-gray-300 tracking-widest">
                     <span>₹0</span>
                     <span>₹2000</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-16 flex gap-4 sticky bottom-0 bg-white/80 backdrop-blur-xl pt-4 pb-4">
              <button 
                onClick={clearAll} 
                className="flex-1 py-5 text-[15px] font-black text-gray-400 hover:text-gray-600 transition-colors"
              >
                Reset All
              </button>
              <button 
                onClick={() => {
                  pushParams({ max_fee: localMaxFee === DEFAULT_MAX_FEE ? null : String(localMaxFee) })
                  setDrawerOpen(false)
                }}
                className="flex-[2.5] py-5 rounded-[22px] bg-[#00766C] text-white text-[17px] font-black shadow-2xl shadow-teal-100 active:scale-[0.98] transition-transform flex items-center justify-center gap-3"
              >
                Apply Filters
                <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-sm">{total}</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
