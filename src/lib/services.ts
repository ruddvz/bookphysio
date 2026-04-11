/**
 * BookPhysio physiotherapy services catalog.
 *
 * Single source of truth for the /services page and any component that
 * needs to reference available treatment types and pricing.
 */

export interface ServiceDef {
  /** URL-safe slug */
  slug: string
  /** Short display name */
  name: string
  /** One-line subtitle */
  subtitle: string
  /** Detailed description (2–3 sentences) */
  description: string
  /** Starting price in ₹ (integer, no paise) */
  startingPrice: number
  /** Duration label e.g. "45 min" */
  duration: string
  /** Visit types available */
  visitTypes: ('clinic' | 'home')[]
  /** Who it's ideal for */
  idealFor: string[]
  /** What to expect in the session */
  includes: string[]
  /** Lucide icon name */
  icon: string
  /** Tailwind colour classes */
  tint: { text: string; bg: string; border: string }
}

export const SERVICES: readonly ServiceDef[] = [
  {
    slug: 'initial-assessment',
    name: 'Initial Assessment',
    subtitle: 'Comprehensive first-visit evaluation',
    description:
      'A thorough 45-minute assessment where your physiotherapist evaluates your condition, reviews your medical history, and creates a personalised treatment plan. This is the recommended starting point for all new patients.',
    startingPrice: 500,
    duration: '45 min',
    visitTypes: ['clinic', 'home'],
    idealFor: ['New patients', 'Chronic pain sufferers', 'Post-surgery referrals'],
    includes: [
      'Full medical history review',
      'Physical examination & movement assessment',
      'Diagnosis and explanation',
      'Personalised treatment plan',
      'Home exercise prescription',
    ],
    icon: 'ClipboardCheck',
    tint: { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  },
  {
    slug: 'follow-up-session',
    name: 'Follow-up Session',
    subtitle: 'Ongoing treatment & progress tracking',
    description:
      'A focused 30-minute treatment session building on your initial assessment. Your physiotherapist applies hands-on techniques, progresses exercises, and adjusts your plan based on how you are responding.',
    startingPrice: 400,
    duration: '30 min',
    visitTypes: ['clinic', 'home'],
    idealFor: ['Existing patients', 'Ongoing rehabilitation', 'Maintenance care'],
    includes: [
      'Progress review & reassessment',
      'Manual therapy / hands-on treatment',
      'Exercise progression',
      'Updated home programme',
    ],
    icon: 'RefreshCcw',
    tint: { text: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
  },
  {
    slug: 'home-visit',
    name: 'Home Visit Session',
    subtitle: 'Professional treatment at your doorstep',
    description:
      'The same quality of care, delivered at your home. Ideal for patients with mobility limitations, post-surgery recovery, or anyone who prefers the convenience of treatment at home. The physiotherapist brings all required equipment.',
    startingPrice: 800,
    duration: '45 min',
    visitTypes: ['home'],
    idealFor: ['Post-surgery patients', 'Elderly patients', 'Patients with mobility issues'],
    includes: [
      'Travel to your location within city limits',
      'Full assessment or follow-up treatment',
      'Portable equipment as needed',
      'Home exercise setup guidance',
    ],
    icon: 'Home',
    tint: { text: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
  },
  {
    slug: 'sports-rehab',
    name: 'Sports Injury Rehab',
    subtitle: 'Get back in the game safely',
    description:
      'Specialised rehabilitation for athletes and active individuals. From ACL tears to runner\'s knee, your sports physio designs a return-to-play programme with sport-specific drills, strength work, and injury prevention strategies.',
    startingPrice: 700,
    duration: '45 min',
    visitTypes: ['clinic'],
    idealFor: ['Athletes', 'Weekend warriors', 'Gym injuries', 'Running injuries'],
    includes: [
      'Sport-specific movement screening',
      'Injury-specific rehabilitation protocol',
      'Strength & conditioning exercises',
      'Return-to-play criteria tracking',
      'Injury prevention strategies',
    ],
    icon: 'Dumbbell',
    tint: { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  },
  {
    slug: 'neuro-rehab',
    name: 'Neuro Rehabilitation',
    subtitle: 'Recovery for neurological conditions',
    description:
      'Structured rehabilitation for stroke, spinal cord injury, Parkinson\'s disease, and other neurological conditions. Treatment focuses on regaining movement, balance, coordination, and functional independence.',
    startingPrice: 900,
    duration: '60 min',
    visitTypes: ['clinic', 'home'],
    idealFor: ['Stroke survivors', 'Parkinson\'s patients', 'Spinal cord injury', 'Multiple sclerosis'],
    includes: [
      'Neurological assessment',
      'Balance & coordination training',
      'Gait retraining',
      'Functional movement therapy',
      'Caregiver education',
    ],
    icon: 'Brain',
    tint: { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  },
  {
    slug: 'ergonomic-assessment',
    name: 'Ergonomic Assessment',
    subtitle: 'Prevent pain before it starts',
    description:
      'A detailed evaluation of your workspace setup — desk, chair, monitor, and posture habits. Your physiotherapist identifies risk factors for repetitive strain and provides actionable changes to prevent neck, back, and wrist pain.',
    startingPrice: 1200,
    duration: '60 min',
    visitTypes: ['home'],
    idealFor: ['Desk workers', 'Remote employees', 'Tech professionals', 'Chronic neck/back pain from work'],
    includes: [
      'Workspace setup evaluation',
      'Posture analysis',
      'Equipment recommendations',
      'Desk exercise programme',
      'Written ergonomic report',
    ],
    icon: 'Monitor',
    tint: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  },
] as const


export interface PackageDef {
  /** URL-safe slug */
  slug: string
  /** Display name */
  name: string
  /** Number of sessions */
  sessions: number
  /** Per-session price in ₹ */
  perSession: number
  /** Total package price in ₹ */
  totalPrice: number
  /** Discount percentage vs single session */
  discount: number
  /** Validity in days */
  validityDays: number
  /** Short description */
  description: string
  /** Key benefits */
  benefits: string[]
  /** Whether this is the recommended option */
  recommended?: boolean
  /** Tailwind colour accent */
  accent: string
}

/** Base single-session price used to calculate discounts */
const BASE_SESSION_PRICE = 500

export const PACKAGES: readonly PackageDef[] = [
  {
    slug: 'single-session',
    name: 'Single Session',
    sessions: 1,
    perSession: BASE_SESSION_PRICE,
    totalPrice: BASE_SESSION_PRICE,
    discount: 0,
    validityDays: 30,
    description: 'Try a session with no commitment. Ideal for a one-time consultation or to try a new physiotherapist.',
    benefits: [
      'No commitment required',
      'Full assessment included',
      'Home exercise prescription',
    ],
    accent: 'slate',
  },
  {
    slug: '5-session-pack',
    name: '5-Session Pack',
    sessions: 5,
    perSession: 450,
    totalPrice: 2250,
    discount: 10,
    validityDays: 60,
    description: 'The short-course option for mild injuries or maintenance. Save 10% per session compared to single bookings.',
    benefits: [
      'Save ₹250 overall',
      'Priority rebooking',
      'Progress tracking included',
      'Flexible scheduling',
    ],
    accent: 'indigo',
  },
  {
    slug: '10-session-pack',
    name: '10-Session Pack',
    sessions: 10,
    perSession: 400,
    totalPrice: 4000,
    discount: 20,
    validityDays: 90,
    description: 'The most popular choice for proper rehabilitation. Covers a full recovery cycle with meaningful savings.',
    benefits: [
      'Save ₹1,000 overall',
      'Priority rebooking',
      'Progress tracking included',
      'Mid-course review session',
      'Flexible scheduling',
    ],
    recommended: true,
    accent: 'violet',
  },
  {
    slug: '20-session-pack',
    name: '20-Session Pack',
    sessions: 20,
    perSession: 375,
    totalPrice: 7500,
    discount: 25,
    validityDays: 180,
    description: 'For long-term rehab, chronic conditions, or ongoing care. The best per-session rate with maximum flexibility.',
    benefits: [
      'Save ₹2,500 overall',
      'Priority rebooking',
      'Progress tracking included',
      'Monthly review sessions',
      'Flexible scheduling',
      'Transferable within family',
    ],
    accent: 'teal',
  },
] as const
