"use client"

import { useState } from 'react'
import { Ban, Eye, Search, ShieldCheck, UserPlus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

import {
  PageHeader,
  SectionCard,
  StatTile,
  ListRow,
} from '@/components/dashboard/primitives'

type RegistryTab = 'patients' | 'providers' | 'suspended'

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState<RegistryTab>('patients')
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const tabOrder: RegistryTab[] = ['patients', 'providers', 'suspended']

  const currentRow = {
    patients: {
      initials: 'RV',
      name: 'Rahul Verma',
      subtitle: 'ID: USR-8892',
      contact: '+91 98765 00000',
      email: 'rahul@example.com',
      role: 'Patient',
      lastActive: '10 mins ago',
      count: '8,921',
    },
    providers: {
      initials: 'AN',
      name: 'Dr. Ananya Nair',
      subtitle: 'ID: PRV-4421',
      contact: '+91 99887 77665',
      email: 'ananya@example.com',
      role: 'Provider',
      lastActive: '6 mins ago',
      count: '342',
    },
    suspended: {
      initials: 'SK',
      name: 'Sana Khan',
      subtitle: 'ID: SUSP-014',
      contact: '+91 91234 55667',
      email: 'sana@example.com',
      role: 'Suspended',
      lastActive: '2 days ago',
      count: '14',
    },
  }[activeTab]

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="admin"
        kicker="USER OPERATIONS"
        title="Account registry"
        subtitle="Manage patient profiles, provider credentials, and system access"
        action={{
           label: 'Register guest',
           icon: UserPlus,
           onClick: () => setActionMessage('Manual guest registration initiated.')
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <StatTile
          role="admin"
          tone={1}
          icon={Users}
          label="Patients"
          value="8,921"
          delta={{ value: 'Active', positive: true }}
        />
        <StatTile
          role="admin"
          tone={4}
          icon={ShieldCheck}
          label="Providers"
          value="342"
          delta={{ value: 'Verified', positive: true }}
        />
        <StatTile
          role="admin"
          tone={6}
          icon={Ban}
          label="Suspended"
          value="14"
          delta={{ value: 'Under sync' }}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,340px] gap-6">
        <div className="space-y-6">
          <SectionCard role="admin" title="System Directory">
            <div className="flex flex-col gap-6">
               {/* Controls */}
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-1 p-1 bg-slate-100/80 rounded-full">
                    {tabOrder.map((t) => (
                      <button
                        key={t}
                        onClick={() => setActiveTab(t)}
                        className={cn(
                          "px-6 py-2 rounded-full text-[13px] font-bold transition-all capitalize",
                          activeTab === t
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="relative group w-full lg:max-w-xs">
                     <input
                       type="text"
                       placeholder="Search records..."
                       className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[var(--sq-lg)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                     />
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  </div>
               </div>

               {actionMessage && (
                 <div className="p-4 bg-slate-50 border border-slate-100 rounded-[var(--sq-sm)] text-[13px] font-bold text-slate-600 flex items-center gap-3">
                   <ShieldCheck size={16} className="text-slate-400" />
                   {actionMessage}
                 </div>
               )}

               <div className="divide-y divide-slate-100/50">
                 <ListRow
                   role="admin"
                   icon={
                     <div className="w-11 h-11 rounded-[var(--sq-lg)] bg-slate-900 text-white flex items-center justify-center text-sm font-black border border-slate-800">
                       {currentRow.initials}
                     </div>
                   }
                   primary={currentRow.name}
                   secondary={
                      <div className="flex items-center gap-4">
                        <span className="text-slate-400">{currentRow.subtitle}</span>
                        <span className="text-slate-500 font-bold">{currentRow.contact}</span>
                      </div>
                   }
                   right={
                     <div className="flex items-center gap-6">
                        <div className="hidden lg:flex flex-col items-end gap-1">
                           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Activity</span>
                           <span className="text-[13px] font-bold text-slate-900">{currentRow.lastActive}</span>
                        </div>
                        <div className="flex items-center gap-1">
                           <button onClick={() => setActionMessage(`Inspecting ${currentRow.name}`)} className="p-2 text-slate-400 hover:text-slate-900 transition-colors"><Eye size={18} /></button>
                           <button onClick={() => setActionMessage(`Suspending ${currentRow.name}`)} className="p-2 text-slate-400 hover:text-rose-600 transition-colors"><Ban size={18} /></button>
                        </div>
                     </div>
                   }
                 />
               </div>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard role="admin" title="Quick Actions">
             <div className="space-y-3">
                <button
                  onClick={() => setActionMessage('System audit logs exported.')}
                  className="w-full flex items-center gap-3 p-4 rounded-[var(--sq-sm)] border border-slate-100 hover:bg-slate-50 transition-all font-bold text-[14px] text-slate-700"
                >
                  <ShieldCheck size={18} className="text-slate-400" />
                  Audit Logs
                </button>
             </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
