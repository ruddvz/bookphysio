'use client'

import { Clock3, Home, ShieldCheck, Stethoscope } from 'lucide-react'

const previewRows = [
  {
    initials: 'PS',
    name: 'Dr. Priya Sharma',
    specialty: 'Sports physiotherapy',
    location: 'Mumbai',
    fee: 900,
    slot: 'Today · 6:30 PM',
  },
  {
    initials: 'RV',
    name: 'Dr. Rahul Verma',
    specialty: 'Orthopedic rehab',
    location: 'Delhi',
    fee: 800,
    slot: 'Tomorrow · 9:00 AM',
  },
  {
    initials: 'AK',
    name: 'Dr. Ayesha Khan',
    specialty: 'Neuro physiotherapy',
    location: 'Bengaluru',
    fee: 1100,
    slot: 'Today · 8:15 PM',
  },
]

export default function ProofSection() {
  return (
    <section className="bg-white py-24 md:py-32" aria-label="Network transparency">
      <div className="container-bp">
        <div className="grid gap-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[40px] border border-bp-border bg-bp-surface/30 p-8 md:p-12">
            <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-bp-accent">Network transparency</p>
                <h2 className="mt-3 text-[36px] font-bold tracking-[-0.04em] text-bp-primary md:text-[48px]">Real-time availability</h2>
              </div>
              <div className="rounded-full bg-bp-primary px-5 py-2 text-[13px] font-bold text-white">
                5,240+ Providers Live
              </div>
            </div>

            <div className="space-y-4">
              {previewRows.map((row) => (
                <div
                  key={row.name}
                  className="group flex items-center gap-6 rounded-[28px] border border-bp-border bg-white p-5 transition-all hover:border-bp-accent hover:shadow-xl hover:shadow-bp-primary/5"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[20px] bg-bp-surface text-[16px] font-bold text-bp-primary group-hover:bg-bp-accent group-hover:text-white transition-colors">
                    {row.initials}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-[17px] font-bold text-bp-primary">{row.name}</p>
                      <ShieldCheck size={16} className="text-bp-accent" />
                    </div>
                    <p className="text-[14px] text-bp-body">
                      {row.specialty} · {row.location}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[16px] font-bold text-bp-primary">₹{row.fee}</p>
                    <p className="text-[13px] font-medium text-bp-accent">{row.slot}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold tracking-tight text-bp-primary">Why trust our network?</h3>
              <p className="text-lg leading-relaxed text-bp-body">
                We&apos;ve built India&apos;s first search-first physiotherapy platform to eliminate the guesswork in finding quality care.
              </p>
            </div>

            <div className="grid gap-6">
              {[
                { icon: ShieldCheck, title: 'Medical Verification', text: 'Every provider undergoes a 3-step credential check before joining.' },
                { icon: Clock3, title: 'Instant Confirmation', text: 'No "callback for appointment" games. What you see is what you book.' },
                { icon: Home, title: 'Flexible Care', text: 'Compare home visit vs clinic visit formats in a single transparent view.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-bp-surface text-bp-accent">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-bold text-bp-primary">{title}</h4>
                    <p className="mt-1 text-[14px] leading-relaxed text-bp-body">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}