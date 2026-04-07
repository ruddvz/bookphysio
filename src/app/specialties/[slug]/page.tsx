import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import SpecialtyArticle, { type SpecialtyArticleData } from '@/components/specialties/SpecialtyArticle'
import { buildSpecialtyArticleMetadata } from '@/components/specialties/articleMetadata'

const SPECIALTIES_DATA: Record<string, SpecialtyArticleData> = {
  'sports-physio': {
    title: 'Sports Physiotherapy',
    subtitle: 'Get back in the game safely and stronger than ever.',
    description:
      'Sports physiotherapy is a specialized branch of physical therapy dedicated to the prevention, evaluation, treatment, and rehabilitation of sports and exercise-related injuries. Whether you are a professional athlete or a weekend warrior, our verified specialists utilize advanced biomechanical analysis and progressive loading strategies to accelerate your recovery. Common conditions treated include ACL tears, rotator cuff injuries, tennis elbow, hamstring strains, and severe ligament sprains.',
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
      "Neurological physiotherapy involves the treatment of individuals with movement and function disorders that have originated from problems within the body's nervous and neuromuscular system. Our highly trained therapists focus on neuroplasticity—the brain's ability to adapt and form new neural connections. This therapy is deeply critical for recovery following strokes, spinal cord injuries, or managing degenerative conditions like Parkinson's disease and Multiple Sclerosis.",
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
      'Orthopedic physiotherapy is the cornerstone of musculoskeletal rehabilitation. This specialty focuses entirely on diagnosing, managing, and treating disorders and injuries of the musculoskeletal system. Highly recommended for post-operative recovery (like knee or hip replacements), managing chronic arthritis, repairing fractures, and treating acute back or neck pain. Our practitioners use hands-on clinical interventions tailored to your specific anatomical trauma.',
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
      'Children are not just small adults; they have unique biomechanical and developmental needs. Paediatric physiotherapy provides early intervention and treatment for infants, toddlers, children, and adolescents. Focusing on congenital conditions, developmental delays, cerebral palsy, torticollis, and growth-related injuries. Our specialists use heavily interactive, play-based therapy techniques to keep children engaged while they build strength and hit their gross motor milestones.',
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
    subtitle: 'Discreet, empowering care focused on the female anatomy.',
    description:
      "Women's Health Physiotherapy is a highly specialized realm of physical therapy dedicated to treating conditions related directly to the female pelvis and pelvic floor. It is absolutely essential for pre-natal physical preparation, comprehensive post-partum recovery, treating diastasis recti (abdominal separation), and managing various forms of urinary incontinence or pelvic organ prolapse. Our practitioners ensure a safe, private, and highly supportive environment.",
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
      'Aging brings significant changes to our bodies, often resulting in declining strength, stiff joints, and compromised balance. Geriatric physiotherapy is specifically tailored to the unique physical needs of older adults. The primary focus is on preserving functional independence, managing osteoarthritis pain without heavy medication, treating osteoporosis, and crucially: preventing falls. We ensure older adults continue to live comfortably and safely inside their own homes.',
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
  return <SpecialtyArticle data={data} />
}
