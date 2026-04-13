import { cn } from '@/lib/utils'

const cardClass = 'bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 mb-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] relative'

interface BioSectionProps {
  bio: string
}

export default function BioSection({ bio }: BioSectionProps) {
  return (
    <section className={cn(cardClass, 'border-bp-border/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.03)] overflow-hidden relative')}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-bp-surface/50 rounded-bl-[120px] -z-0 pointer-events-none" />
      <div className="absolute top-12 left-0 w-1 h-12 bg-bp-accent rounded-r-full" />

      <h2 className="text-[28px] font-bold text-bp-primary mb-8 flex items-center gap-4 relative z-10 tracking-tight">
        Professional Biography
      </h2>
      <div className="prose prose-teal max-w-none relative z-10">
        <p className="text-[18px] text-bp-body leading-[1.8] font-medium whitespace-pre-wrap max-w-[95%] first-letter:text-5xl first-letter:font-bold first-letter:text-bp-primary first-letter:mr-3 first-letter:float-left">
          {bio}
        </p>
      </div>
    </section>
  )
}
