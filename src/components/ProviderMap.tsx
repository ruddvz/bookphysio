'use client'

import { useState, useMemo, useRef } from 'react'
import { Map, Marker, Popup, NavigationControl, FullscreenControl, Source, Layer, type MapRef } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { type Doctor } from '@/components/DoctorCard'
import { Star, MapPin, Clock, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

type ProviderFeature = {
  properties: {
    cluster_id?: number
    doctor?: Doctor
  }
  geometry: {
    coordinates: [number, number]
  }
  layer?: {
    id?: string
  }
}

type ProviderMapClickEvent = {
  features?: ProviderFeature[]
}

const MapErrorFallback = () => (
  <div className="w-full h-full bg-[#f8fafc] flex flex-col items-center justify-center p-12 text-center gap-6 relative overflow-hidden">
     <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#00766C_1px,transparent_1.5px)] [background-size:24px_24px]"></div>
     <div className="relative group">
        <div className="absolute -inset-4 bg-bp-accent/15/30 rounded-full blur-xl group-hover:opacity-100 opacity-0 transition-opacity"></div>
        <div className="w-24 h-24 bg-white rounded-[40px] shadow-2xl flex items-center justify-center text-bp-accent relative z-10 border border-bp-border/50">
           <MapPin size={48} strokeWidth={1} className="animate-bounce duration-[2000ms]" />
        </div>
     </div>
     <div className="max-w-[320px] space-y-3 relative z-10">
        <h3 className="text-[20px] font-black text-bp-primary tracking-tighter">Map Discovery Offline</h3>
        <p className="text-[14px] font-bold text-bp-body/40 leading-relaxed">
           We're having trouble reaching our map provider. Please use the list view to browse experts in the meantime.
        </p>
        <div className="pt-4 flex flex-col items-center gap-2">
           <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest">Dev Check Required</span>
           <p className="text-[10px] font-bold text-bp-body/30 italic">Error 401: Invalid Mapbox Token</p>
        </div>
     </div>
  </div>
)

interface ProviderMapProps {
  doctors: Doctor[]
  hoveredDoctorId?: string | null
}

export default function ProviderMap({ doctors, hoveredDoctorId }: ProviderMapProps) {
  const mapRef = useRef<MapRef>(null)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  if (!MAPBOX_TOKEN || MAPBOX_TOKEN.length < 20 || MAPBOX_TOKEN.includes('...')) {
    return <MapErrorFallback />
  }


  // Filter doctors with valid coordinates
  const doctorsWithCoords = useMemo(() => 
    doctors.filter(d => d.lat != null && d.lng != null),
  [doctors])

  // Convert doctors to GeoJSON for clustering
  const geojson = useMemo(() => ({
    type: 'FeatureCollection',
    features: doctorsWithCoords.map(d => ({
      type: 'Feature',
      properties: {
        id: d.id,
        name: d.name,
        fee: d.fee,
        rating: d.rating,
        specialty: d.specialty,
        credentials: d.credentials,
        nextSlot: d.nextSlot,
        doctor: d // Store full object for easy retrieval
      },
      geometry: {
        type: 'Point',
        coordinates: [d.lng!, d.lat!]
      }
    }))
  }), [doctorsWithCoords])

  // Initial view state (centered on India default or first result)
  const initialViewState = useMemo(() => {
    if (doctorsWithCoords.length > 0) {
      return {
        latitude: doctorsWithCoords[0].lat!,
        longitude: doctorsWithCoords[0].lng!,
        zoom: 11
      }
    }
    return {
      latitude: 20.5937,
      longitude: 78.9629,
      zoom: 4
    }
  }, [doctorsWithCoords])

  const onClusterClick = (event: ProviderMapClickEvent) => {
    const feature = event.features?.[0]
    if (!feature || feature.properties.cluster_id == null) {
      return
    }

    const clusterId = feature.properties.cluster_id
    const mapboxSource = mapRef.current?.getSource('providers') as {
      getClusterExpansionZoom: (
        clusterId: number,
        callback: (err: Error | null | undefined, zoom: number | undefined) => void,
      ) => void
    } | undefined

    if (!mapboxSource) {
      return
    }

    mapboxSource.getClusterExpansionZoom(clusterId, (err: Error | null | undefined, zoom: number | undefined) => {
      if (err) return

      mapRef.current?.easeTo({
        center: feature.geometry.coordinates,
        zoom: zoom || 14,
        duration: 500
      })
    })
  }

  const onPointClick = (event: ProviderMapClickEvent) => {
    const feature = event.features?.[0]
    if (feature?.properties.doctor) {
      setSelectedDoctor(feature.properties.doctor)
    }
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full bg-bp-surface flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
        <div className="w-16 h-16 bg-bp-surface rounded-full flex items-center justify-center mb-4">
           <MapPin size={24} className="text-bp-body/30" />
        </div>
        <div className="max-w-xs">
          <p className="text-[15px] font-black text-bp-primary tracking-tight">Mapbox Token Missing</p>
          <p className="text-[13px] font-bold text-bp-body/40 mt-2 leading-relaxed">
            Please add <code className="text-bp-accent bg-bp-accent/10 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code> to enable the premium map experience.
          </p>
        </div>
      </div>
    )
  }

  return (
    <Map
      ref={mapRef}
      initialViewState={initialViewState}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
      interactiveLayerIds={['clusters', 'unclustered-point']}
      onClick={(e: ProviderMapClickEvent) => {
        const feature = e.features?.[0]
        if (!feature) {
          setSelectedDoctor(null)
          return
        }

        if (feature.layer?.id === 'clusters') {
          onClusterClick(e)
        } else if (feature.layer?.id === 'unclustered-point') {
          onPointClick(e)
        }

      }}
    >
      <FullscreenControl position="top-right" />
      <NavigationControl position="top-right" />
      
      {/* Premium India Mapping Integration (udit-001/india-maps-data) */}
      <Source
        id="india-boundary"
        type="geojson"
        data="https://cdn.jsdelivr.net/gh/udit-001/india-maps-data@ef25ebc/geojson/india.geojson"
      >
        <Layer
          id="india-fill"
          type="fill"
          paint={{
            'fill-color': '#00766C',
            'fill-opacity': 0.02
          }}
        />
        <Layer
          id="india-stroke"
          type="line"
          paint={{
            'line-color': '#00766C',
            'line-width': 1,
            'line-opacity': 0.15
          }}
        />
      </Source>
      <Source
        id="providers"
        type="geojson"

        data={geojson}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        {/* Cluster Circles Layer */}
        <Layer
          id="clusters"
          type="circle"
          source="providers"
          filter={['has', 'point_count']}
          paint={{
            'circle-color': [
              'step',
              ['get', 'point_count'],
              '#00766C', // Default teal
              10,
              '#005A52', // Darker teal for > 10
              30,
              '#003D37'  // Deep teal for > 30
            ],
            'circle-radius': [
              'step',
              ['get', 'point_count'],
              20,
              10,
              30,
              30,
              40
            ],
            'circle-stroke-width': 4,
            'circle-stroke-color': 'rgba(0, 118, 108, 0.2)'
          }}
        />

        {/* Cluster Count Layer */}
        <Layer
          id="cluster-count"
          type="symbol"
          source="providers"
          filter={['has', 'point_count']}
          layout={{
            'text-field': '{point_count}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
          }}
          paint={{
            'text-color': '#ffffff'
          }}
        />

        {/* Individual Points Layer */}
        <Layer
          id="unclustered-point"
          type="circle"
          source="providers"
          filter={['!', ['has', 'point_count']]}
          paint={{
            'circle-color': '#00766C',
            'circle-radius': 8,
            'circle-stroke-width': 3,
            'circle-stroke-color': '#fff'
          }}
        />
      </Source>

      {/* Popups for hovered or selected doctors */}
      {selectedDoctor && (() => {
        const doc = selectedDoctor;
        return (
          <Popup
            latitude={doc.lat!}
            longitude={doc.lng!}
            anchor="bottom"
            onClose={() => setSelectedDoctor(null)}
            closeButton={false}
            maxWidth="280px"
            className="provider-popup animate-in zoom-in-95 duration-200"
            offset={12}
          >
            <div className="p-1 flex flex-col gap-3">
               <div className="aspect-video bg-[#f8fafc] rounded-2xl flex items-center justify-center text-bp-accent/20 font-black text-3xl overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-white"></div>
                  <span className="relative z-10">{doc.name.replace('Dr. ', '').charAt(0)}</span>
               </div>
               
               <div className="px-1 py-1">
                  <div className="flex justify-between items-start gap-2 mb-1">
                     <h3 className="text-[17px] font-black text-bp-primary leading-none tracking-tight">
                        {doc.name}
                     </h3>
                     <div className="flex items-center gap-1 bg-[#FDF9EA] px-2 py-0.5 rounded-lg border border-[#FEFAE6] shrink-0">
                        <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                        <span className="text-[11px] font-black text-bp-primary">{doc.rating.toFixed(1)}</span>
                     </div>
                  </div>
                  
                  <p className="text-[12px] font-bold text-bp-body/40 mb-4 line-clamp-1">
                     {doc.credentials} · {doc.specialty}
                  </p>

                  <div className="flex items-center justify-between mb-4 bg-bp-surface p-2 rounded-xl border border-bp-border">
                     <div className="flex flex-col">
                        <span className="text-[10px] font-black text-bp-body/40 uppercase tracking-widest leading-none mb-1">Next Available</span>
                        <span className="text-[12px] font-black text-bp-accent leading-none">{doc.nextSlot?.split(',')[0] || 'Today'}</span>
                     </div>
                     <div className="h-6 w-px bg-gray-200"></div>
                     <div className="flex flex-col text-right">
                        <span className="text-[10px] font-black text-bp-body/40 uppercase tracking-widest leading-none mb-1">Fee</span>
                        <span className="text-[12px] font-black text-bp-primary leading-none">₹{doc.fee}</span>
                     </div>
                  </div>

                  <Link
                    href={`/doctor/${doc.id}`}
                    className="group/btn w-full bg-bp-primary text-white text-[13px] font-black py-4 rounded-2xl hover:bg-bp-accent transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-2"
                  >
                    Book Session
                    <ChevronRight size={16} strokeWidth={3} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
               </div>
            </div>
          </Popup>
        )
      })()}

      {/* Hover state marker (High visibility) */}
      {hoveredDoctorId && !selectedDoctor && doctorsWithCoords.find(d => d.id === hoveredDoctorId) && (
        <Marker 
          latitude={doctorsWithCoords.find(d => d.id === hoveredDoctorId)!.lat!}
          longitude={doctorsWithCoords.find(d => d.id === hoveredDoctorId)!.lng!}
          anchor="bottom"
        >
           <div className="relative">
              <div className="absolute -inset-4 bg-bp-accent/20 rounded-full animate-ping"></div>
              <div className="relative w-8 h-8 bg-bp-accent border-4 border-white rounded-full shadow-2xl shadow-teal-900/40 flex items-center justify-center text-white">
                 <MapPin size={16} strokeWidth={3} />
              </div>
           </div>
        </Marker>
      )}

      <style jsx global>{`
        .provider-popup .mapboxgl-popup-content {
          padding: 12px !important;
          border-radius: 32px !important;
          box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .provider-popup .mapboxgl-popup-tip {
          border-top-color: white !important;
          display: none;
        }
      `}</style>
    </Map>
  )
}

