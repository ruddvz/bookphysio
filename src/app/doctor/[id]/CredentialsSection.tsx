import { Activity, GraduationCap, CheckCircle2, Award } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProviderProfile } from '@/app/api/contracts/provider'

const cardClass = 'bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 mb-6 shadow-[0_1px_3px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] relative'

interface CredentialsSectionProps {
  provider: ProviderProfile
  verificationSource: string
  hasRegistration: boolean
}

export default function CredentialsSection({
  provider,
  verificationSource,
  hasRegistration,
}: CredentialsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {provider.specialties.length > 0 && (
        <section className={cn(cardClass, 'mb-0 border-bp-border/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.02)]')}>
          <h2 className="text-[20px] font-bold text-bp-primary mb-8 flex items-center gap-4 tracking-tight">
            <div className="w-10 h-10 bg-bp-surface rounded-xl flex items-center justify-center text-bp-accent">
              <Activity size={20} strokeWidth={2.5} />
            </div>
            Clinical Expertise
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {provider.specialties.map((spec) => (
              <span key={spec.id} className="bg-white text-bp-primary text-[14px] font-bold px-5 py-3 rounded-xl border border-bp-border/40 shadow-sm hover:border-bp-primary hover:shadow-md transition-all duration-300 cursor-default">
                {spec.name}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className={cn(cardClass, 'mb-0 border-bp-border/10 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.02)]')}>
        <h2 className="text-[20px] font-bold text-bp-primary mb-8 flex items-center gap-4 tracking-tight">
          <div className="w-10 h-10 bg-bp-surface rounded-xl flex items-center justify-center text-bp-accent">
            <GraduationCap size={20} strokeWidth={2.5} />
          </div>
          Professional Credentials
        </h2>
        <div className="space-y-6">
          {hasRegistration && (
            <div className="flex items-center gap-5 p-5 rounded-xl bg-[#FBFCFD] border border-bp-border/30 group hover:border-bp-accent/40 transition-colors duration-500">
              <div className="bg-white p-3.5 rounded-2xl border border-bp-border shadow-sm group-hover:scale-110 transition-transform duration-500">
                <CheckCircle2 size={24} className="text-emerald-600" strokeWidth={3} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-bp-body/30 uppercase tracking-[0.2em] mb-1.5 leading-none">{verificationSource} Registration</p>
                <p className="text-[16px] font-bold text-emerald-600 tracking-tight flex items-center gap-1.5">Validated on Record</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-4">
            <div className="mt-1 bg-bp-accent/10 p-2 rounded-xl text-bp-accent">
              <Award size={20} strokeWidth={3} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-bp-body/40 uppercase tracking-widest mb-1">Listed Qualification</p>
              <p className="text-[16px] font-bold text-bp-primary">{provider.title ?? 'Physiotherapist'}</p>
              <p className="text-[14px] font-medium text-bp-body/40 mt-1 italic">Additional academic details may be shared by the provider during consultation.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
