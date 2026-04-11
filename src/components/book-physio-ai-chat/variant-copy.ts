import {
  Activity,
  BookOpen,
  BrainCircuit,
  Calendar,
  ClipboardList,
  Database,
  FileText,
  HeartPulse,
  MapPin,
  Microscope,
  ShieldCheck,
  Users,
  Zap,
} from 'lucide-react'
import type { AIChatVariant, Tone, VariantCopy } from './types'

const VARIANT_COPY: Record<AIChatVariant, VariantCopy> = {
  patient: {
    eyebrow: 'Recovery Companion',
    title: 'Describe the pain. Get the next best step.',
    description:
      'Ace turns symptoms into clear triage, nearby specialist matches, and booking-ready next actions without the clutter of a generic chatbot.',
    modeLabel: 'Patient mode',
    liveNote:
      'Share what hurts, how long it has been going on, and what movements make it worse. The assistant will keep the response focused, human, and ready for booking.',
    primaryHref: '/search',
    primaryLabel: 'Find a physiotherapist',
    secondaryHref: '/patient/appointments',
    secondaryLabel: 'See my sessions',
    quickPrompts: [
      'Sharp knee pain after running',
      'Neck stiffness from desk work',
      'Post-op rehab timeline',
      'Need a home visit today',
    ],
    metrics: [
      { label: 'First response', value: '< 30 sec', caption: 'Designed for quick triage', icon: Zap, tone: 'teal' },
      { label: 'Best match', value: 'Local care', caption: 'Search-ready specialist routing', icon: MapPin, tone: 'emerald' },
      { label: 'Next step', value: 'Book now', caption: 'Clear call to action every time', icon: Calendar, tone: 'amber' },
    ],
    safetyTitle: 'What patients get',
    safetyPoints: [
      'Short, plain-language guidance that is easy to follow.',
      'Recovery-first prompts with clear escalation to a physiotherapist.',
      'A single AI identity (Ace) that stays consistent across the product.',
    ],
    railTitle: 'Example journey',
    railCards: [
      {
        label: 'Step 1',
        title: 'Describe the symptoms',
        detail: 'Pain location, duration, and what makes it worse.',
        icon: HeartPulse,
        tone: 'teal',
      },
      {
        label: 'Step 2',
        title: 'See a likely match',
        detail: 'Physio specialties, visit type, and price appear together.',
        icon: Users,
        tone: 'emerald',
        href: '/search',
        cta: 'Preview search',
      },
      {
        label: 'Step 3',
        title: 'Book the session',
        detail: 'Move from triage to booking without leaving the flow.',
        icon: ShieldCheck,
        tone: 'violet',
        href: '/patient/appointments',
        cta: 'Open sessions',
      },
    ],
    footerNote: 'Demo guidance only. Ace is designed to keep the care journey clear, calm, and easy to convert.',
    contextLabel: 'Recovery triage and booking guidance',
  },
  provider: {
    eyebrow: 'Clinical Copilot',
    title: 'Evidence-backed support for physiotherapists.',
    description:
      'Ace gives physiotherapists a structured workspace for case reasoning, concise research context, and action-ready plans with a unified product identity.',
    modeLabel: 'Provider mode',
    liveNote:
      'Add age, complaint, red flags, and clinical findings. The assistant responds in a compact, citation-aware format that is easier to use in a real practice flow.',
    primaryHref: '/provider/calendar',
    primaryLabel: 'Open practice calendar',
    secondaryHref: '/provider/appointments',
    secondaryLabel: 'Review sessions',
    quickPrompts: [
      'Return-to-run plan after ACL',
      'Differentiate radicular vs referred pain',
      'Draft a home exercise note',
      'Summarize red flags for shoulder pain',
    ],
    metrics: [
      { label: 'Scope', value: 'Physio only', caption: 'Guardrails stay narrow and useful', icon: Microscope, tone: 'teal' },
      { label: 'Evidence', value: 'Cited', caption: 'Responses can surface peer-reviewed refs', icon: BookOpen, tone: 'emerald' },
      { label: 'Output', value: 'Action-ready', caption: 'Concise plans for clinical follow-up', icon: FileText, tone: 'amber' },
    ],
    safetyTitle: 'Clinical guardrails',
    safetyPoints: [
      'Ace stays on musculoskeletal and rehabilitation topics only.',
      'The tone is calm, precise, and tailored to physiotherapy workflows.',
      'Source-aware responses make the demo feel like a real clinical workspace.',
    ],
    railTitle: 'Research and case tools',
    railCards: [
      {
        label: 'Research',
        title: 'Citation-aware reasoning',
        detail: 'Structured answers can surface [C1] style evidence anchors.',
        icon: BrainCircuit,
        tone: 'violet',
      },
      {
        label: 'Case file',
        title: 'Reusable documentation',
        detail: 'Turn the conversation into a note, plan, or follow-up checklist.',
        icon: ClipboardList,
        tone: 'teal',
        href: '/provider/messages',
        cta: 'Open messages',
      },
      {
        label: 'Library',
        title: 'Source-backed briefings',
        detail: 'Keep the model focused on the best evidence for each case.',
        icon: Database,
        tone: 'slate',
        href: '/provider/earnings',
        cta: 'Practice view',
      },
    ],
    footerNote: 'Built to look and feel like a premium clinical copilot, not a generic chat widget.',
    contextLabel: 'Clinical decision support and research briefings',
  },
  pai: {
    eyebrow: 'Physiotherapy AI',
    title: 'Your clinical knowledge companion for physio, rehab, and recovery.',
    description:
      'PAI is a physiopedia-style knowledge engine built for India — condition explainers, rehab protocols, red flag checks, and patient education, all backed by current evidence.',
    modeLabel: 'PAI mode',
    liveNote:
      'Ask about any musculoskeletal condition, rehabilitation protocol, or red flag symptom. PAI responds with structured, evidence-cited guidance tailored for the Indian clinical context.',
    primaryHref: '/search',
    primaryLabel: 'Find a physiotherapist',
    secondaryHref: '/patient/motio',
    secondaryLabel: 'Talk to Ace AI',
    quickPrompts: [
      'What is frozen shoulder?',
      'Rehab exercises after ACL surgery',
      'Red flags for lower back pain',
      'Post-op physio for knee replacement',
    ],
    metrics: [
      { label: 'Evidence base', value: 'CPG cited', caption: 'Cochrane, JOSPT, BJSM references', icon: BookOpen, tone: 'teal' as Tone },
      { label: 'Conditions', value: '100+ covered', caption: 'MSK, neurological, sports, post-op', icon: Activity, tone: 'emerald' as Tone },
      { label: 'Context', value: 'India-first', caption: 'IAP guidelines, Indian clinical context', icon: MapPin, tone: 'amber' as Tone },
    ],
    safetyTitle: 'Clinical guardrails',
    safetyPoints: [
      'PAI explains, not diagnoses — always uses "may suggest" language for patient safety.',
      'Red flag symptoms are flagged clearly with urgent referral guidance.',
      "PAI complements, never replaces, your physiotherapist's clinical judgment.",
    ],
    railTitle: 'What PAI covers',
    railCards: [
      {
        label: 'Conditions',
        title: 'Structured condition explainers',
        detail: 'Anatomy, mechanism, stages, and prognosis in clear language.',
        icon: BrainCircuit,
        tone: 'violet' as Tone,
        href: '/patient/motio',
        cta: 'Try Ace for triage',
      },
      {
        label: 'Rehab',
        title: 'Exercise protocols with sets/reps',
        detail: 'Evidence-based rehab plans with progression cues and frequency.',
        icon: ClipboardList,
        tone: 'teal' as Tone,
        href: '/search',
        cta: 'Find a physio',
      },
      {
        label: 'Safety',
        title: 'Red flag identification',
        detail: 'PAI identifies warning symptoms that require urgent medical care.',
        icon: ShieldCheck,
        tone: 'amber' as Tone,
      },
    ],
    footerNote: 'PAI is an educational tool. Always consult a qualified physiotherapist for diagnosis and treatment.',
    contextLabel: 'Clinical knowledge, rehab protocols, and patient education',
  },
}

export function getVariantCopy(variant: AIChatVariant): VariantCopy {
  return VARIANT_COPY[variant]
}
