'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { Activity, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Gleo imports (using specific file imports to avoid potential workspace resolution issues)
// NOTE: Gleo is ESM source based, so we import .mjs files. 
// If your environment has trouble with .mjs in node_modules, 
// you may need to add 'gleo' to transpilePackages in next.config.ts
import MercatorMap from 'gleo/src/MercatorMap.mjs'
import MercatorTiles from 'gleo/src/loaders/MercatorTiles.mjs'
import GeoJSON from 'gleo/src/loaders/GeoJSON.mjs'
import LatLng from 'gleo/src/geometry/LatLng.mjs'
import Circle from 'gleo/src/symbols/Circle.mjs'
import TextLabel from 'gleo/src/symbols/TextLabel.mjs'
import Stroke from 'gleo/src/symbols/Stroke.mjs'
import Fill from 'gleo/src/symbols/Fill.mjs'

// â”€â”€ Major Indian Cities with coordinates â”€â”€
const MAJOR_CITIES = [
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
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [hoveredCity, setHoveredCity] = useState<string | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const symbolsRef = useRef<Map<string, any>>(new Map())

  // Provider clusters by city (memoized)
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

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    // Initialize Gleo Map
    const map = new MercatorMap(containerRef.current, {
      center: new LatLng([22.5, 80]), // Centered on India
      scale: 30000, 
    })
    mapRef.current = map

    // Base Map (OpenStreetMap)
    new MercatorTiles("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "Â© OpenStreetMap",
        s: ["a", "b", "c"]
    }).addTo(map)

    // Load India Boundaries (GeoJSON)
    new GeoJSON("/maps/india.geojson", {
        pointSymbolizer: () => [], // Ignore points
        linestringSymbolizer: () => [new Stroke(null, { strokeColour: "#00766C44", width: 1.5 })],
        polygonSymbolizer: () => [
            new Fill(null, { fillColour: "#00766C05" }),
            new Stroke(null, { strokeColour: "#00766C22", width: 1 })
        ]
    }).addTo(map)

    setMapLoaded(true)

    return () => {
      // Cleanup: Gleo usually handles this but we'll clear our reference
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
      mapRef.current = null
    }
  }, [])

  // Update Symbols logic
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return
    const map = mapRef.current

    // Gleo does not yet have an easy 'map.clearSymbols()' so we must track them
    symbolsRef.current.forEach(s => map.removeSymbol(s))
    symbolsRef.current.clear()

    // 1. Layer: Major Cities (Fixed Points of Interest)
    MAJOR_CITIES.forEach(city => {
      const cluster = providerClusters.get(city.name)
      const hasProviders = !!cluster
      const isHovered = hoveredCity === city.name || 
                        (cluster?.ids.includes(hoveredDoctorId || ""))

      const pinColor = hasProviders ? "#00766C" : "#E5E7EB"
      const radius = isHovered ? 12 : 8

      const circle = new Circle(new LatLng([city.lat, city.lng]), {
        radius: radius,
        fillColour: pinColor,
        strokeColour: "#FFFFFF",
        width: 2,
        interactive: true
      })
      
      circle.addTo(map)
      symbolsRef.current.set(`city-${city.name}`, circle)

      // Add Label
      if (city.tier === 1 || isHovered) {
        const text = new TextLabel(new LatLng([city.lat + 0.1, city.lng]), {
          str: city.name,
          font: "bold 12px Inter, system-ui",
          colour: isHovered ? "#00766C" : "#6B7280",
          haloColour: "white",
          haloWidth: 2,
          align: "center"
        })
        text.addTo(map)
        symbolsRef.current.set(`label-${city.name}`, text)
      }

      // Interaction
      circle.on('pointerenter', () => setHoveredCity(city.name))
      circle.on('pointerleave', () => setHoveredCity(null))
      circle.on('click', () => {
        if (onCitySelect) onCitySelect(city.name)
      })
    })

    // 2. Layer: Provider Clusters for non-major city entries
    providerClusters.forEach((cluster, key) => {
      if (MAJOR_CITIES.some(c => c.name === key)) return // Already handled

      const isHovered = cluster.ids.includes(hoveredDoctorId || "")
      const circle = new Circle(new LatLng([cluster.lat, cluster.lng]), {
        radius: isHovered ? 10 : 6,
        fillColour: "#00766C",
        strokeColour: "#FFFFFF",
        width: 1.5,
        interactive: true
      })
      circle.addTo(map)
      symbolsRef.current.set(`cluster-${key}`, circle)

      circle.on('pointerenter', () => setHoveredCity(key))
      circle.on('pointerleave', () => setHoveredCity(null))
      circle.on('click', () => {
        if (onCitySelect) onCitySelect(key)
      })
    })

  }, [mapLoaded, doctors, hoveredDoctorId, hoveredCity, onCitySelect, providerClusters])

  return (
    <div className="w-full h-full bg-[#f8fafc] relative overflow-hidden flex flex-col items-center justify-center rounded-3xl group shadow-inner">
      {/* Map Content Layer */}
      <div 
        ref={containerRef} 
        className="absolute inset-0 z-0 bg-transparent active:cursor-grabbing"
      />
      
      {/* Stats Panel */}
      <div className="absolute top-6 left-6 p-4 bg-white/90 backdrop-blur-md border border-white/40 shadow-xl rounded-2xl z-10 w-[180px] pointer-events-none transition-all group-hover:bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-emerald-700 rounded-lg flex items-center justify-center text-white ring-4 ring-emerald-50">
            <Activity size={16} />
          </div>
          <div>
            <p className="text-[12px] font-black text-slate-800 leading-none">BookPhysio</p>
            <p className="text-[10px] text-emerald-600 font-bold mt-1 uppercase tracking-wider">Live Network</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 border-t pt-3">
          <div>
            <span className="text-xl font-black text-slate-900 leading-none">{doctors.length}</span>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 whitespace-nowrap">Verified Pros</p>
          </div>
          <div>
            <span className="text-xl font-black text-emerald-600 leading-none">{MAJOR_CITIES.length}</span>
            <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5 whitespace-nowrap">Tier 1 Cities</p>
          </div>
        </div>
      </div>

      {/* Popover for interactive city/pin info */}
      {hoveredCity && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 p-3 bg-slate-900 text-white rounded-xl shadow-2xl z-20 animate-in fade-in slide-in-from-bottom-2 duration-300 min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black truncate">{hoveredCity}</span>
            <ChevronRight size={14} className="text-emerald-400" />
          </div>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">
            {providerClusters.get(hoveredCity)?.count || 0} available experts
          </p>
        </div>
      )}

      {/* No JS Fallback / Hint */}
      {!mapLoaded && (
        <div className="text-center p-12 bg-white/10 backdrop-blur rounded-3xl animate-pulse">
          <div className="w-12 h-12 bg-white/50 rounded-full mx-auto mb-4" />
          <p className="text-sm text-slate-500 font-medium">Initializing Interactive Grid...</p>
        </div>
      )}
    </div>
  )
}
