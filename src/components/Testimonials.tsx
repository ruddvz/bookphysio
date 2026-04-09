import { ShieldCheck, Clock, Home } from 'lucide-react'

const promises = [
  {
    title: 'Verified credentials',
    description: 'Every physiotherapist on BookPhysio is checked against IAP records, degree uploads, and government ID before going live.',
    icon: ShieldCheck,
    color: 'bg-indigo-100 text-indigo-700',
  },
  {
    title: 'Transparent pricing',
    description: 'See the consultation fee upfront — no hidden charges, no surprises at checkout. What you see is what you pay.',
    icon: Clock,
    color: 'bg-violet-100 text-violet-700',
  },
  {
    title: 'Home visits available',
    description: 'Filter by home visit or in-clinic. Compare providers and book the format that works best for your recovery.',
    icon: Home,
    color: 'bg-emerald-100 text-emerald-700',
  },
]

export default function Testimonials() {
  return (
    <section className="bg-slate-50 py-24 md:py-32 border-y border-slate-100" aria-label="Platform promises">
      <div className="bp-container">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-12">
          <div className="max-w-xl">
            <div className="bp-kicker mb-4">Our Promise</div>
            <h2 className="text-slate-900 mb-3">What you can expect.</h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              We built BookPhysio to make finding quality physiotherapy care in India simple, transparent, and trustworthy.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[13px] font-semibold shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            All providers verified
          </div>
        </div>

        {/* Cards */}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {promises.map(p => (
            <article
              key={p.title}
              className="flex flex-col p-7 bg-white rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-200"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${p.color}`}>
                <p.icon size={22} />
              </div>

              {/* Content */}
              <h3 className="text-slate-900 text-[17px] font-semibold mb-2">{p.title}</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed flex-1">
                {p.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
