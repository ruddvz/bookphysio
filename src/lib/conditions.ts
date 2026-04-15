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

  // Obstetrics
  'pelvic-girdle-pain': 'obstetrics',
  'low-back-pain-pregnancy': 'obstetrics',
  'diastasis-recti': 'obstetrics',
  'postnatal-core-weakness': 'obstetrics',
  'symphysis-pubis-dysfunction': 'obstetrics',
  'prenatal-swelling': 'obstetrics',

  // Gynaecology
  'urinary-incontinence': 'gynaecology',
  'pelvic-organ-prolapse': 'gynaecology',
  'chronic-pelvic-pain': 'gynaecology',
  'dyspareunia': 'gynaecology',
  'vaginismus': 'gynaecology',
  'faecal-incontinence': 'gynaecology',

  // Oncology
  'lymphoedema': 'oncology',
  'cancer-related-fatigue': 'oncology',
  'post-mastectomy-rehab': 'oncology',
  'peripheral-neuropathy': 'oncology',
  'bone-joint-changes-cancer': 'oncology',
  'cancer-deconditioning': 'oncology',

  // Community
  'post-stroke-community': 'community',
  'disability-management': 'community',
  'geriatric-falls-home': 'community',
  'chronic-musculoskeletal': 'community',
  'post-hospitalisation-recovery': 'community',
  'developmental-disabilities': 'community',

  // Industrial
  'carpal-tunnel': 'industrial',
  'repetitive-strain-injury': 'industrial',
  'work-related-back-pain': 'industrial',
  'shoulder-overuse': 'industrial',
  'neck-pain-screen-work': 'industrial',
  'manual-handling-injuries': 'industrial',

  // Vestibular
  'bppv': 'vestibular',
  'menieres-disease': 'vestibular',
  'vestibular-neuritis': 'vestibular',
  'chronic-dizziness': 'vestibular',
  'post-concussion-balance': 'vestibular',
  'labyrinthitis': 'vestibular',
}

/**
 * Resolves a condition slug (e.g. "back-pain") to a specialty slug
 * (e.g. "orthopaedic"), or null if not found.
 */
export function conditionSlugToSpecialtySlug(conditionSlug: string): string | null {
  return CONDITION_SLUG_TO_SPECIALTY_SLUG[conditionSlug] ?? null
}
