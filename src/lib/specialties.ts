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

export interface SpecialtyCondition {
  name: string
  slug: string
  description: string
}

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
  /** Searchable conditions treated — each links to /search?condition={slug} */
  conditions: SpecialtyCondition[]
  /** Common presenting symptoms in patient-friendly language */
  symptoms: string[]
  /** Treatment approaches used by specialists */
  treatments: string[]
  /** Equipment and modality tags */
  modalities: string[]
  /** Professional certifications relevant to this specialty */
  certifications: string[]
  /** SEO page title */
  seoTitle: string
  /** SEO meta description */
  seoDescription: string
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
    conditions: [
      { name: 'Back Pain', slug: 'back-pain', description: 'Acute and chronic pain in the lower or upper back, including disc problems and muscle strain.' },
      { name: 'Knee Osteoarthritis', slug: 'knee-osteoarthritis', description: 'Wear-and-tear degeneration of knee cartilage causing pain, stiffness, and reduced mobility.' },
      { name: 'Frozen Shoulder', slug: 'frozen-shoulder', description: 'Adhesive capsulitis causing progressive shoulder stiffness and pain with limited range of motion.' },
      { name: 'Sciatica', slug: 'sciatica', description: 'Pain radiating from the lower back through the hip and down the leg along the sciatic nerve.' },
      { name: 'Neck Pain', slug: 'neck-pain', description: 'Cervical spine pain from muscle tension, disc issues, or nerve compression.' },
      { name: 'Spondylosis', slug: 'spondylosis', description: 'Age-related degeneration of the vertebral discs and joints causing stiffness and pain.' },
    ],
    symptoms: [
      'Persistent joint or muscle pain',
      'Stiffness after rest or on waking',
      'Swelling around joints',
      'Reduced range of movement',
      'Pain that worsens with activity',
      'Numbness or tingling in limbs',
    ],
    treatments: [
      'Manual therapy and joint mobilisation',
      'Exercise-based rehabilitation',
      'Post-operative recovery programmes',
      'Dry needling and myofascial release',
      'Postural correction and ergonomic advice',
      'Pain management education',
    ],
    modalities: ['TENS', 'Ultrasound therapy', 'IFT', 'Traction', 'SWD', 'Hot/Cold packs'],
    certifications: ['Mulligan Concept', 'McKenzie Method', 'Maitland Approach', 'Dry Needling'],
    seoTitle: 'Orthopaedic Physiotherapy in India | Bones, Joints & Muscles | BookPhysio',
    seoDescription: 'Find verified orthopaedic physiotherapists near you. Expert care for back pain, knee osteoarthritis, frozen shoulder, sciatica, and all musculoskeletal conditions.',
  },
  {
    slug: 'neurological',
    label: 'Neurological',
    subLabel: 'Nerves & Brain',
    tagline: 'Stroke recovery, nerve rehabilitation, and neurological movement disorders.',
    icon: 'Brain',
    image: '/specialties/neurological.png',
    tint: { text: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100', hoverBorder: 'hover:border-indigo-200' },
    conditions: [
      { name: 'Stroke', slug: 'stroke', description: 'Recovery of movement, strength, and coordination following a cerebrovascular accident.' },
      { name: "Parkinson's Disease", slug: 'parkinsons-disease', description: 'Progressive neurological condition affecting movement, balance, and gait.' },
      { name: 'Multiple Sclerosis', slug: 'multiple-sclerosis', description: 'Autoimmune condition causing episodes of neurological symptoms and progressive disability.' },
      { name: 'Spinal Cord Injury', slug: 'spinal-cord-injury', description: 'Rehabilitation of motor and sensory function following traumatic or non-traumatic spinal injury.' },
      { name: 'Cerebral Palsy', slug: 'cerebral-palsy', description: 'Lifelong movement disorder caused by brain injury during early development.' },
      { name: 'Traumatic Brain Injury', slug: 'traumatic-brain-injury', description: 'Rehabilitation of physical and cognitive function following head trauma.' },
    ],
    symptoms: [
      'Weakness or paralysis on one side of the body',
      'Poor balance and coordination',
      'Difficulty walking or gait abnormalities',
      'Muscle spasticity or rigidity',
      'Tremors or involuntary movements',
      'Slurred speech or swallowing difficulties',
    ],
    treatments: [
      'Gait retraining and walking rehabilitation',
      'Neuroplasticity-based task-specific training',
      'Spasticity and tone management',
      'Balance and coordination exercises',
      'Functional electrical stimulation',
      'Constraint-induced movement therapy',
    ],
    modalities: ['FES (Functional Electrical Stimulation)', 'TENS', 'Tilt table', 'Parallel bars', 'Treadmill training'],
    certifications: ['NDT / Bobath Concept', 'PNF (Proprioceptive Neuromuscular Facilitation)', 'CIMT', 'Lee Silverman Voice Treatment'],
    seoTitle: 'Neurological Physiotherapy in India | Stroke, Parkinson\'s & Brain Rehab | BookPhysio',
    seoDescription: 'Book specialist neurological physiotherapists for stroke recovery, Parkinson\'s disease, multiple sclerosis, spinal cord injury, and traumatic brain injury rehabilitation.',
  },
  {
    slug: 'sports',
    label: 'Sports',
    subLabel: 'Athletic Injuries',
    tagline: 'Injury prevention, athletic rehabilitation, and return-to-play programmes.',
    icon: 'Dumbbell',
    image: '/specialties/sports.png',
    tint: { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100', hoverBorder: 'hover:border-green-200' },
    conditions: [
      { name: 'ACL Tear', slug: 'acl-tear', description: 'Anterior cruciate ligament rupture requiring progressive rehabilitation for return to sport.' },
      { name: 'Rotator Cuff Injury', slug: 'rotator-cuff-injury', description: 'Tears or tendinopathy of the shoulder rotator cuff muscles causing pain and weakness.' },
      { name: 'Tennis Elbow', slug: 'tennis-elbow', description: 'Lateral epicondylitis causing outer elbow pain from repetitive wrist and arm movements.' },
      { name: 'Ankle Sprain', slug: 'ankle-sprain', description: 'Ligament injury from ankle rolling, requiring stability and proprioception rehabilitation.' },
      { name: 'Stress Fracture', slug: 'stress-fracture', description: 'Overuse bone injury common in runners and athletes, requiring load management.' },
      { name: 'Hamstring Strain', slug: 'hamstring-strain', description: 'Muscle tear at the back of the thigh common in sprinting and kicking sports.' },
    ],
    symptoms: [
      'Acute pain at time of injury',
      'Swelling and bruising around the joint',
      'Instability or giving way',
      'Reduced strength and power',
      'Pain with sport-specific movements',
      'Stiffness after activity',
    ],
    treatments: [
      'Biomechanical analysis and movement correction',
      'Progressive strength and conditioning',
      'Return-to-play protocols',
      'Sports massage and soft tissue therapy',
      'Injury prevention programmes',
      'Taping and bracing support',
    ],
    modalities: ['TENS', 'Ultrasound therapy', 'LASER therapy', 'Cryotherapy', 'Kinesio taping', 'Shockwave therapy'],
    certifications: ['Sports Physiotherapy certification (IAP)', 'Kinesio Taping', 'Dry Needling', 'Pilates for sports rehab'],
    seoTitle: 'Sports Physiotherapy in India | ACL, Rotator Cuff & Athletic Rehab | BookPhysio',
    seoDescription: 'Specialist sports physiotherapists for ACL tears, rotator cuff injuries, tennis elbow, ankle sprains, and return-to-play rehabilitation across India.',
  },
  {
    slug: 'paediatric',
    label: 'Paediatric',
    subLabel: 'Children',
    tagline: 'Developmental support, motor milestones, and early intervention for children.',
    icon: 'Baby',
    image: '/specialties/paediatric.png',
    tint: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-100', hoverBorder: 'hover:border-sky-200' },
    conditions: [
      { name: 'Cerebral Palsy', slug: 'cerebral-palsy', description: 'Movement and posture disorder from early brain injury requiring lifelong therapy support.' },
      { name: 'Developmental Delay', slug: 'developmental-delay', description: 'Delayed motor milestones in infants and toddlers needing early intervention.' },
      { name: 'Muscular Dystrophy', slug: 'muscular-dystrophy', description: 'Progressive muscle weakness managed with physiotherapy to maintain function.' },
      { name: 'Torticollis', slug: 'torticollis', description: 'Infant neck muscle tightness causing head tilt and restricted rotation.' },
      { name: 'Scoliosis in Children', slug: 'scoliosis-children', description: 'Abnormal spinal curvature in growing children managed with exercises and monitoring.' },
      { name: 'ADHD & Coordination Difficulties', slug: 'adhd-coordination', description: 'Motor coordination and sensory processing challenges in children with ADHD.' },
    ],
    symptoms: [
      'Missing motor milestones (rolling, sitting, walking)',
      'Muscle stiffness or floppiness',
      'Head tilt or asymmetrical movement',
      'Difficulty with balance and coordination',
      'Poor core strength and posture',
      'Reluctance to use one side of the body',
    ],
    treatments: [
      'Play-based therapeutic exercises',
      'Neurodevelopmental treatment (NDT)',
      'Sensory integration therapy',
      'Gross motor milestone training',
      'Hydrotherapy for children',
      'Parent-guided home exercise programmes',
    ],
    modalities: ['TENS (paediatric settings)', 'Hydrotherapy', 'Balance boards', 'Sensory play equipment'],
    certifications: ['NDT / Bobath for Children', 'Sensory Integration', 'Paediatric Physiotherapy (IAP)'],
    seoTitle: 'Paediatric Physiotherapy in India | Child Development & Early Intervention | BookPhysio',
    seoDescription: 'Find paediatric physiotherapists for children with cerebral palsy, developmental delay, torticollis, muscular dystrophy, and motor milestone concerns across India.',
  },
  {
    slug: 'cardiopulmonary',
    label: 'Cardiopulmonary',
    subLabel: 'Heart & Lungs',
    tagline: 'Heart and lung rehabilitation, ICU recovery, and breathing retraining.',
    icon: 'HeartPulse',
    image: '/specialties/cardiopulmonary.png',
    tint: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100', hoverBorder: 'hover:border-red-200' },
    conditions: [
      { name: 'COPD', slug: 'copd', description: 'Chronic obstructive pulmonary disease managed with pulmonary rehabilitation and breathing exercises.' },
      { name: 'Asthma', slug: 'asthma', description: 'Breathing retraining and exercise tolerance improvement for asthma management.' },
      { name: 'Post-COVID Recovery', slug: 'post-covid-recovery', description: 'Breathlessness, fatigue, and deconditioning after COVID-19 illness.' },
      { name: 'Post-CABG Rehabilitation', slug: 'post-cabg-rehab', description: 'Cardiac rehabilitation after coronary artery bypass graft surgery.' },
      { name: 'Bronchiectasis', slug: 'bronchiectasis', description: 'Airway clearance and breathing management for chronic bronchiectasis.' },
      { name: 'ICU Recovery', slug: 'icu-recovery', description: 'Rebuilding strength and breathing function after prolonged critical illness and ventilation.' },
    ],
    symptoms: [
      'Breathlessness on exertion or at rest',
      'Chronic productive cough',
      'Chest tightness',
      'Reduced exercise tolerance',
      'Persistent fatigue',
      'Inability to clear secretions from the chest',
    ],
    treatments: [
      'Pulmonary rehabilitation programmes',
      'Airway clearance techniques',
      'Graded exercise therapy',
      'Breathing retraining (diaphragmatic, pursed-lip)',
      'ICU and ventilator weaning support',
      'Energy conservation strategies',
    ],
    modalities: ['Incentive spirometry', 'PEP (positive expiratory pressure) devices', 'Acapella', 'Flutter device', 'Pulse oximetry monitoring'],
    certifications: ['Cardiopulmonary Physiotherapy (IAP)', 'Pulmonary Rehabilitation', 'ACPRC (Association of Chartered Physiotherapists in Respiratory Care)'],
    seoTitle: 'Cardiopulmonary Physiotherapy in India | COPD, Post-COVID & Heart Rehab | BookPhysio',
    seoDescription: 'Specialist cardiopulmonary physiotherapists for COPD, asthma, post-COVID recovery, cardiac rehabilitation, and breathing retraining across India.',
  },
  {
    slug: 'geriatric',
    label: 'Geriatric',
    subLabel: 'Elderly Care',
    tagline: 'Fall prevention, mobility preservation, and independence for older adults.',
    icon: 'PersonStanding',
    image: '/specialties/geriatric.png',
    tint: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', hoverBorder: 'hover:border-amber-200' },
    conditions: [
      { name: 'Osteoporosis', slug: 'osteoporosis', description: 'Reduced bone density increasing fracture risk, managed with weight-bearing exercise and fall prevention.' },
      { name: 'Balance Disorders', slug: 'balance-disorders', description: 'Age-related decline in balance and proprioception leading to instability.' },
      { name: 'Fall Prevention', slug: 'fall-prevention', description: 'Targeted programmes to reduce fall risk in older adults through strength and balance training.' },
      { name: 'Hip Fracture Rehabilitation', slug: 'hip-fracture-rehab', description: 'Recovery of mobility and function after hip fracture and surgical repair.' },
      { name: 'Age-Related Deconditioning', slug: 'age-related-deconditioning', description: 'Generalised weakness and loss of function from reduced activity and prolonged bed rest.' },
      { name: 'Knee and Hip Arthritis', slug: 'knee-hip-arthritis', description: 'Managing joint pain and stiffness from osteoarthritis in older adults.' },
    ],
    symptoms: [
      'Difficulty walking or getting up from a chair',
      'Fear of falling',
      'Shuffling gait',
      'Reduced grip strength',
      'Persistent joint pain and stiffness',
      'Breathlessness with mild exertion',
    ],
    treatments: [
      'Fall prevention and balance retraining',
      'Progressive resistance and strength training',
      'Home environment safety assessment',
      'Gait and walking aid assessment',
      'Pain management and joint care',
      'Carer and family education',
    ],
    modalities: ['TENS', 'IFT', 'Ultrasound therapy', 'Hot/Cold packs', 'Parallel bars', 'Balance boards'],
    certifications: ['Geriatric Physiotherapy (IAP)', 'Falls Prevention Specialist'],
    seoTitle: 'Geriatric Physiotherapy in India | Fall Prevention & Elderly Mobility | BookPhysio',
    seoDescription: 'Find geriatric physiotherapists specialising in fall prevention, osteoporosis, balance disorders, and mobility preservation for older adults across India.',
  },
  {
    slug: 'obstetrics',
    label: 'Obstetrics',
    subLabel: 'Pregnancy Care',
    tagline: 'Prenatal and postnatal physiotherapy for a safe, comfortable pregnancy journey.',
    icon: 'Baby',
    image: '/specialties/obstetrics.png',
    tint: { text: 'text-pink-700', bg: 'bg-pink-50', border: 'border-pink-100', hoverBorder: 'hover:border-pink-200' },
    conditions: [
      { name: 'Pelvic Girdle Pain', slug: 'pelvic-girdle-pain', description: 'Pain in the pelvic joints during pregnancy, often affecting the pubic symphysis or sacroiliac joints.' },
      { name: 'Low Back Pain in Pregnancy', slug: 'low-back-pain-pregnancy', description: 'Lumbar and sacral pain caused by postural changes and hormonal loosening of ligaments during pregnancy.' },
      { name: 'Diastasis Recti', slug: 'diastasis-recti', description: 'Separation of the abdominal muscles during or after pregnancy affecting core strength.' },
      { name: 'Postnatal Core Weakness', slug: 'postnatal-core-weakness', description: 'Weakness of the deep core and pelvic floor muscles following childbirth.' },
      { name: 'Symphysis Pubis Dysfunction', slug: 'symphysis-pubis-dysfunction', description: 'Painful instability of the pubic symphysis joint during pregnancy.' },
      { name: 'Prenatal Swelling', slug: 'prenatal-swelling', description: 'Oedema in the legs and feet during pregnancy managed with gentle exercise and positioning.' },
    ],
    symptoms: [
      'Pelvic or hip pain when walking or turning over in bed',
      'Lower back ache that worsens through the day',
      'Difficulty climbing stairs or standing on one leg',
      'Abdominal bulging or doming when getting up',
      'Leaking urine when coughing or sneezing',
      'Wrist pain or tingling (carpal tunnel)',
    ],
    treatments: [
      'Safe prenatal exercise programming by trimester',
      'Pelvic floor muscle training',
      'Core stability and back pain management',
      'Labour preparation and breathing techniques',
      'Postnatal rehabilitation and return to exercise',
      'Diastasis recti recovery programme',
    ],
    modalities: ['Support belts and bracing', 'TENS (safe in labour)', 'Hydrotherapy', 'Kinesio taping'],
    certifications: ['Obstetric Physiotherapy (IAP)', 'POGP (Pelvic Obstetric & Gynaecological Physiotherapy)'],
    seoTitle: 'Obstetric Physiotherapy in India | Prenatal & Postnatal Physio | BookPhysio',
    seoDescription: 'Book obstetric physiotherapists for pelvic girdle pain, back pain in pregnancy, diastasis recti, postnatal recovery, and prenatal exercise across India.',
  },
  {
    slug: 'gynaecology',
    label: 'Gynaecology',
    subLabel: "Women's Health",
    tagline: 'Pelvic floor rehabilitation, incontinence management, and core strength.',
    icon: 'Flower2',
    image: '/specialties/gynaecology.png',
    tint: { text: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', hoverBorder: 'hover:border-rose-200' },
    conditions: [
      { name: 'Urinary Incontinence', slug: 'urinary-incontinence', description: 'Involuntary leakage of urine with activity (stress) or urgency, managed with pelvic floor rehabilitation.' },
      { name: 'Pelvic Organ Prolapse', slug: 'pelvic-organ-prolapse', description: 'Descent of pelvic organs due to weakened pelvic floor support structures.' },
      { name: 'Chronic Pelvic Pain', slug: 'chronic-pelvic-pain', description: 'Persistent pain in the lower abdomen or pelvis lasting more than 6 months.' },
      { name: 'Painful Intercourse (Dyspareunia)', slug: 'dyspareunia', description: 'Pain during or after sexual intercourse related to pelvic floor muscle dysfunction.' },
      { name: 'Vaginismus', slug: 'vaginismus', description: 'Involuntary contraction of vaginal muscles making penetration painful or impossible.' },
      { name: 'Faecal Incontinence', slug: 'faecal-incontinence', description: 'Loss of bowel control managed with pelvic floor strengthening and biofeedback.' },
    ],
    symptoms: [
      'Leaking urine when coughing, sneezing, or exercising',
      'Sudden urgent need to urinate',
      'Feeling of heaviness or bulging in the vagina',
      'Chronic lower abdominal or pelvic pain',
      'Pain with sexual activity',
      'Difficulty emptying the bladder or bowel fully',
    ],
    treatments: [
      'Pelvic floor muscle assessment and rehabilitation',
      'Bladder retraining programme',
      'Manual therapy for pelvic pain',
      'Biofeedback-assisted pelvic floor training',
      'Education on bladder and bowel habits',
      'Prolapse management exercises',
    ],
    modalities: ['Biofeedback', 'Electrical muscle stimulation (EMS)', 'TENS', 'Real-time ultrasound imaging'],
    certifications: ['POGP (Pelvic Obstetric & Gynaecological Physiotherapy)', 'Pelvic Floor Physiotherapy (IAP)', 'Biofeedback certification'],
    seoTitle: 'Gynaecological Physiotherapy in India | Pelvic Floor & Incontinence | BookPhysio',
    seoDescription: 'Find women\'s health physiotherapists for urinary incontinence, pelvic organ prolapse, chronic pelvic pain, dyspareunia, and vaginismus across India.',
  },
  {
    slug: 'oncology',
    label: 'Oncology',
    subLabel: 'Cancer Rehab',
    tagline: 'Specialised rehabilitation during and after cancer treatment.',
    icon: 'Ribbon',
    image: '/specialties/oncology.png',
    tint: { text: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100', hoverBorder: 'hover:border-violet-200' },
    conditions: [
      { name: 'Lymphoedema', slug: 'lymphoedema', description: 'Chronic swelling from lymphatic system damage following cancer treatment or lymph node removal.' },
      { name: 'Cancer-Related Fatigue', slug: 'cancer-related-fatigue', description: 'Persistent exhaustion during or after cancer treatment, unrelieved by rest.' },
      { name: 'Post-Mastectomy Rehabilitation', slug: 'post-mastectomy-rehab', description: 'Restoring shoulder mobility and strength after breast cancer surgery.' },
      { name: 'Peripheral Neuropathy', slug: 'peripheral-neuropathy', description: 'Nerve damage from chemotherapy causing numbness, tingling, and balance problems.' },
      { name: 'Bone and Joint Changes', slug: 'bone-joint-changes-cancer', description: 'Stiffness and pain from hormonal therapies, radiotherapy, or corticosteroid use.' },
      { name: 'Deconditioning after Treatment', slug: 'cancer-deconditioning', description: 'Loss of strength and fitness from reduced activity during prolonged cancer treatment.' },
    ],
    symptoms: [
      'Persistent tiredness not relieved by sleep',
      'Swelling in an arm or leg',
      'Restricted shoulder movement after surgery',
      'Numbness or tingling in hands and feet',
      'Joint stiffness and pain',
      'Breathlessness with light activity',
    ],
    treatments: [
      'Graded exercise therapy for fatigue',
      'Complete Decongestive Therapy (CDT) for lymphoedema',
      'Post-surgical mobility and scar management',
      'Balance and coordination rehabilitation',
      'Breathing exercises for lung involvement',
      'Gentle strengthening and activity pacing',
    ],
    modalities: ['Compression garments and bandaging', 'Manual lymphatic drainage', 'TENS', 'LASER therapy', 'Kinesio taping'],
    certifications: ['CLT (Certified Lymphoedema Therapist)', 'Oncology Physiotherapy (IAP)', 'CDT certification'],
    seoTitle: 'Oncology Physiotherapy in India | Cancer Rehab & Lymphoedema | BookPhysio',
    seoDescription: 'Book oncology physiotherapists for lymphoedema, cancer-related fatigue, post-mastectomy rehab, and rehabilitation during and after cancer treatment across India.',
  },
  {
    slug: 'community',
    label: 'Community',
    subLabel: 'Public Health',
    tagline: 'Community-based rehabilitation, disability management, and inclusive care.',
    icon: 'Users',
    image: '/specialties/community.png',
    tint: { text: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-100', hoverBorder: 'hover:border-teal-200' },
    conditions: [
      { name: 'Post-Stroke Community Reintegration', slug: 'post-stroke-community', description: 'Ongoing rehabilitation to restore participation in daily life after stroke.' },
      { name: 'Disability Management', slug: 'disability-management', description: 'Long-term rehabilitation and adaptive strategies for people with physical disabilities.' },
      { name: 'Geriatric Falls at Home', slug: 'geriatric-falls-home', description: 'Home-based fall prevention for older adults unable to access clinic services.' },
      { name: 'Chronic Musculoskeletal Conditions', slug: 'chronic-musculoskeletal', description: 'Management of long-term pain and disability from arthritis and chronic back conditions.' },
      { name: 'Post-Hospitalisation Recovery', slug: 'post-hospitalisation-recovery', description: 'Rebuilding strength and function at home after a hospital admission.' },
      { name: 'Developmental Disabilities', slug: 'developmental-disabilities', description: 'Community-based therapy for adults and children with learning or developmental disabilities.' },
    ],
    symptoms: [
      'Difficulty with daily activities (dressing, bathing, cooking)',
      'Unable to travel to a clinic for treatment',
      'Reduced mobility after hospitalisation',
      'Social isolation due to physical limitations',
      'Carer stress and lack of support',
      'Chronic pain affecting community participation',
    ],
    treatments: [
      'Home-based physiotherapy visits',
      'Group rehabilitation programmes',
      'Carer training and education',
      'Adaptive equipment prescription',
      'Disability management strategies',
      'Community reintegration planning',
    ],
    modalities: ['Portable TENS', 'Walking aids and adaptive equipment', 'Home exercise programmes'],
    certifications: ['Community Rehabilitation (IAP)', 'Disability Management Specialist'],
    seoTitle: 'Community Physiotherapy in India | Home Visits & Disability Rehab | BookPhysio',
    seoDescription: 'Book community physiotherapists for home visits, disability management, post-stroke rehabilitation, and accessible care for patients who cannot attend a clinic.',
  },
  {
    slug: 'industrial',
    label: 'Industrial',
    subLabel: 'Workplace/Ergonomics',
    tagline: 'Work-related injury prevention, ergonomic assessment, and occupational rehab.',
    icon: 'Briefcase',
    image: '/specialties/industrial.png',
    tint: { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', hoverBorder: 'hover:border-orange-200' },
    conditions: [
      { name: 'Carpal Tunnel Syndrome', slug: 'carpal-tunnel', description: 'Nerve compression at the wrist causing hand numbness, tingling, and weakness.' },
      { name: 'Repetitive Strain Injury (RSI)', slug: 'repetitive-strain-injury', description: 'Overuse injury to muscles, tendons, and nerves from repetitive work movements.' },
      { name: 'Work-Related Back Pain', slug: 'work-related-back-pain', description: 'Lumbar pain from prolonged sitting, manual handling, or awkward postures at work.' },
      { name: 'Shoulder Overuse Injuries', slug: 'shoulder-overuse', description: 'Rotator cuff tendinopathy and impingement from repetitive overhead tasks.' },
      { name: 'Neck Pain from Screen Work', slug: 'neck-pain-screen-work', description: 'Cervical pain and tension headaches from poor posture at computer workstations.' },
      { name: 'Manual Handling Injuries', slug: 'manual-handling-injuries', description: 'Acute or cumulative injuries from lifting, carrying, and physical work tasks.' },
    ],
    symptoms: [
      'Wrist or hand numbness, especially at night',
      'Aching forearms or shoulders after work',
      'Low back stiffness after sitting all day',
      'Neck pain and tension headaches',
      'Reduced grip strength',
      'Pain that improves on weekends and worsens at work',
    ],
    treatments: [
      'Ergonomic workstation assessment and correction',
      'Return-to-work rehabilitation planning',
      'Manual handling training',
      'Work-hardening and conditioning programmes',
      'Soft tissue therapy and joint mobilisation',
      'Injury prevention education for teams',
    ],
    modalities: ['TENS', 'Ultrasound therapy', 'IFT', 'Splinting and bracing', 'Hot/Cold packs'],
    certifications: ['Occupational Health Physiotherapy (IAP)', 'Ergonomic Assessment', 'Manual Handling Trainer'],
    seoTitle: 'Industrial & Occupational Physiotherapy in India | Ergonomics & RSI | BookPhysio',
    seoDescription: 'Book industrial physiotherapists for ergonomic assessments, RSI treatment, carpal tunnel, work-related back and neck pain, and return-to-work rehabilitation.',
  },
  {
    slug: 'vestibular',
    label: 'Vestibular',
    subLabel: 'Balance/Vertigo',
    tagline: 'Vertigo, dizziness, and balance disorder rehabilitation.',
    icon: 'Ear',
    image: '/specialties/vestibular.png',
    tint: { text: 'text-cyan-700', bg: 'bg-cyan-50', border: 'border-cyan-100', hoverBorder: 'hover:border-cyan-200' },
    conditions: [
      { name: 'BPPV', slug: 'bppv', description: 'Benign paroxysmal positional vertigo — brief spinning caused by displaced inner ear crystals.' },
      { name: "Ménière's Disease", slug: 'menieres-disease', description: 'Inner ear disorder causing recurrent vertigo, hearing loss, and tinnitus.' },
      { name: 'Vestibular Neuritis', slug: 'vestibular-neuritis', description: 'Viral inflammation of the vestibular nerve causing prolonged dizziness and imbalance.' },
      { name: 'Chronic Dizziness', slug: 'chronic-dizziness', description: 'Persistent dizziness and unsteadiness with no acute cause, often requiring vestibular rehabilitation.' },
      { name: 'Post-Concussion Balance Problems', slug: 'post-concussion-balance', description: 'Dizziness and balance dysfunction following a concussion or head injury.' },
      { name: 'Labyrinthitis', slug: 'labyrinthitis', description: 'Inner ear infection causing vertigo, dizziness, and temporary hearing loss.' },
    ],
    symptoms: [
      'Spinning sensation (vertigo) triggered by head movement',
      'Persistent dizziness or lightheadedness',
      'Unsteadiness and loss of balance',
      'Nausea and vomiting with movement',
      'Difficulty focusing the eyes',
      'Tendency to veer or fall to one side',
    ],
    treatments: [
      'Canalith repositioning (Epley manoeuvre for BPPV)',
      'Vestibular rehabilitation therapy (VRT)',
      'Gaze stabilisation exercises',
      'Balance retraining and fall prevention',
      'Habituation exercises for chronic dizziness',
      'Gradual return to activity and movement tolerance',
    ],
    modalities: ['Infrared/video goggles (VNG assessment)', 'Dynamic posturography platforms', 'Balance boards and foam pads'],
    certifications: ['Vestibular Rehabilitation (IAP)', 'BPPV Management', 'Vestibular Physiotherapy (advanced)'],
    seoTitle: 'Vestibular Physiotherapy in India | Vertigo, BPPV & Dizziness | BookPhysio',
    seoDescription: 'Book vestibular physiotherapists for BPPV, Ménière\'s disease, vestibular neuritis, chronic dizziness, and post-concussion balance rehabilitation across India.',
  },
] as const
