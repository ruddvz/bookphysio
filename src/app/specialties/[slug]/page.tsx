import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SpecialtyArticle, { type SpecialtyArticleData } from '@/components/specialties/SpecialtyArticle'
import { buildSpecialtyArticleMetadata } from '@/components/specialties/articleMetadata'
import { SPECIALTIES } from '@/lib/specialties'

const SPECIALTIES_DATA: Record<string, SpecialtyArticleData> = {
  'orthopaedic': {
    title: 'Orthopaedic Physiotherapy',
    ncahpName: 'Musculoskeletal Sciences',
    subtitle: 'Expert relief for your bones, joints, ligaments, and muscles.',
    description:
      'Orthopaedic physiotherapy deals with problems of the bones, joints, ligaments and muscles. It is commonly used after a knee or hip replacement, for back or neck pain, for recovery after a fracture, and for people living with arthritis. Your physiotherapist will assess how you are moving, use hands-on techniques where helpful, and give you exercises to do between sessions so the improvements stick.',
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
  'neurological': {
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
  'paediatric': {
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
  'cardiopulmonary': {
    title: 'Cardiopulmonary Physiotherapy',
    ncahpName: 'Cardio-Pulmonary Sciences',
    subtitle: 'Breathing easier, recovering stronger.',
    description:
      'Cardiopulmonary physiotherapy focuses on the heart and lungs. It helps people recovering from cardiac surgery, managing COPD, or rebuilding stamina after a prolonged ICU stay. Treatment typically includes breathing exercises, graded physical activity, airway clearance techniques and education on managing symptoms day to day. The goal is to get you back to a level of activity that feels comfortable and sustainable.',
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
  'geriatric': {
    title: 'Geriatric Physiotherapy',
    ncahpName: 'Community Rehabilitation Sciences',
    subtitle: 'Compassionate care to maintain independence and quality of life in older adults.',
    description:
      'Getting older often brings less strength, stiffer joints and a reduced sense of balance. Geriatric physiotherapy is designed around those changes. The focus is on keeping you independent at home, managing osteoarthritis and osteoporosis, easing chronic pain without relying only on medicines, and most importantly, preventing falls. Sessions can take place at home or at the clinic, whichever suits you best.',
    highlights: [
      'Dedicated fall prevention and balance training',
      'Osteoarthritis and joint wear management',
      'Home accessibility and safety assessments',
      'Gentle mobility and flexibility preservation',
    ],
    benefits: [
      'Maintains independence and self-reliance',
      'Significantly reduces life-threatening falls',
      'Drug-free chronic pain relief',
      'Extends the ability to live comfortably at home',
    ],
    conditions: [
      'Age-related mobility decline',
      'Osteoarthritis and osteoporosis',
      'Fall risk and balance disorders',
      'Post-hospitalisation deconditioning',
      'Chronic pain in older adults',
      'Frailty and muscle weakness',
    ],
  },
  'obstetrics': {
    title: 'Obstetric Physiotherapy',
    ncahpName: 'Obstetrics & Gynaecology Sciences',
    subtitle: 'Safe, supportive physiotherapy throughout your pregnancy journey.',
    description:
      'Obstetric physiotherapy supports women through pregnancy and the postnatal period. It addresses the physical changes that pregnancy brings — pelvic girdle pain, back ache, diastasis recti, and fatigue — and helps prepare the body for labour and recovery. Your physiotherapist will design a programme that is safe at every trimester, with modifications as your pregnancy progresses.',
    highlights: [
      'Safe prenatal exercise programming by trimester',
      'Pelvic girdle and back pain management',
      'Labour preparation and breathing techniques',
      'Postnatal core and pelvic floor recovery',
    ],
    benefits: [
      'Reduced pregnancy-related back and pelvic pain',
      'Better preparation for labour and delivery',
      'Faster postnatal recovery',
      'Confident return to daily activities after birth',
    ],
    conditions: [
      'Pelvic girdle pain (PGP)',
      'Low back pain in pregnancy',
      'Diastasis recti',
      'Postnatal core weakness',
      'Symphysis pubis dysfunction',
      'Prenatal swelling and discomfort',
    ],
  },
  'gynaecology': {
    title: "Gynaecological Physiotherapy",
    ncahpName: 'Obstetrics & Gynaecology Sciences',
    subtitle: 'Private, specialised care for pelvic health and women\'s wellbeing.',
    description:
      "Gynaecological physiotherapy focuses on the pelvic floor — the muscles, ligaments and connective tissue that support the bladder, bowel and uterus. It can help manage urinary or faecal incontinence, pelvic organ prolapse, painful intercourse, and chronic pelvic pain. Sessions are one-to-one and completely confidential, and your physiotherapist will explain each step so you always feel in control.",
    highlights: [
      'Comprehensive pelvic floor rehabilitation',
      'Bladder and bowel control programmes',
      'Pelvic pain and dyspareunia management',
      'Internal and external manual therapy',
    ],
    benefits: [
      'Resolution of urinary incontinence',
      'Improved pelvic organ support',
      'Reduced chronic pelvic pain',
      'Restored sexual comfort and confidence',
    ],
    conditions: [
      'Urinary incontinence',
      'Pelvic organ prolapse',
      'Faecal incontinence',
      'Painful intercourse (dyspareunia)',
      'Chronic pelvic pain',
      'Vaginismus',
    ],
  },
  'oncology': {
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
  'community': {
    title: 'Community Physiotherapy',
    ncahpName: 'Community Rehabilitation Sciences',
    subtitle: 'Accessible, inclusive rehabilitation for every person in every community.',
    description:
      'Community physiotherapy brings rehabilitation services to where people live, work and gather. It focuses on making care accessible for people with disabilities, chronic conditions, or limited mobility who cannot easily reach a clinic. Whether delivered at home, in a community centre, or through group programmes, the aim is to improve function, promote independence, and support social participation.',
    highlights: [
      'Home visit and community outreach programmes',
      'Group rehabilitation and wellness sessions',
      'Disability management and adaptive strategies',
      'Education for families and carers',
    ],
    benefits: [
      'Care delivered where you feel most comfortable',
      'Reduced barriers to accessing rehabilitation',
      'Stronger community support and social connection',
      'Practical strategies for daily life',
    ],
    conditions: [
      'Chronic disability and mobility limitations',
      'Post-stroke community reintegration',
      'Learning and developmental disabilities',
      'Chronic musculoskeletal conditions',
      'Social isolation and deconditioning',
      'Post-hospitalisation recovery at home',
    ],
  },
  'industrial': {
    title: 'Industrial & Occupational Physiotherapy',
    ncahpName: 'Community Rehabilitation Sciences',
    subtitle: 'Protecting your body at work and getting you back to full capacity.',
    description:
      'Industrial physiotherapy — also called occupational or ergonomic physiotherapy — focuses on injuries that happen at work, or that are made worse by the way you work. It involves assessing your workplace setup, treating injuries like repetitive strain, back pain and shoulder problems, and designing programmes that get you back to work safely. It also covers pre-employment screening and worksite hazard assessments.',
    highlights: [
      'Ergonomic workstation assessment and correction',
      'Return-to-work rehabilitation planning',
      'Repetitive strain injury treatment',
      'Manual handling training and injury prevention',
    ],
    benefits: [
      'Reduced risk of recurring workplace injuries',
      'Faster, safer return to full work duties',
      'Less absenteeism and improved productivity',
      'Long-term postural and movement habits',
    ],
    conditions: [
      'Repetitive strain injury (RSI)',
      'Work-related back and neck pain',
      'Carpal tunnel syndrome',
      'Shoulder and elbow overuse injuries',
      'Manual handling injuries',
      'Prolonged sitting or standing posture problems',
    ],
  },
  'vestibular': {
    title: 'Vestibular Physiotherapy',
    ncahpName: 'Neurosciences',
    subtitle: 'Stopping the world spinning — expert care for dizziness and balance.',
    description:
      'Vestibular physiotherapy treats problems with the inner ear and balance system. If you experience vertigo, dizziness, a feeling of unsteadiness, or a sensation that the room is spinning, a vestibular physiotherapist can identify the cause and treat it with targeted exercises and repositioning techniques. The most common condition — BPPV (benign paroxysmal positional vertigo) — often resolves in just one or two sessions.',
    highlights: [
      'Canalith repositioning for BPPV (Epley manoeuvre)',
      'Vestibular rehabilitation exercises (VRT)',
      'Gaze stabilisation and eye-head coordination',
      'Balance retraining and fall prevention',
    ],
    benefits: [
      'Rapid resolution of BPPV vertigo',
      'Significantly reduced dizziness and unsteadiness',
      'Restored confidence in daily movement',
      'Lower risk of falls related to balance problems',
    ],
    conditions: [
      'Benign paroxysmal positional vertigo (BPPV)',
      'Vestibular neuritis and labyrinthitis',
      'Chronic dizziness and unsteadiness',
      'Post-concussion balance problems',
      "Meni\u00e8re's disease",
      'Age-related balance decline',
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

  const specialty = SPECIALTIES.find((s) => s.slug === slug)

  return buildSpecialtyArticleMetadata({
    slug,
    title: specialty?.seoTitle ?? data.title,
    subtitle: data.subtitle,
    description: specialty?.seoDescription ?? data.description,
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
    lastReviewed: '2026-04-14',
    reviewedBy: {
      '@type': 'Organization',
      name: 'BookPhysio',
      url: 'https://bookphysio.in',
    },
  }

  const specialty = SPECIALTIES.find((s) => s.slug === slug)

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
      <SpecialtyArticle
        data={data}
        slug={slug}
        image={specialty?.image}
        subLabel={specialty?.subLabel}
        richConditions={specialty?.conditions}
        symptoms={specialty?.symptoms}
        treatments={specialty?.treatments}
        modalities={specialty?.modalities}
        certifications={specialty?.certifications}
      />
    </>
  )
}
