'use client'

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react'
import { geoMercator, geoPath } from 'd3-geo'
import { MapPin, Activity, Zap, Home, Video, Users, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// ── Major Indian Cities with coordinates ──
// These always render as "network hubs" on the map
const MAJOR_CITIES: { name: string; lat: number; lng: number; tier: 1 | 2 | 3 }[] = [
  { name: 'Mumbai', lat: 19.076, lng: 72.8777, tier: 1 },
  { name: 'Delhi', lat: 28.6139, lng: 77.209, tier: 1 },
  { name: 'Bangalore', lat: 12.9716, lng: 77.5946, tier: 1 },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, tier: 1 },
  { name: 'Hyderabad', lat: 17.385, lng: 78.4867, tier: 1 },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, tier: 1 },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, tier: 2 },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, tier: 2 },
  { name: 'Jaipur', lat: 26.9124, lng: 75.7873, tier: 2 },
  { name: 'Lucknow', lat: 26.8467, lng: 80.9462, tier: 2 },
  { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, tier: 2 },
  { name: 'Kochi', lat: 9.9312, lng: 76.2673, tier: 2 },
  { name: 'Goa', lat: 15.4909, lng: 73.8278, tier: 3 },
  { name: 'Bhopal', lat: 23.2599, lng: 77.4126, tier: 3 },
  { name: 'Indore', lat: 22.7196, lng: 75.8577, tier: 3 },
  { name: 'Surat', lat: 21.1702, lng: 72.8311, tier: 3 },
  { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, tier: 3 },
  { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, tier: 3 },
]

interface CustomIndiaMapProps {
  doctors: { id: string; lat?: number | null; lng?: number | null; location?: string; name?: string }[]
  hoveredDoctorId?: string | null
  selectedCity?: string | null
  onCitySelect?: (cityName: string) => void
  onProviderSelect?: (providerId: string) => void
}

export default function CustomIndiaMap({
  doctors,
  hoveredDoctorId,
  selectedCity,
  onCitySelect,
  onProviderSelect,
}: CustomIndiaMapProps) {
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)

  // ── Fetch GeoJSON ──
  useEffect(() => {
    fetch('/maps/india.geojson')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data: GeoJSON.FeatureCollection) => {
        setGeoData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load India GeoJSON:', err)
        setError(true)
        setLoading(false)
      })
  }, [])

  // ── Container dimensions ──
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // ── Auto-fit Mercator projection ──
  const projection = useMemo(() => {
    if (!geoData || dimensions.width < 10 || dimensions.height < 10) return null
    const padding = 30
    // fitExtent auto-calculates both scale and translate to center the map
    return geoMercator().fitExtent(
      [[padding, padding], [dimensions.width - padding, dimensions.height - padding]],
      geoData
    )
  }, [geoData, dimensions])


  const path = useMemo(() => {
    if (!projection) return null
    return geoPath().projection(projection)
  }, [projection])

  // ── Provider clusters by city ──
  const providerClusters = useMemo(() => {
    const map = new Map<string, { lat: number; lng: number; count: number; ids: string[] }>()
    for (const doc of doctors) {
      if (doc.lat == null || doc.lng == null) continue
      const key = doc.location || `${doc.lat.toFixed(1)},${doc.lng.toFixed(1)}`
      const existing = map.get(key)
      if (existing) {
        existing.count++
        existing.ids.push(doc.id)
      } else {
        map.set(key, { lat: doc.lat, lng: doc.lng, count: 1, ids: [doc.id] })
      }
    }
    return map
  }, [doctors])

  // ── Merge major cities with provider data ──
  const cityMarkers = useMemo(() => {
    return MAJOR_CITIES.map(city => {
      // Check if any providers match this city
      const cluster = providerClusters.get(city.name)
      return {
        ...city,
        providerCount: cluster?.count ?? 0,
        hasProviders: !!cluster,
        providerIds: cluster?.ids ?? [],
      }
    })
  }, [providerClusters])

  const projectPoint = useCallback((lng: number, lat: number): [number, number] => {
    if (!projection) return [0, 0]
    return projection([lng, lat]) as [number, number]
  }, [projection])

  // ── Loading state ──
  if (loading) {
    return (
      <div className="w-full h-full bg-[#FAFBFC] flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#00766C_1px,transparent_1.5px)] [background-size:24px_24px]" />
        <div className="w-12 h-12 rounded-full border-[3px] border-gray-100 border-t-[#00766C] animate-spin" />
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Rendering Map</p>
      </div>
    )
  }

  // ── Error state ──
  if (error || !geoData) {
    return (
      <div className="w-full h-full bg-[#FAFBFC] flex flex-col items-center justify-center gap-4 p-12 text-center">
        <MapPin size={40} className="text-gray-200" />
        <p className="text-[14px] font-bold text-gray-400">Map data unavailable</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-[#FAFBFC] relative overflow-hidden select-none">
      {/* Dot-grid background */}
      <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(#00766C_1px,transparent_1px)] [background-size:32px_32px]" />

      <svg
        width={dimensions.width}
        height={dimensions.height}
        className="relative z-10"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        {/* ── District polygons ── */}
        {path && geoData.features.map((feature, i) => {
          const stateName = (feature.properties as Record<string, string>)?.st_nm ?? ''
          return (
            <path
              key={i}
              d={path(feature) || ''}
              fill="#FFFFFF"
              stroke="#00766C"
              strokeOpacity={0.12}
              strokeWidth={0.8}
              className="transition-colors duration-300 hover:fill-[#E8F5F3]"
            >
              <title>{stateName}</title>
            </path>
          )
        })}

        {/* ── City markers ── */}
        {projection && cityMarkers.map((city) => {
          const [cx, cy] = projectPoint(city.lng, city.lat)
          if (cx === 0 && cy === 0) return null
          const isActive = city.hasProviders
          const isHovered = hoveredCity === city.name ||
            city.providerIds.some(id => id === hoveredDoctorId)
          const isSelected = selectedCity === city.name
          const r = city.tier === 1 ? 6 : city.tier === 2 ? 4 : 3

          return (
            <g
              key={city.name}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredCity(city.name)}
              onMouseLeave={() => setHoveredCity(null)}
              onClick={() => {
                if (onCitySelect && city.providerCount > 0) {
                  onCitySelect(city.name)
                }
              }}
            >
              {/* Pulse ring for active hubs */}
              {isActive && (
                <circle cx={cx} cy={cy} r={r + 8}
                  className="fill-[#00766C]/8 animate-ping"
                  style={{ animationDuration: '3s' }}
                />
              )}

              {/* Outer glow */}
              <circle cx={cx} cy={cy} r={r + 3}
                className={cn(
                  "transition-all duration-300",
                  isHovered ? "fill-[#00766C]/20" : "fill-transparent"
                )}
              />

              {/* Pin dot */}
              <circle cx={cx} cy={cy} r={r}
                className={cn(
                  "stroke-white stroke-[2px] transition-all duration-300",
                  isActive
                    ? "fill-[#00766C]"
                    : "fill-gray-300",
                  isHovered && "fill-[#005A52] scale-125"
                )}
                style={isHovered ? { transform: `translate(${cx}px, ${cy}px) scale(1.4)`, transformOrigin: '0 0', translate: `${-cx * 0.4}px ${-cy * 0.4}px` } : undefined}
              />

              {/* City label — always show for tier 1, on hover for others */}
              {(city.tier === 1 || isHovered) && (
                <text
                  x={cx}
                  y={cy - r - 6}
                  textAnchor="middle"
                  className={cn(
                    "pointer-events-none select-none",
                    isHovered
                      ? "fill-[#00766C] text-[12px] font-black"
                      : "fill-gray-400 text-[10px] font-bold"
                  )}
                  style={{ fontFamily: 'system-ui, sans-serif' }}
                >
                  {city.name}
                </text>
              )}

              {/* Provider count badge */}
              {isActive && city.providerCount > 0 && (
                <g>
                  <rect
                    x={cx + r + 4}
                    y={cy - 8}
                    width={Math.max(24, city.providerCount.toString().length * 8 + 16)}
                    height={16}
                    rx={8}
                    className="fill-[#00766C]"
                  />
                  <text
                    x={cx + r + 4 + Math.max(24, city.providerCount.toString().length * 8 + 16) / 2}
                    y={cy + 1}
                    textAnchor="middle"
                    className="fill-white text-[9px] font-bold"
                    style={{ fontFamily: 'system-ui, sans-serif' }}
                  >
                    {city.providerCount}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* ── Extra provider dots not matching a major city ── */}
        {projection && Array.from(providerClusters.entries())
          .filter(([key]) => !MAJOR_CITIES.some(c => c.name === key))
          .map(([key, cluster]) => {
            const [cx, cy] = projectPoint(cluster.lng, cluster.lat)
            if (cx === 0 && cy === 0) return null
            const isHovered = cluster.ids.some(id => id === hoveredDoctorId)
            return (
              <g key={key}>
                <circle cx={cx} cy={cy} r={isHovered ? 7 : 4}
                  className={cn(
                    "stroke-white stroke-[1.5px] transition-all duration-300",
                    isHovered ? "fill-[#005A52]" : "fill-[#00766C]/70"
                  )}
                />
              </g>
            )
          })
        }
      </svg>

      {/* ── Legend card ── */}
      <div className="absolute top-6 left-6 p-5 bg-white/95 backdrop-blur-xl border border-gray-100/80 rounded-2xl shadow-lg z-20 w-[200px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-[#00766C] rounded-xl flex items-center justify-center text-white">
            <MapPin size={18} strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[13px] font-black text-[#333] leading-none tracking-tight">India Map</p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Live Network</p>
            </div>
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-3" />

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <span className="text-[18px] font-black text-[#333] leading-none">{doctors.length || '—'}</span>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Experts</p>
          </div>
          <div>
            <span className="text-[18px] font-black text-[#00766C] leading-none">
              {providerClusters.size || MAJOR_CITIES.filter(c => c.tier <= 2).length}
            </span>
            <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Cities</p>
          </div>
        </div>

        <div className="h-px bg-gray-100 mb-3" />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00766C]" />
            <span className="text-[10px] font-bold text-gray-500">Active Hub</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <span className="text-[10px] font-bold text-gray-500">Coming Soon</span>
          </div>
        </div>
      </div>

      {/* ── Hovered city tooltip (bottom-right) ── */}
      {hoveredCity && (
        <div className="absolute bottom-6 right-6 p-4 bg-white border border-gray-100 rounded-2xl shadow-xl z-20 min-w-[180px] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <p className="text-[15px] font-black text-[#333] tracking-tight">{hoveredCity}</p>
          {(() => {
            const city = cityMarkers.find(c => c.name === hoveredCity)
            if (!city) return null
            return (
              <>
                <p className="text-[11px] font-bold text-gray-400 mt-1">
                  {city.providerCount > 0
                    ? `${city.providerCount} verified expert${city.providerCount > 1 ? 's' : ''}`
                    : 'Network expanding soon'
                  }
                </p>
                {city.providerCount > 0 && (
                  <Link
                    href={`/search?city=${city.name}`}
                    className="mt-3 flex items-center gap-1.5 text-[11px] font-black text-[#00766C] hover:underline"
                  >
                    View experts <ChevronRight size={12} />
                  </Link>
                )}
              </>
            )
          })()}
        </div>
      )}
    </div>
  )
}
