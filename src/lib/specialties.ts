/**
 * Physiotherapy specialties for bookphysio.in
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
  /** Patient-friendly sub-label shown under the main label */
  subLabel: string
  /** One-line tagline for cards and meta descriptions */
  tagline: string
  /** Lucide icon name (imported separately where needed) */
  icon: string
  /** Path to 3D illustration image under /public (optional until images are dropped in) */
  image?: string
  /** Tailwind colour classes for cards */
  tint: { text: string; bg: string; border: string; hoverBorder: string }
}

export const SPECIALTIES: readonly SpecialtyDef[] = [
  {
    slug: 'orthopaedic',
    label: 'Orthopaedic',
    subLabel: 'Bones & Joints',
    tagline: 'Bones, joints, muscles, and ligaments — from back pain to post-fracture recovery.',
    icon: 'Bone',
    image: '/specialties/orthopaedic.png',
    tint: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', hoverBorder: 'hover:border-blue-200' },
  },
  {
    slug: 'neurological',
    label: 'Neurological',
    subLabel: 'Nerves & Brain',
    tagline: 'Stroke recovery, nerve rehabilitation, and neurological movement disorders.',
    icon: 'Brain',
    image: '/specialties/neurological.png',
    tint: { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100', hoverBorder: 'hover:border-indigo-200' },
  },
  {
    slug: 'sports',
    label: 'Sports',
    subLabel: 'Athletic Injuries',
    tagline: 'Injury prevention, athletic rehabilitation, and return-to-play programmes.',
    icon: 'Dumbbell',
    image: '/specialties/sports.png',
    tint: { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100', hoverBorder: 'hover:border-green-200' },
  },
  {
    slug: 'paediatric',
    label: 'Paediatric',
    subLabel: 'Children',
    tagline: 'Developmental support, motor milestones, and early intervention for children.',
    icon: 'Baby',
    image: '/specialties/paediatric.png',
    tint: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-100', hoverBorder: 'hover:border-sky-200' },
  },
  {
    slug: 'cardiopulmonary',
    label: 'Cardiopulmonary',
    subLabel: 'Heart & Lungs',
    tagline: 'Heart and lung rehabilitation, ICU recovery, and breathing retraining.',
    icon: 'HeartPulse',
    image: '/specialties/cardiopulmonary.png',
    tint: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', hoverBorder: 'hover:border-red-200' },
  },
  {
    slug: 'geriatric',
    label: 'Geriatric',
    subLabel: 'Elderly Care',
    tagline: 'Fall prevention, mobility preservation, and independence for older adults.',
    icon: 'PersonStanding',
    image: '/specialties/geriatric.png',
    tint: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', hoverBorder: 'hover:border-amber-200' },
  },
  {
    slug: 'obstetrics',
    label: 'Obstetrics',
    subLabel: 'Pregnancy Care',
    tagline: 'Prenatal and postnatal physiotherapy for a safe, comfortable pregnancy journey.',
    icon: 'Baby',
    image: '/specialties/obstetrics.png',
    tint: { text: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-100', hoverBorder: 'hover:border-pink-200' },
  },
  {
    slug: 'gynaecology',
    label: 'Gynaecology',
    subLabel: "Women's Health",
    tagline: 'Pelvic floor rehabilitation, incontinence management, and core strength.',
    icon: 'Flower2',
    image: '/specialties/gynaecology.png',
    tint: { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', hoverBorder: 'hover:border-rose-200' },
  },
  {
    slug: 'oncology',
    label: 'Oncology',
    subLabel: 'Cancer Rehab',
    tagline: 'Specialised rehabilitation during and after cancer treatment.',
    icon: 'Ribbon',
    image: '/specialties/oncology.png',
    tint: { text: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100', hoverBorder: 'hover:border-violet-200' },
  },
  {
    slug: 'community',
    label: 'Community',
    subLabel: 'Public Health',
    tagline: 'Community-based rehabilitation, disability management, and inclusive care.',
    icon: 'Users',
    image: '/specialties/community.png',
    tint: { text: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-100', hoverBorder: 'hover:border-teal-200' },
  },
  {
    slug: 'industrial',
    label: 'Industrial',
    subLabel: 'Workplace/Ergonomics',
    tagline: 'Work-related injury prevention, ergonomic assessment, and occupational rehab.',
    icon: 'Briefcase',
    image: '/specialties/industrial.png',
    tint: { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', hoverBorder: 'hover:border-orange-200' },
  },
  {
    slug: 'vestibular',
    label: 'Vestibular',
    subLabel: 'Balance/Vertigo',
    tagline: 'Vertigo, dizziness, and balance disorder rehabilitation.',
    icon: 'Ear',
    image: '/specialties/vestibular.png',
    tint: { text: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-100', hoverBorder: 'hover:border-cyan-200' },
  },
] as const
