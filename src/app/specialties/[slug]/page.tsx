import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Calendar, Sparkles } from 'lucide-react'

// Article Database
const SPECIALTIES_DATA: Record<string, { title: string; subtitle: string; description: string; highlights: string[]; benefits: string[] }> = {
  'sports-physio': {
    title: 'Sports Physiotherapy',
    subtitle: 'Get back in the game safely and stronger than ever.',
    description: 'Sports physiotherapy is a specialized branch of physical therapy dedicated to the prevention, evaluation, treatment, and rehabilitation of sports and exercise-related injuries. Whether you are a professional athlete or a weekend warrior, our verified specialists utilize advanced biomechanical analysis and progressive loading strategies to accelerate your recovery. Common conditions treated include ACL tears, rotator cuff injuries, tennis elbow, hamstring strains, and severe ligament sprains.',
    highlights: ['Biomechanical analysis and correction', 'Customized return-to-play protocols', 'Targeted injury prevention strategies', 'Active stretching and joint mobilization'],
    benefits: ['Faster recovery from acute injuries', 'Prevention of chronic pain development', 'Enhanced athletic performance', 'Safe transition back to high-impact sports'],
  },
  'neuro-physio': {
    title: 'Neurological Physiotherapy',
    subtitle: 'Re-wiring the brain for improved mobility and independence.',
    description: 'Neurological physiotherapy involves the treatment of individuals with movement and function disorders that have originated from problems within the body\'s nervous and neuromuscular system. Our highly trained therapists focus on neuroplasticity—the brain\'s ability to adapt and form new neural connections. This therapy is deeply critical for recovery following strokes, spinal cord injuries, or managing degenerative conditions like Parkinson\'s disease and Multiple Sclerosis.',
    highlights: ['Gait (walking) retraining and optimization', 'Advanced balance and coordination exercises', 'Spasticity and muscle tone management', 'Task-specific functional training'],
    benefits: ['Regain maximum possible independence', 'Reduce risk of falls and injuries', 'Improve overall stamina and motor control', 'Slow the progression of degenerative symptoms'],
  },
  'ortho-physio': {
    title: 'Orthopedic Physiotherapy',
    subtitle: 'Expert relief for your bones, joints, ligaments, and sore muscles.',
    description: 'Orthopedic physiotherapy is the cornerstone of musculoskeletal rehabilitation. This specialty focuses entirely on diagnosing, managing, and treating disorders and injuries of the musculoskeletal system. Highly recommended for post-operative recovery (like knee or hip replacements), managing chronic arthritis, repairing fractures, and treating acute back or neck pain. Our practitioners use hands-on clinical interventions tailored to your specific anatomical trauma.',
    highlights: ['Expert manual therapy and joint mobilization', 'Post-operative rehabilitation pathways', 'Chronic pain management planning', 'Targeted core and limb strengthening programs'],
    benefits: ['Significant reduction in joint stiffness', 'Alleviation of acute and chronic pain', 'Restoration of normal structural mobility', 'Avoidance of future invasive surgeries'],
  },
  'paediatric-physio': {
    title: 'Paediatric Physiotherapy',
    subtitle: 'Gentle, engaging, and dedicated care for infants and children.',
    description: 'Children are not just small adults; they have unique biomechanical and developmental needs. Paediatric physiotherapy provides early intervention and treatment for infants, toddlers, children, and adolescents. Focusing on congenital conditions, developmental delays, cerebral palsy, torticollis, and growth-related injuries. Our specialists use heavily interactive, play-based therapy techniques to keep children engaged while they build strength and hit their gross motor milestones.',
    highlights: ['Fun, play-based therapeutic exercises', 'Gross motor milestone tracking and achievement', 'Family-centered care and parent education', 'Postural correction and growth monitoring'],
    benefits: ['Supports healthy physical development', 'Improves confidence in physical play', 'Prevents long-term postural deformities', 'Empowers parents with daily care strategies'],
  },
  'womens-health': {
    title: "Women's Health Physiotherapy",
    subtitle: 'Discreet, empowering care focused on the female anatomy.',
    description: 'Women\'s Health Physiotherapy is a highly specialized realm of physical therapy dedicated to treating conditions related directly to the female pelvis and pelvic floor. It is absolutely essential for pre-natal physical preparation, comprehensive post-partum recovery, treating diastasis recti (abdominal separation), and managing various forms of urinary incontinence or pelvic organ prolapse. Our practitioners ensure a safe, private, and highly supportive environment.',
    highlights: ['Comprehensive pelvic floor rehabilitation', 'Safe pre-natal and post-partum exercise planning', 'Diastasis recti recovery techniques', 'Bladder and bowel control reinforcement'],
    benefits: ['Painless and smoother pregnancy transitions', 'Rapid recovery of core strength post-birth', 'Elimination of embarrassing incontinence', 'Return to high-impact activities safely'],
  },
  'geriatric-physio': {
    title: 'Geriatric Physiotherapy',
    subtitle: 'Compassionate care to maintain independence and quality of life.',
    description: 'Aging brings significant changes to our bodies, often resulting in declining strength, stiff joints, and compromised balance. Geriatric physiotherapy is specifically tailored to the unique physical needs of older adults. The primary focus is on preserving functional independence, managing osteoarthritis pain without heavy medication, treating osteoporosis, and crucially: preventing falls. We ensure older adults continue to live comfortably and safely inside their own homes.',
    highlights: ['Dedicated fall prevention training', 'Osteoarthritis and joint wear management', 'Bone density and osteoporosis care', 'Gentle mobility and flexibility preservation'],
    benefits: ['Maintains independence and self-reliance', 'Significantly reduces life-threatening falls', 'Provides drug-free chronic pain relief', 'Extends the ability to live at home comfortably'],
  },
}

export function generateStaticParams() {
  return Object.keys(SPECIALTIES_DATA).map((slug) => ({
    slug,
  }))
}

export default function SpecialtyPage({ params }: { params: { slug: string } }) {
  const data = SPECIALTIES_DATA[params.slug]

  if (!data) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-bp-surface pt-32 pb-24">
      {/* Background Decor */}
      <div className="absolute left-1/2 top-0 h-[600px] max-w-full w-full -translate-x-1/2 bg-[radial-gradient(circle_at_center,rgba(18,179,160,0.08),transparent_70%)] pointer-events-none" />
      
      <div className="bp-shell relative z-10 mx-auto max-w-4xl">
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-bp-accent/10 text-bp-accent text-[12px] font-bold uppercase tracking-[0.2em] mb-6">
            Clinical Specialty
          </span>
          <h1 className="text-4xl md:text-6xl font-bold text-bp-primary tracking-tight leading-tight mb-6">
            {data.title}
          </h1>
          <p className="text-xl md:text-2xl text-bp-body/60 font-medium max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* Content Section - Glass Card */}
        <div className="bg-white/60 backdrop-blur-3xl border border-white rounded-[32px] p-8 md:p-12 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.08)] ring-1 ring-bp-primary/5">
          <div className="prose prose-lg max-w-none text-bp-body/80 leading-relaxed font-medium mb-12">
            <p className="text-[17px] md:text-[19px]">{data.description}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            {/* Core Approaches */}
            <div>
              <h3 className="text-lg font-bold text-bp-primary mb-6 flex items-center gap-2 uppercase tracking-wide text-[14px]">
                <CheckCircle2 className="text-bp-accent h-5 w-5" />
                Core Approaches
              </h3>
              <ul className="space-y-4">
                {data.highlights.map((highlight, i) => (
                  <li key={i} className="flex items-start gap-3 text-[16px] text-bp-body/70 font-medium">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-bp-accent/50 shrink-0" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>

            {/* Patient Benefits */}
            <div>
              <h3 className="text-lg font-bold text-bp-primary mb-6 flex items-center gap-2 uppercase tracking-wide text-[14px]">
                <Sparkles className="text-bp-accent h-5 w-5" />
                Patient Benefits
              </h3>
              <ul className="space-y-4">
                {data.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3 text-[16px] text-bp-body/70 font-medium">
                    <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-bp-accent/50 shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-14 pt-10 border-t border-bp-border/50 text-center">
            <h3 className="text-2xl font-bold text-bp-primary mb-6">Ready to start your recovery?</h3>
            <Link
              href={`/search?condition=${encodeURIComponent(data.title)}`}
              className="inline-flex items-center gap-3 rounded-full bg-bp-primary px-8 py-4 text-[16px] font-bold text-white transition-all hover:bg-bp-accent active:scale-[0.98] shadow-[0_8px_30px_rgba(0,0,0,0.15)] group"
            >
              <Calendar className="h-5 w-5" />
              Book a session in 60 seconds
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
