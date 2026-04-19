/**
 * Flat map: condition slug → specialty slug
 *
 * Derived from the conditions[] array in SPECIALTIES (src/lib/specialties.ts).
 * Used by the search page to route /search?condition=back-pain to the right specialty.
 */

export const CONDITION_SLUG_TO_SPECIALTY_SLUG: Readonly<Record<string, string>> = {
  // Orthopaedic
  'back-pain': 'orthopaedic',
  'knee-osteoarthritis': 'orthopaedic',
  'frozen-shoulder': 'orthopaedic',
  'sciatica': 'orthopaedic',
  'neck-pain': 'orthopaedic',
  'spondylosis': 'orthopaedic',

  // Neurological
  'stroke': 'neurological',
  'parkinsons-disease': 'neurological',
  'multiple-sclerosis': 'neurological',
  'spinal-cord-injury': 'neurological',
  'cerebral-palsy': 'neurological',
  'traumatic-brain-injury': 'neurological',

  // Sports
  'acl-tear': 'sports',
  'rotator-cuff-injury': 'sports',
  'tennis-elbow': 'sports',
  'ankle-sprain': 'sports',
  'stress-fracture': 'sports',
  'hamstring-strain': 'sports',

  // Paediatric
  'paediatric-cerebral-palsy': 'paediatric',
  'developmental-delay': 'paediatric',
  'muscular-dystrophy': 'paediatric',
  'torticollis': 'paediatric',
  'scoliosis-children': 'paediatric',
  'adhd-coordination': 'paediatric',

  // Cardiopulmonary
  'copd': 'cardiopulmonary',
  'asthma': 'cardiopulmonary',
  'post-covid-recovery': 'cardiopulmonary',
  'post-cabg-rehab': 'cardiopulmonary',
  'bronchiectasis': 'cardiopulmonary',
  'icu-recovery': 'cardiopulmonary',

  // Geriatric
  'osteoporosis': 'geriatric',
  'balance-disorders': 'geriatric',
  'fall-prevention': 'geriatric',
  'hip-fracture-rehab': 'geriatric',
  'age-related-deconditioning': 'geriatric',
  'knee-hip-arthritis': 'geriatric',

  // Women's Health (merged obstetrics + gynaecology)
  'pelvic-girdle-pain': 'womens',
  'low-back-pain-pregnancy': 'womens',
  'diastasis-recti': 'womens',
  'postnatal-core-weakness': 'womens',
  'symphysis-pubis-dysfunction': 'womens',
  'prenatal-swelling': 'womens',
  'urinary-incontinence': 'womens',
  'pelvic-organ-prolapse': 'womens',
  'chronic-pelvic-pain': 'womens',
  'dyspareunia': 'womens',
  'vaginismus': 'womens',
  'faecal-incontinence': 'womens',
}

/**
 * Resolves a condition slug (e.g. "back-pain") to a specialty slug
 * (e.g. "orthopaedic"), or null if not found.
 */
export function conditionSlugToSpecialtySlug(conditionSlug: string): string | null {
  return CONDITION_SLUG_TO_SPECIALTY_SLUG[conditionSlug] ?? null
}
