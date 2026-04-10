import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SpecialtyArticle, { type SpecialtyArticleData } from '@/components/specialties/SpecialtyArticle'
import { buildSpecialtyArticleMetadata } from '@/components/specialties/articleMetadata'
import { SPECIALTIES } from '@/lib/specialties'

const SPECIALTIES_DATA: Record<string, SpecialtyArticleData> = {
  'musculoskeletal': {
    title: 'Musculoskeletal Physiotherapy',
    ncahpName: 'Musculoskeletal Sciences',
    subtitle: 'Expert relief for your bones, joints, ligaments, and muscles.',
    description:
      'Musculoskeletal physiotherapy deals with problems of the bones, joints, ligaments and muscles. It is commonly used after a knee or hip replacement, for back or neck pain, for recovery after a fracture, and for people living with arthritis. Your physiotherapist will assess how you are moving, use hands-on techniques where helpful, and give you exercises to do between sessions so the improvements stick.',
    highlights: [
      'Expert manual therapy and joint mobilisation',
      'Post-operative rehabilitation pathways',
      'Chronic pain management planning',
      'Targeted core and limb strengthening programmes',
    ],
    benefits: [
      'Significant reduction in joint stiffness',
      'Alleviation of acute and chronic pain',
      'Restoration of normal structural mobility',
      'Avoidance of future invasive surgeries',
    ],
    conditions: [
      'Arthritis and osteoarthritis',
      'Back and neck pain',
      'Post-fracture recovery',
      'Knee and hip replacement rehab',
      'Frozen shoulder and rotator cuff injuries',
      'Sciatica and disc problems',
    ],
  },
  'neurosciences': {
    title: 'Neurological Physiotherapy',
    ncahpName: 'Neurosciences',
    subtitle: 'Re-wiring the brain for improved mobility and independence.',
    description:
      "Neurological physiotherapy helps people who have movement or function problems caused by a condition affecting the brain, spinal cord or nerves. Therapists use the brain's ability to form new connections, known as neuroplasticity, to help you recover movement and confidence. It is commonly used after a stroke or spinal cord injury, and for people living with Parkinson's disease, Multiple Sclerosis or similar conditions.",
    highlights: [
      'Gait (walking) retraining and optimisation',
      'Advanced balance and coordination exercises',
      'Spasticity and muscle tone management',
      'Task-specific functional training',
    ],
    benefits: [
      'Regain maximum possible independence',
      'Reduce risk of falls and injuries',
      'Improve overall stamina and motor control',
      'Slow the progression of degenerative symptoms',
    ],
    conditions: [
      'Stroke recovery',
      "Parkinson's disease",
      'Multiple Sclerosis',
      'Spinal cord injury',
      "Bell's palsy",
      'Traumatic brain injury',
    ],
  },
  'cardio-pulmonary': {
    title: 'Cardio-Pulmonary Physiotherapy',
    ncahpName: 'Cardio-Pulmonary Sciences',
    subtitle: 'Breathing easier, recovering stronger.',
    description:
      'Cardio-pulmonary physiotherapy focuses on the heart and lungs. It helps people recovering from cardiac surgery, managing COPD, or rebuilding stamina after a prolonged ICU stay. Treatment typically includes breathing exercises, graded physical activity, airway clearance techniques and education on managing symptoms day to day. The goal is to get you back to a level of activity that feels comfortable and sustainable.',
    highlights: [
      'Breathing retraining and airway clearance',
      'Post-cardiac surgery rehabilitation',
      'Graded exercise programmes for stamina',
      'ICU and ventilator weaning support',
    ],
    benefits: [
      'Improved lung capacity and oxygen uptake',
      'Faster recovery after heart surgery',
      'Better management of chronic respiratory conditions',
      'Reduced hospital readmission rates',
    ],
    conditions: [
      'COPD and chronic bronchitis',
      'Post-cardiac surgery recovery',
      'Asthma management',
      'Post-COVID respiratory rehabilitation',
      'ICU and ventilator recovery',
      'Pulmonary fibrosis',
    ],
  },
  'sports': {
    title: 'Sports Physiotherapy',
    ncahpName: 'Sports Sciences',
    subtitle: 'Get back to your sport, safely.',
    description:
      'Sports physiotherapy focuses on preventing and treating injuries that happen during sport or exercise. Whether you play competitively or just run on weekends, a sports physiotherapist looks at how you move, builds you back up with a progressive programme, and helps you return to activity without rushing it. It is commonly used for ACL tears, rotator cuff problems, tennis elbow, hamstring strains and ligament sprains.',
    highlights: [
      'Biomechanical analysis and correction',
      'Customised return-to-play protocols',
      'Targeted injury prevention strategies',
      'Active stretching and joint mobilisation',
    ],
    benefits: [
      'Faster recovery from acute injuries',
      'Prevention of chronic pain development',
      'Enhanced athletic performance',
      'Safe transition back to high-impact sports',
    ],
    conditions: [
      'ACL and ligament tears',
      'Tennis and golfer elbow',
      'Hamstring and muscle strains',
      'Ankle sprains and instability',
      'Shin splints and stress fractures',
      'Rotator cuff injuries',
    ],
  },
  'paediatrics': {
    title: 'Paediatric Physiotherapy',
    ncahpName: 'Paediatrics & Neonatal Sciences',
    subtitle: 'Gentle, engaging care for infants and children.',
    description:
      'Children move, grow and heal differently from adults, and paediatric physiotherapy is built around that. It supports infants, toddlers and older children with developmental delays, cerebral palsy, torticollis, posture issues and growth-related injuries. Sessions use play-based activities so children stay engaged while they build strength and work towards their next motor milestones, with parents involved at every step.',
    highlights: [
      'Fun, play-based therapeutic exercises',
      'Gross motor milestone tracking and achievement',
      'Family-centred care and parent education',
      'Postural correction and growth monitoring',
    ],
    benefits: [
      'Supports healthy physical development',
      'Improves confidence in physical play',
      'Prevents long-term postural deformities',
      'Empowers parents with daily care strategies',
    ],
    conditions: [
      'Cerebral palsy',
      'Developmental delays',
      'Torticollis in infants',
      'Flat head syndrome',
      'Scoliosis in children',
      'Sports injuries in young athletes',
    ],
  },
  'womens-health': {
    title: "Women's Health Physiotherapy",
    ncahpName: 'Obstetrics & Gynaecology Sciences',
    subtitle: 'Private, supportive care for prenatal, postnatal, and pelvic health.',
    description:
      "Women's health physiotherapy focuses on the pelvis and pelvic floor. It can help you prepare for childbirth, recover after delivery, rebuild core strength if you have diastasis recti, and manage issues like urinary incontinence or pelvic organ prolapse. Sessions are one-to-one and confidential, and your physiotherapist will explain each step so you feel comfortable throughout.",
    highlights: [
      'Comprehensive pelvic floor rehabilitation',
      'Safe prenatal and postnatal exercise planning',
      'Diastasis recti recovery techniques',
      'Bladder and bowel control reinforcement',
    ],
    benefits: [
      'Smoother pregnancy and delivery preparation',
      'Rapid recovery of core strength after birth',
      'Resolution of incontinence issues',
      'Confident return to high-impact activities',
    ],
    conditions: [
      'Urinary incontinence',
      'Pelvic organ prolapse',
      'Diastasis recti',
      'Prenatal back and pelvic pain',
      'Postnatal recovery',
      'Pelvic floor dysfunction',
    ],
  },
  'oncology-rehab': {
    title: 'Oncology Rehabilitation',
    ncahpName: 'Oncology Sciences',
    subtitle: 'Rebuilding strength and confidence during and after cancer treatment.',
    description:
      'Oncology rehabilitation supports people who are going through or have completed cancer treatment. Surgery, chemotherapy and radiation can leave lasting effects on strength, mobility, fatigue levels and lymphatic function. A specialist physiotherapist works with your medical team to design a programme that respects where you are in treatment, helps manage side effects, and gradually rebuilds your physical capacity at a pace that feels right for you.',
    highlights: [
      'Fatigue management and graded activity',
      'Lymphoedema prevention and treatment',
      'Post-surgical mobility restoration',
      'Breathing and relaxation techniques',
    ],
    benefits: [
      'Reduced treatment-related fatigue',
      'Better management of lymphoedema',
      'Improved physical function during treatment',
      'Faster return to daily activities after treatment',
    ],
    conditions: [
      'Post-mastectomy recovery',
      'Cancer-related fatigue',
      'Lymphoedema after lymph node removal',
      'Peripheral neuropathy from chemotherapy',
      'Bone and joint stiffness from treatment',
      'Deconditioning after prolonged bed rest',
    ],
  },
  'community-rehab': {
    title: 'Community Rehabilitation',
    ncahpName: 'Community Rehabilitation Sciences',
    subtitle: 'Compassionate care to maintain independence and quality of life.',
    description:
      'Getting older often means less strength, stiffer joints and a slightly shakier sense of balance. Community rehabilitation physiotherapy is built around those changes. The focus is on keeping you independent at home, managing osteoarthritis and osteoporosis, easing chronic pain without relying only on medicines, and most importantly, preventing falls. It also covers disability management and community-based recovery programmes. Sessions can happen at home or at the clinic, whichever feels easier.',
    highlights: [
      'Dedicated fall prevention training',
      'Osteoarthritis and joint wear management',
      'Home accessibility assessments',
      'Gentle mobility and flexibility preservation',
    ],
    benefits: [
      'Maintains independence and self-reliance',
      'Significantly reduces life-threatening falls',
      'Provides drug-free chronic pain relief',
      'Extends the ability to live at home comfortably',
    ],
    conditions: [
      'Age-related mobility decline',
      'Osteoarthritis and osteoporosis',
      'Fall risk and balance disorders',
      'Post-hospitalisation deconditioning',
      'Chronic pain in older adults',
      'Disability management and home adaptation',
    ],
  },
}

export function generateStaticParams() {
  return SPECIALTIES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = SPECIALTIES_DATA[slug]

  if (!data) {
    return {
      title: 'Not Found | BookPhysio.in',
    }
  }

  return buildSpecialtyArticleMetadata({
    slug,
    title: data.title,
    subtitle: data.subtitle,
    description: data.description,
  })
}

export default async function SpecialtyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = SPECIALTIES_DATA[slug]
  if (!data) notFound()

  const pageUrl = `https://bookphysio.in/specialties/${slug}`

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://bookphysio.in' },
      { '@type': 'ListItem', position: 2, name: 'Specialties', item: 'https://bookphysio.in/search' },
      { '@type': 'ListItem', position: 3, name: data.title, item: pageUrl },
    ],
  }

  const medicalWebPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: `${data.title} in India`,
    description: data.description,
    url: pageUrl,
    about: {
      '@type': 'MedicalSpecialty',
      name: 'PhysicalTherapy',
    },
    lastReviewed: '2026-04-10',
    reviewedBy: {
      '@type': 'Organization',
      name: 'BookPhysio',
      url: 'https://bookphysio.in',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }}
      />
      <SpecialtyArticle data={data} slug={slug} />
    </>
  )
}
