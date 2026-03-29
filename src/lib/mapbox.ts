const MAPBOX_BASE = 'https://api.mapbox.com'

interface MapboxFeature {
  center: [number, number]
}

interface MapboxGeocodeResponse {
  features: MapboxFeature[]
}

export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const encoded = encodeURIComponent(address)
  const res = await fetch(
    `${MAPBOX_BASE}/geocoding/v5/mapbox.places/${encoded}.json?country=IN&access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`
  )
  const data = await res.json() as MapboxGeocodeResponse
  const feature = data.features[0]
  if (!feature) return null
  return { lng: feature.center[0], lat: feature.center[1] }
}
