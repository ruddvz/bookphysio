import { MetadataRoute } from 'next'

// Base URL for the site
const BASE_URL = 'https://bookphysio.in'

// Static routes (auth/app routes excluded — noindex)
const staticRoutes: Array<{ path: string; lastModified: string; priority: number }> = [
  { path: '',              lastModified: '2026-03-15', priority: 1   },
  { path: '/about',       lastModified: '2026-02-01', priority: 0.8 },
  { path: '/faq',         lastModified: '2026-03-01', priority: 0.8 },
  { path: '/how-it-works',lastModified: '2026-02-01', priority: 0.8 },
  { path: '/privacy',     lastModified: '2026-01-01', priority: 0.4 },
  { path: '/terms',       lastModified: '2026-01-01', priority: 0.4 },
  { path: '/hi/about',       lastModified: '2026-04-03', priority: 0.7 },
  { path: '/hi/faq',         lastModified: '2026-04-03', priority: 0.7 },
  { path: '/hi/how-it-works',lastModified: '2026-04-03', priority: 0.7 },
  { path: '/hi/privacy',     lastModified: '2026-04-03', priority: 0.3 },
  { path: '/hi/terms',       lastModified: '2026-04-03', priority: 0.3 },
  { path: '/search',      lastModified: '2026-03-15', priority: 0.9 },
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
  const staticMaps = staticRoutes.map(({ path, lastModified, priority }) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(lastModified),
    changeFrequency: 'monthly' as const,
    priority,
  }))

  const cityMaps = cities.map((city) => ({
    url: `${BASE_URL}/city/${city}`,
    lastModified: new Date('2026-03-01'),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const specialtyMaps = specialties.map((specialty) => ({
    url: `${BASE_URL}/specialty/${specialty}`,
    lastModified: new Date('2026-03-01'),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticMaps, ...cityMaps, ...specialtyMaps]
}
