'use client'

import { useEffect, useRef, useState } from 'react'
import { INDIA_CITIES, formatCityLabel, searchCities, type IndiaCity } from '@/lib/india-locations'

interface CityComboboxProps {
  value: string
  onChange: (city: string, state?: string) => void
  placeholder?: string
  inputStyle?: React.CSSProperties
  className?: string
  /** If true, shows only the city name in the input (not "City, State") */
  cityOnly?: boolean
}

/**
 * Searchable city picker that shows "City, State" format.
 * Selecting a city provides both the city name and state to the onChange handler.
 */
export default function CityCombobox({
  value,
  onChange,
  placeholder = 'Search city…',
  inputStyle,
  className,
  cityOnly = false,
}: CityComboboxProps) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const results = searchCities(query).slice(0, 8)

  // Sync external value changes
  useEffect(() => {
    setQuery(value)
  }, [value])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleSelect(entry: IndiaCity) {
    const label = cityOnly ? entry.city : formatCityLabel(entry)
    setQuery(label)
    onChange(entry.city, entry.state)
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) {
      if (e.key === 'ArrowDown') { setOpen(true); return }
    }
    if (e.key === 'ArrowDown') {
      setHighlighted((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' && results[highlighted]) {
      e.preventDefault()
      handleSelect(results[highlighted])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setQuery(v)
    setHighlighted(0)
    setOpen(true)
    // If user clears field, clear parent too
    if (!v) onChange('', undefined)
  }

  const showDropdown = open && results.length > 0

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }} className={className}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleChange}
        onFocus={() => { if (query.length === 0) setOpen(true) }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        aria-haspopup="listbox"
        style={inputStyle}
      />
      {showDropdown && (
        <ul
          role="listbox"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            background: '#fff',
            border: '1px solid var(--color-bp-border, #EBE1D2)',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            margin: '4px 0 0 0',
            padding: '4px 0',
            listStyle: 'none',
            maxHeight: '260px',
            overflowY: 'auto',
          }}
        >
          {results.map((entry, i) => (
            <li
              key={entry.slug}
              role="option"
              aria-selected={i === highlighted}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(entry) }}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                padding: '10px 14px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1px',
                background: i === highlighted ? 'var(--color-bp-surface, #FBF9F4)' : 'transparent',
              }}
            >
              <span style={{ fontWeight: 600, color: 'var(--color-bp-primary, #0B3B32)' }}>{entry.city}</span>
              <span style={{ fontSize: '12px', color: '#888' }}>{entry.state}</span>
            </li>
          ))}
          {results.length === 0 && (
            <li style={{ padding: '10px 14px', fontSize: '13px', color: '#888' }}>No cities found</li>
          )}
        </ul>
      )}
    </div>
  )
}

/** Standalone list of top cities for quick-pick chips */
export const TOP_INDIA_CITIES = INDIA_CITIES.slice(0, 18)
