import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SpecialtyArticle, { type SpecialtyArticleData } from '@/components/specialties/SpecialtyArticle'
import { buildSpecialtyArticleMetadata } from '@/components/specialties/articleMetadata'

const SPECIALTIES_DATA: Record<string, SpecialtyArticleData> = {
  'sports-physio': {
    title: 'Sports Physiotherapy',
    subtitle: 'Get back to your sport, safely.',
    description:
      'Sports physiotherapy focuses on preventing and treating injuries that happen during sport or exercise. Whether you play competitively or just run on weekends, a sports physiotherapist looks at how you move, builds you back up with a progressive programme, and helps you return to activity without rushing it. It is commonly used for ACL tears, rotator cuff problems, tennis elbow, hamstring strains and ligament sprains.',
    highlights: [
      'Biomechanical analysis and correction',
      'Customized return-to-play protocols',
      'Targeted injury prevention strategies',
      'Active stretching and joint mobilization',
    ],
    benefits: [
      'Faster recovery from acute injuries',
      'Prevention of chronic pain development',
      'Enhanced athletic performance',
      'Safe transition back to high-impact sports',
    ],
  },
  'neuro-physio': {
    title: 'Neurological Physiotherapy',
    subtitle: 'Re-wiring the brain for improved mobility and independence.',
    description:
      "Neurological physiotherapy helps people who have movement or function problems caused by a condition affecting the brain, spinal cord or nerves. Therapists use the brain's ability to form new connections, known as neuroplasticity, to help you recover movement and confidence. It is commonly used after a stroke or spinal cord injury, and for people living with Parkinson's disease, Multiple Sclerosis or similar conditions.",
    highlights: [
      'Gait (walking) retraining and optimization',
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
  },
  'ortho-physio': {
    title: 'Orthopedic Physiotherapy',
    subtitle: 'Expert relief for your bones, joints, ligaments, and sore muscles.',
    description:
      'Orthopaedic physiotherapy deals with problems of the bones, joints, ligaments and muscles. It is commonly used after a knee or hip replacement, for back or neck pain, for recovery after a fracture, and for people living with arthritis. Your physiotherapist will assess how you are moving, use hands-on techniques where helpful, and give you exercises to do between sessions so the improvements stick.',
    highlights: [
      'Expert manual therapy and joint mobilization',
      'Post-operative rehabilitation pathways',
      'Chronic pain management planning',
      'Targeted core and limb strengthening programs',
    ],
    benefits: [
      'Significant reduction in joint stiffness',
      'Alleviation of acute and chronic pain',
      'Restoration of normal structural mobility',
      'Avoidance of future invasive surgeries',
    ],
  },
  'paediatric-physio': {
    title: 'Paediatric Physiotherapy',
    subtitle: 'Gentle, engaging, and dedicated care for infants and children.',
    description:
      'Children move, grow and heal differently from adults, and paediatric physiotherapy is built around that. It supports infants, toddlers and older children with developmental delays, cerebral palsy, torticollis, posture issues and growth-related injuries. Sessions use play-based activities so children stay engaged while they build strength and work towards their next motor milestones, with parents involved at every step.',
    highlights: [
      'Fun, play-based therapeutic exercises',
      'Gross motor milestone tracking and achievement',
      'Family-centered care and parent education',
      'Postural correction and growth monitoring',
    ],
    benefits: [
      'Supports healthy physical development',
      'Improves confidence in physical play',
      'Prevents long-term postural deformities',
      'Empowers parents with daily care strategies',
    ],
  },
  'womens-health': {
    title: "Women's Health Physiotherapy",
    subtitle: 'Private, supportive care for pre and post-natal recovery and pelvic health.',
    description:
      "Women's health physiotherapy focuses on the pelvis and pelvic floor. It can help you prepare for childbirth, recover after delivery, rebuild core strength if you have diastasis recti, and manage issues like urinary incontinence or pelvic organ prolapse. Sessions are one-to-one and confidential, and your physiotherapist will explain each step so you feel comfortable throughout.",
    highlights: [
      'Comprehensive pelvic floor rehabilitation',
      'Safe pre-natal and post-partum exercise planning',
      'Diastasis recti recovery techniques',
      'Bladder and bowel control reinforcement',
    ],
    benefits: [
      'Painless and smoother pregnancy transitions',
      'Rapid recovery of core strength post-birth',
      'Elimination of embarrassing incontinence',
      'Return to high-impact activities safely',
    ],
  },
  'geriatric-physio': {
    title: 'Geriatric Physiotherapy',
    subtitle: 'Compassionate care to maintain independence and quality of life.',
    description:
      'Getting older often means less strength, stiffer joints and a slightly shakier sense of balance. Geriatric physiotherapy is built around those changes. The focus is on keeping you independent at home, managing osteoarthritis and osteoporosis, easing chronic pain without relying only on medicines, and most importantly, preventing falls. Sessions can happen at home or at the clinic, whichever feels easier.',
    highlights: [
      'Dedicated fall prevention training',
      'Osteoarthritis and joint wear management',
      'Bone density and osteoporosis care',
      'Gentle mobility and flexibility preservation',
    ],
    benefits: [
      'Maintains independence and self-reliance',
      'Significantly reduces life-threatening falls',
      'Provides drug-free chronic pain relief',
      'Extends the ability to live at home comfortably',
    ],
  },
}

export function generateStaticParams() {
  return Object.keys(SPECIALTIES_DATA).map((slug) => ({ slug }))
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
    lastReviewed: '2026-04-07',
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
      <SpecialtyArticle data={data} />
    </>
  )
}
