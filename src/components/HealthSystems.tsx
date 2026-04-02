import Link from 'next/link'
import { BadgeCheck, Clock3, Home, MapPin, ReceiptText, ShieldCheck, Sparkles } from 'lucide-react'

const features = [
  {
    icon: BadgeCheck,
    title: 'Verified clinicians',
    description: 'Every profile surfaces registration, experience, and patient feedback before it hits search.',
  },
  {
    icon: Home,
    title: 'Home visits included',
    description: 'Book care where the patient needs it, without separating in-clinic and at-home flows.',
  },
  {
    icon: Clock3,
    title: 'Same-day slots',
    description: 'Availability appears in-line so the choice feels immediate, not buried in a calendar.',
  },
  {
    icon: ReceiptText,
    title: 'Transparent pricing',
    description: 'Fees, GST, and payment type stay visible up front so the booking flow stays trust-first.',
  },
]

function FeatureCard({ icon: Icon, title, description }: (typeof features)[number]) {
  return (
    <div className="bp-card-soft p-5 transition-all duration-300 hover:-translate-y-1 hover:border-bp-accent/20 hover:bg-white">
      <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-bp-surface text-bp-accent">
        <Icon size={20} />
      </div>
      <h3 className="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-bp-primary">{title}</h3>
      <p className="mt-2 text-[14px] leading-6 text-bp-body/80">{description}</p>
    </div>
  )
}

export default function HealthSystems() {
  return (
    <section className="bp-section bg-bp-surface/30" aria-label="Patient trust signals">
      <div className="bp-shell">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="max-w-xl">
            <div className="bp-kicker mb-5">
              <Sparkles size={13} />
              Built for trust
            </div>
            <h2 className="bp-title">Everything a patient should see before booking.</h2>
            <p className="bp-copy mt-4">
              Every detail patients need to feel confident - credentials, visit format, fees, and availability - shown upfront.
            </p>

            <div className="mt-8 space-y-3">
              {['ICP verified providers', 'In-clinic + home visit modes', 'Transparent INR pricing', 'Mobile-first booking flow'].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-[20px] border border-bp-border bg-white px-4 py-3 text-[14px] text-bp-body">
                  <ShieldCheck size={16} className="text-bp-accent" />
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/search"
                className="bp-button-primary"
              >
                Browse providers
              </Link>
              <Link
                href="/how-it-works"
                className="bp-button-secondary"
              >
                See how booking works
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              {features.map((feature) => (
                <FeatureCard key={feature.title} {...feature} />
              ))}
            </div>

            <div className="bp-card flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-bp-primary text-white">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-bp-body/60">Coverage</p>
                  <p className="text-[18px] font-semibold tracking-[-0.03em] text-bp-primary">18 Indian cities and growing</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {['Mumbai', 'Delhi', 'Bengaluru', 'Pune'].map((city) => (
                  <span key={city} className="bp-chip">
                    {city}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}