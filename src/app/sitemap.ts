import { MetadataRoute } from 'next'

// Base URL for the site
const BASE_URL = 'https://bookphysio.in'

// Static routes
const staticRoutes = [
  '',
  '/about',
  '/faq',
  '/how-it-works',
  '/privacy',
  '/terms',
  '/search',
  '/login',
  '/signup',
  '/doctor-signup',
]

// Cities from CITY_MAP in src/app/city/[slug]/page.tsx
const cities = [
  'mumbai',
  'delhi',
  'bangalore',
  'chennai',
  'hyderabad',
  'pune',
  'kolkata',
  'ahmedabad',
  'jaipur',
  'surat',
]

// Specialties from SPECIALTY_MAP in src/app/specialty/[slug]/page.tsx
const specialties = [
  'sports-physio',
  'neuro-physio',
  'ortho-physio',
  'paediatric-physio',
  'womens-health',
  'geriatric-physio',
  'post-surgery-rehab',
  'pain-management',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  const staticMaps = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  const cityMaps = cities.map((city) => ({
    url: `${BASE_URL}/city/${city}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const specialtyMaps = specialties.map((specialty) => ({
    url: `${BASE_URL}/specialty/${specialty}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticMaps, ...cityMaps, ...specialtyMaps]
}
