import Link from 'next/link'
import { Search, ArrowRight } from 'lucide-react'

export default function PatientSearch() {
  return (
    <div className="max-w-[1040px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <h1 className="text-[32px] font-bold text-bp-primary tracking-tight mb-3">
        Find a Physiotherapist
      </h1>
      <p className="text-[15px] text-bp-body mb-8">
        Search for experts by condition, specialty, or clinic name down below.
      </p>

      <div className="bg-white rounded-[12px] border border-bp-border shadow-sm py-16 px-8 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-bp-accent/10 flex items-center justify-center mb-5">
          <Search className="w-8 h-8 text-bp-accent" />
        </div>
        <h2 className="text-[24px] font-bold text-bp-primary mb-6">
          Ready to book your next session?
        </h2>
        
        <Link 
          href="/search"
          className="inline-flex items-center gap-2 px-8 py-3 bg-bp-accent hover:bg-bp-primary text-white rounded-full text-[16px] font-semibold no-underline transition-colors"
        >
          Go to global search
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}
