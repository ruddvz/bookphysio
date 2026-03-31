'use client'

import { useState, useMemo } from 'react'
import { Map, Marker, Popup, NavigationControl, FullscreenControl, type MapLayerMouseEvent } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { type Doctor } from '@/components/DoctorCard'
import { Star, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

interface ProviderMapProps {
  doctors: Doctor[]
}

export default function ProviderMap({ doctors }: ProviderMapProps) {
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)

  // Filter doctors with valid coordinates
  const doctorsWithCoords = useMemo(() => 
    doctors.filter(d => d.lat != null && d.lng != null),
  [doctors])

  // Initial view state (centered on first doctor or India default)
  const initialViewState = useMemo(() => {
    if (doctorsWithCoords.length > 0) {
      return {
        latitude: doctorsWithCoords[0].lat!,
        longitude: doctorsWithCoords[0].lng!,
        zoom: 12
      }
    }
    return {
      latitude: 20.5937,
      longitude: 78.9629,
      zoom: 4
    }
  }, [doctorsWithCoords])

  if (!MAPBOX_TOKEN) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center p-8 text-center">
        <div className="max-w-md">
          <p className="text-gray-500 font-medium">Mapbox Token Missing</p>
          <p className="text-sm text-gray-400 mt-1">Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables to enable the map view.</p>
        </div>
      </div>
    )
  }

  return (
    <Map
      initialViewState={initialViewState}
      style={{ width: '100%', height: '100%' }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      mapboxAccessToken={MAPBOX_TOKEN}
    >
      <FullscreenControl position="top-right" />
      <NavigationControl position="top-right" />

      {doctorsWithCoords.map((doctor) => (
        <Marker
          key={doctor.id}
          latitude={doctor.lat!}
          longitude={doctor.lng!}
          anchor="bottom"
          onClick={(e: MapLayerMouseEvent) => {
            e.originalEvent.stopPropagation()
            setSelectedDoctor(doctor)
          }}
        >
          <button className="group relative">
            <div className={`px-2 py-1 rounded-full shadow-lg border-2 border-white transition-all duration-200 transform group-hover:scale-110 ${
              selectedDoctor?.id === doctor.id ? 'bg-[#005A52] scale-110' : 'bg-[#00766C]'
            }`}>
              <span className="text-[12px] font-extrabold text-white">₹{doctor.fee}</span>
            </div>
          </button>
        </Marker>
      ))}

      {selectedDoctor && (
        <Popup
          latitude={selectedDoctor.lat!}
          longitude={selectedDoctor.lng!}
          anchor="top"
          onClose={() => setSelectedDoctor(null)}
          closeButton={false}
          maxWidth="280px"
          className="provider-popup"
        >
          <div className="p-1">
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden relative mb-2">
              <div className="absolute inset-0 flex items-center justify-center text-[#00766C]/20 font-extrabold text-3xl bg-[#E6F4F3]">
                {selectedDoctor.name.replace('Dr. ', '').charAt(0)}
              </div>
            </div>
            
            <div className="px-1">
              <h3 className="font-bold text-[#333333] text-[15px] leading-tight">
                {selectedDoctor.name}
              </h3>
              <p className="text-[12px] text-gray-500 font-medium">
                {selectedDoctor.credentials} · {selectedDoctor.specialty}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-[#FDF9EA] px-1.5 py-0.5 rounded border border-[#FEFAE6]">
                  <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="text-[12px] font-bold text-[#333333]">{selectedDoctor.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1 text-[#00766C] bg-[#E6F4F3] px-1.5 py-0.5 rounded border border-[#D1F1EF]">
                  <Clock className="w-3 h-3" />
                  <span className="text-[11px] font-bold">{selectedDoctor.nextSlot?.split(',')[0]}</span>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                <div className="flex flex-col">
                  <span className="text-[16px] font-extrabold text-[#333333]">₹{selectedDoctor.fee}</span>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Per consult</span>
                </div>
                <Link
                  href={`/doctor/${selectedDoctor.id}`}
                  className="bg-[#00766C] text-white text-[12px] font-bold px-4 py-2 rounded-full hover:bg-[#005A52] transition-colors shadow-sm"
                >
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </Popup>
      )}

      <style jsx global>{`
        .provider-popup .mapboxgl-popup-content {
          padding: 8px !important;
          border-radius: 12px !important;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
        }
        .provider-popup .mapboxgl-popup-tip {
          border-top-color: white !important;
        }
      `}</style>
    </Map>
  )
}
