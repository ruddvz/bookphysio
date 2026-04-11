import Link from 'next/link'
import {
  ArrowRight,
  Brain,
  ClipboardCheck,
  Dumbbell,
  Home,
  Monitor,
  RefreshCcw,
  Clock,
  MapPin,
} from 'lucide-react'
import { SERVICES } from '@/lib/services'
import { cn } from '@/lib/utils'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  ClipboardCheck,
  RefreshCcw,
  Home,
  Dumbbell,
  Brain,
  Monitor,
}

/** Compact services overview for the homepage — links to /services for full details. */
export default function FeaturedServices() {
  return (
    <section className="bg-slate-50 py-24 md:py-32 border-y border-slate-100" aria-label="Our services">
      <div className="bp-container">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between mb-14">
          <div className="max-w-xl">
            <div className="bp-kicker mb-4">Our services</div>
            <h2 className="text-slate-900 mb-3 tracking-tight">
              Treatment for every stage of recovery.
            </h2>
            <p className="text-slate-500 text-[16px] leading-relaxed">
              Whether you need a first assessment, ongoing rehab, or an ergonomic check-up — we have the right service and the right physiotherapist for you.
            </p>
          </div>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 text-[14px] font-semibold hover:border-indigo-200 hover:text-indigo-700 transition-all group shrink-0 self-start lg:self-auto"
          >
            View all services
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = ICON_MAP[service.icon] ?? ClipboardCheck
            return (
              <Link
                key={service.slug}
                href="/services"
                className={cn(
                  'group flex items-start gap-5 p-6 rounded-2xl border bg-white',
                  'transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60',
                  service.tint.border,
                )}
              >
                {/* Icon */}
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', service.tint.bg, service.tint.text)}>
                  <Icon size={22} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h3 className={cn('text-[15px] font-bold mb-1 transition-colors group-hover:text-indigo-700', service.tint.text)}>
                    {service.name}
                  </h3>
                  <p className="text-slate-500 text-[13px] leading-relaxed mb-3 line-clamp-2">{service.subtitle}</p>

                  {/* Meta */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-900">
                      ₹{service.startingPrice}
                      <span className="text-slate-400 font-medium">onwards</span>
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="inline-flex items-center gap-1 text-[12px] text-slate-500">
                      <Clock size={11} />
                      {service.duration}
                    </span>
                    {service.visitTypes.includes('home') && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="inline-flex items-center gap-1 text-[12px] text-violet-600 font-medium">
                          <Home size={11} />
                          Home visits
                        </span>
                      </>
                    )}
                    {service.visitTypes.includes('clinic') && (
                      <>
                        <span className="text-slate-300">·</span>
                        <span className="inline-flex items-center gap-1 text-[12px] text-teal-600 font-medium">
                          <MapPin size={11} />
                          In-clinic
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
