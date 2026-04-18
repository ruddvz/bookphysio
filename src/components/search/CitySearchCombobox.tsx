'use client'

import { useDeferredValue, useEffect, useId, useMemo, useState } from 'react'
import { INDIA_CITIES } from '@/lib/india-locations'
import { cn } from '@/lib/utils'

const POPULAR_CITIES = [
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Pune',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Ahmedabad',
  'Jaipur',
  'Lucknow',
  'Chandigarh',
  'Kochi',
] as const

const ALL_CITY_NAMES = INDIA_CITIES.map((c) => c.city)

function filterCities(query: string): string[] {
  const q = query.trim().toLowerCase()
  if (!q) {
    return []
  }

  const starts: string[] = []
  const includes: string[] = []
  const seen = new Set<string>()

  for (const city of ALL_CITY_NAMES) {
    if (seen.has(city)) continue
    const lower = city.toLowerCase()
    if (lower.startsWith(q)) {
      starts.push(city)
      seen.add(city)
    }
  }
  for (const city of ALL_CITY_NAMES) {
    if (seen.has(city)) continue
    const lower = city.toLowerCase()
    if (lower.includes(q)) {
      includes.push(city)
      seen.add(city)
    }
  }

  return [...starts, ...includes].slice(0, 20)
}

export function CitySearchCombobox({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (city: string) => void
  className?: string
}) {
  const listId = useId()
  const [inputValue, setInputValue] = useState(value)
  useEffect(() => {
    setInputValue(value)
  }, [value])

  const deferredQuery = useDeferredValue(inputValue)
  const filtered = useMemo(() => filterCities(deferredQuery), [deferredQuery])
  const showPopular = !inputValue.trim()
  const listOpen = !showPopular && filtered.length > 0

  return (
    <div className={cn('w-full space-y-3', className)}>
      <div className="flex flex-wrap gap-2" aria-label="Popular cities">
        {POPULAR_CITIES.map((city) => (
          <button
            key={city}
            type="button"
            aria-pressed={value === city}
            onClick={() => {
              onChange(city)
              setInputValue(city)
            }}
            className={cn(
              'text-[13px] font-medium py-2 px-3.5 rounded-full border transition-all',
              value === city
                ? 'bg-[#00766C] text-white border-[#00766C]'
                : 'bg-white text-[#333] border-[#E5E7EB] hover:border-[#00766C]/40 active:scale-95',
            )}
          >
            {city}
          </button>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={listOpen}
          aria-autocomplete="list"
          aria-controls={listId}
          placeholder="Search city…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className={cn(
            'w-full rounded-[var(--sq-sm)] border border-[#E5E7EB] bg-white py-2.5 text-[13px] font-medium text-[#333] outline-none focus:border-[#00766C]',
            value ? 'pl-3 pr-16' : 'px-3',
          )}
        />
        {value ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#999] hover:text-[#FF6B35]"
            onClick={() => {
              onChange('')
              setInputValue('')
            }}
          >
            Clear
          </button>
        ) : null}
      </div>

      {showPopular ? null : (
        <div
          id={listId}
          role="listbox"
          aria-label="City matches"
          className="max-h-52 overflow-y-auto rounded-[var(--sq-sm)] border border-[#E5E7EB] bg-white"
        >
          {filtered.map((city) => (
            <button
              key={city}
              type="button"
              role="option"
              aria-selected={value === city}
              onClick={() => {
                onChange(city)
                setInputValue(city)
              }}
              className="flex w-full px-3 py-2.5 text-left text-[13px] font-medium text-[#333] hover:bg-[#F5F5F5]"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
