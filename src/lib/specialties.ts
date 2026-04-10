/**
 * NCAHP-recognised physiotherapy specialties (National Commission for
 * Allied and Healthcare Professions Act 2021).
 *
 * Single source of truth used by:
 *   - Navbar browse dropdown
 *   - TopSpecialties homepage section
 *   - /specialty/[slug] listing pages
 *   - /specialties/[slug] article pages
 *   - sitemap.ts
 */

export interface SpecialtyDef {
  /** URL slug — used in /specialty/[slug] and /specialties/[slug] */
  slug: string
  /** Short display name for navigation and cards */
  label: string
  /** Official NCAHP name */
  ncahpName: string
  /** One-line tagline for cards and meta descriptions */
  tagline: string
  /** Lucide icon name (imported separately where needed) */
  icon: string
  /** Tailwind colour classes for cards */
  tint: { text: string; bg: string; border: string; hoverBorder: string }
}

export const SPECIALTIES: readonly SpecialtyDef[] = [
  {
    slug: 'musculoskeletal',
    label: 'Musculoskeletal',
    ncahpName: 'Musculoskeletal Sciences',
    tagline: 'Bones, joints, muscles, and ligaments — from back pain to post-fracture recovery.',
    icon: 'Bone',
    tint: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', hoverBorder: 'hover:border-blue-200' },
  },
  {
    slug: 'neurosciences',
    label: 'Neurosciences',
    ncahpName: 'Neurosciences',
    tagline: 'Stroke recovery, nerve rehabilitation, and neurological movement disorders.',
    icon: 'Brain',
    tint: { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100', hoverBorder: 'hover:border-indigo-200' },
  },
  {
    slug: 'cardio-pulmonary',
    label: 'Cardio-Pulmonary',
    ncahpName: 'Cardio-Pulmonary Sciences',
    tagline: 'Heart and lung rehabilitation, ICU recovery, and breathing retraining.',
    icon: 'HeartPulse',
    tint: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', hoverBorder: 'hover:border-red-200' },
  },
  {
    slug: 'sports',
    label: 'Sports Sciences',
    ncahpName: 'Sports Sciences',
    tagline: 'Injury prevention, athletic rehabilitation, and return-to-play programmes.',
    icon: 'Dumbbell',
    tint: { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100', hoverBorder: 'hover:border-green-200' },
  },
  {
    slug: 'paediatrics',
    label: 'Paediatrics',
    ncahpName: 'Paediatrics & Neonatal Sciences',
    tagline: 'Developmental support, motor milestones, and early intervention for children.',
    icon: 'Baby',
    tint: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-100', hoverBorder: 'hover:border-sky-200' },
  },
  {
    slug: 'womens-health',
    label: "Women's Health",
    ncahpName: 'Obstetrics & Gynaecology Sciences',
    tagline: 'Prenatal and postnatal recovery, pelvic floor rehabilitation, and core strength.',
    icon: 'Flower2',
    tint: { text: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-100', hoverBorder: 'hover:border-pink-200' },
  },
  {
    slug: 'oncology-rehab',
    label: 'Oncology Rehab',
    ncahpName: 'Oncology Sciences',
    tagline: 'Specialised rehabilitation during and after cancer treatment.',
    icon: 'Ribbon',
    tint: { text: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100', hoverBorder: 'hover:border-violet-200' },
  },
  {
    slug: 'community-rehab',
    label: 'Community Rehab',
    ncahpName: 'Community Rehabilitation Sciences',
    tagline: 'Geriatric care, disability management, and community-based recovery.',
    icon: 'Users',
    tint: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', hoverBorder: 'hover:border-amber-200' },
  },
] as const
