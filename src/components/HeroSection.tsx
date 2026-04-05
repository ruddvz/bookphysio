'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronDown } from 'lucide-react'

const focusWords = [
  'sports rehab',
  'home visits',
  'post-surgery recovery',
  'neuro care',
  'daily pain relief',
]

const CONDITIONS = [
  'Back Pain', 'Knee Rehab', 'Sports Injury', 'Post-Surgery',
  'Neck Pain', 'Shoulder Pain', 'Neuro Care', 'Geriatric Care',
  "Women's Health", 'Pediatric Care', 'Arthritis', 'Spinal Cord Injury'
]

const CITIES = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad', 'Howrah', 'Ranchi', 'Gwalior', 'Jabalpur', 'Coimbatore', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Gurgaon', 'Noida'
]

const heroStats = [
  { label: 'Verified providers', value: '5,000+' },
  { label: 'Cities covered', value: '18' },
  { label: 'Average rating', value: '4.9/5' },
  { label: 'Visit formats', value: 'Clinic + home' },
]

function SearchBar({
  condition,
  location,
  onConditionChange,
  onLocationChange,
  onSubmit,
}: {
  condition: string
  location: string
  onConditionChange: (value: string) => void
  onLocationChange: (value: string) => void
  onSubmit: () => void
}) {
  const [showConditions, setShowConditions] = useState(false)
  const [showCities, setShowCities] = useState(false)
  
  const conditionRef = useRef<HTMLDivElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (conditionRef.current && !conditionRef.current.contains(event.target as Node)) {
        setShowConditions(false)
      }
      if (cityRef.current && !cityRef.current.contains(event.target as Node)) {
        setShowCities(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredCities = location 
    ? CITIES.filter(c => c.toLowerCase().startsWith(location.toLowerCase()))
    : CITIES
    
  const filteredConditions = condition
    ? CONDITIONS.filter(c => c.toLowerCase().includes(condition.toLowerCase()))
    : CONDITIONS

  return (
    <div className="relative mx-auto w-full max-w-4xl overflow-visible p-2 md:p-0 mt-8">
      <div className="flex flex-col lg:flex-row items-center gap-3 bg-white/70 backdrop-blur-3xl border border-white rounded-full p-2.5 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] ring-1 ring-bp-primary/5 transition-all">
        
        {/* CONDITION SELECTOR */}
        <div ref={conditionRef} className="relative flex-1 w-full lg:w-auto h-full">
          <div 
            onClick={() => setShowConditions(true)}
            className="flex flex-col gap-1 px-6 py-3.5 h-full transition-all bg-white/50 border border-bp-border/40 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] focus-within:bg-white focus-within:ring-2 ring-bp-accent/30 cursor-text"
          >
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bp-accent/80">
              Condition
            </span>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={condition}
                onChange={(event) => {
                  onConditionChange(event.target.value)
                  setShowConditions(true)
                }}
                onFocus={() => setShowConditions(true)}
                placeholder="Search condition..."
                className="w-full bg-transparent text-[16px] font-bold text-bp-primary outline-none placeholder:text-bp-primary/40 truncate"
              />
              <ChevronDown size={16} className="text-bp-primary/40 ml-2 shrink-0" />
            </div>
          </div>
          
          {showConditions && (
            <div className="absolute top-full left-0 right-0 mt-3 max-h-[300px] overflow-y-auto rounded-[24px] border border-white bg-white/95 backdrop-blur-2xl p-3 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] ring-1 ring-bp-primary/5 z-50 custom-scrollbar text-left animate-in fade-in slide-in-from-top-2 duration-200">
              {filteredConditions.length > 0 ? (
                filteredConditions.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onConditionChange(c)
                      setShowConditions(false)
                    }}
                    className="w-full text-left px-4 py-3.5 text-[15px] font-bold text-bp-primary/80 hover:bg-white/50 hover:text-bp-accent rounded-xl transition-all"
                  >
                    {c}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-[14px] text-bp-body/60 text-left font-medium">No conditions found</div>
              )}
            </div>
          )}
        </div>

        {/* LOCATION SELECTOR */}
        <div ref={cityRef} className="relative flex-1 w-full lg:w-auto h-full">
          <div 
             onClick={() => setShowCities(true)}
             className="flex flex-col gap-1 px-6 py-3.5 h-full transition-all bg-white/50 border border-bp-border/40 rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.04)] focus-within:bg-white focus-within:ring-2 ring-bp-accent/30 cursor-text"
          >
            <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-bp-accent/80">
              Location
            </span>
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={location}
                onChange={(event) => {
                  onLocationChange(event.target.value)
                  setShowCities(true)
                }}
                onFocus={() => setShowCities(true)}
                placeholder="City name..."
                className="w-full bg-transparent text-[16px] font-bold text-bp-primary outline-none placeholder:text-bp-primary/40 truncate"
              />
              <ChevronDown size={16} className="text-bp-primary/40 ml-2 shrink-0" />
            </div>
          </div>
          
           {showCities && (
            <div className="absolute top-full left-0 right-0 mt-3 max-h-[300px] overflow-y-auto rounded-[24px] border border-white bg-white/95 backdrop-blur-2xl p-3 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.12)] ring-1 ring-bp-primary/5 z-50 custom-scrollbar text-left animate-in fade-in slide-in-from-top-2 duration-200">
              {filteredCities.length > 0 ? (
                filteredCities.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      onLocationChange(c)
                      setShowCities(false)
                    }}
                    className="w-full text-left px-4 py-3.5 text-[15px] font-bold text-bp-primary/80 hover:bg-white/50 hover:text-bp-accent rounded-xl transition-all"
                  >
                    {c}
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-[14px] text-bp-body/60 text-left font-medium">Not found in our network</div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onSubmit}
          className="w-full lg:w-auto h-[68px] lg:min-w-[160px] rounded-full bg-bp-primary text-white font-bold flex items-center justify-center gap-2 px-8 transition-all hover:bg-bp-accent hover:shadow-xl hover:shadow-bp-primary/20 active:scale-[0.98] group shrink-0"
        >
          Find care
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  )
}

export default function HeroSection() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [condition, setCondition] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((previous) => (previous + 1) % focusWords.length)
    }, 3200)

    return () => clearInterval(interval)
  }, [])

  const handleSubmit = () => {
    const params = new URLSearchParams()

    if (condition.trim()) {
      params.set('condition', condition.trim())
    }

    if (location.trim()) {
      params.set('location', location.trim())
    }

    router.push(params.toString() ? `/search?${params.toString()}` : '/search')
  }

  return (
    <section className="relative border-b border-bp-border bg-bp-surface/40 overflow-visible" aria-label="Hero">
      <div className="absolute left-1/2 top-0 h-[600px] max-w-full w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(18,179,160,0.12),transparent_70%)] overflow-hidden" />
      <div className="bp-shell relative flex min-h-[calc(100svh-6rem)] flex-col justify-center pt-10 pb-20 md:pt-12 lg:pt-16">
        <div className="mx-auto max-w-5xl text-center mt-8">
          <h1 className="mx-auto max-w-4xl text-[clamp(2.4rem,7vw,5.5rem)] font-bold leading-[1.02] tracking-[-0.05em] text-bp-primary">
            Book verified physiotherapists in India for <br className="hidden md:block" />
            <span className="relative inline-flex min-h-[1.05em] items-end overflow-hidden align-baseline pb-[0.06em] text-bp-accent pr-8">
              <span key={currentIndex} className="animate-specialty inline-block">
                {focusWords[currentIndex]}.
              </span>
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-4xl text-[18px] leading-relaxed text-bp-body/80 md:text-[22px]">
            Book verified physiotherapists for home visits or in-clinic care in under 60 seconds.
          </p>

          <div className="mt-8">
            <SearchBar
              condition={condition}
              location={location}
              onConditionChange={setCondition}
              onLocationChange={setLocation}
              onSubmit={handleSubmit}
            />
          </div>

          <div className="mt-9 flex flex-wrap justify-center gap-8 md:gap-12 transition-all">
            {heroStats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-[20px] font-bold text-bp-primary">{stat.value}</p>
                <p className="text-[12px] font-medium uppercase tracking-wider text-bp-body/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}