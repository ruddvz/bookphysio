"use client"

import { useState } from 'react'
import { ArrowUpRight, Ban, Eye, Search, ShieldCheck, Sparkles, UserPlus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type RegistryTab = 'patients' | 'providers' | 'suspended'

const overviewCards = [
  { title: 'Patients', value: '8,921', detail: 'Active patient profiles', icon: Users },
  { title: 'Providers', value: '342', detail: 'Verified physiotherapists', icon: ShieldCheck },
  { title: 'Suspended', value: '14', detail: 'Accounts under review', icon: UserPlus },
]

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState<RegistryTab>('patients')
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  const tabOrder: RegistryTab[] = ['patients', 'providers', 'suspended']

  function cycleTab() {
    const currentIndex = tabOrder.indexOf(activeTab)
    const nextTab = tabOrder[(currentIndex + 1) % tabOrder.length]
    setActiveTab(nextTab)
    setActionMessage(`Showing ${nextTab} accounts.`)
  }

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
    <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-6 py-10 md:px-10 md:py-12 animate-in fade-in duration-500">
      <section className="overflow-hidden rounded-[36px] border border-gray-100 bg-white shadow-[0_28px_80px_-40px_rgba(0,0,0,0.2)]">
        <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.24em] text-gray-400">
              <span className="inline-flex items-center gap-2 rounded-full border border-teal-100 bg-[#E6F4F3] px-3 py-1 text-[#00766C]">
                <Sparkles size={12} />
                User operations
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 px-3 py-1 text-[#333333]">
                <ShieldCheck size={12} />
                Identity review
              </span>
            </div>

            <div className="space-y-3">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#00766C]">Admin console</p>
              <h1 className="max-w-3xl text-[34px] font-black leading-[0.95] tracking-tight text-[#333333] md:text-[54px]">User management feels premium, not utilitarian.</h1>
              <p className="max-w-2xl text-[15px] font-medium leading-relaxed text-[#666666] md:text-[17px]">
                Review patients and providers from a clean, high-signal dashboard that is ready for demos and future operational workflows.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button onClick={() => { setActiveTab('providers'); setActionMessage('Provider profiles are ready for review.') }} className="inline-flex items-center gap-3 rounded-[24px] bg-[#333333] px-6 py-3.5 text-[14px] font-black text-white shadow-xl shadow-gray-200 transition-all hover:-translate-y-0.5 hover:bg-[#00766C]">
                Open profile queue
                <ArrowUpRight size={16} strokeWidth={3} />
              </button>
              <button onClick={() => { setActiveTab('suspended'); setActionMessage('Suspended accounts moved into focus.') }} className="inline-flex items-center gap-3 rounded-[24px] border border-gray-100 bg-white px-6 py-3.5 text-[14px] font-black text-[#333333] shadow-sm transition-all hover:border-teal-100 hover:text-[#00766C]">
                Review suspensions
                <ArrowUpRight size={16} strokeWidth={3} />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {overviewCards.map((card) => {
              const CardIcon = card.icon
              return (
                <div key={card.title} className="rounded-[28px] border border-gray-100 bg-[#fafbfc] p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E6F4F3] text-[#00766C]">
                      <CardIcon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="rounded-full border border-gray-100 bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#6B7280]">
                      Live
                    </div>
                  </div>
                  <p className="mt-4 text-[11px] font-black uppercase tracking-widest text-[#6B7280]">{card.title}</p>
                  <p className="mt-1 text-[18px] font-black tracking-tight text-[#333333]">{card.value}</p>
                  <p className="mt-2 text-[12px] font-medium leading-relaxed text-[#666666]">{card.detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="rounded-[36px] border border-gray-100 bg-white shadow-[0_28px_80px_-44px_rgba(0,0,0,0.2)]">
        <div className="flex flex-col gap-6 border-b border-gray-100 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[20px] font-black tracking-tight text-[#333333]">User registry</h2>
            <p className="mt-1 text-[12px] font-black uppercase tracking-[0.22em] text-[#6B7280]">Search, suspend, and inspect accounts</p>
          </div>

          <div className="relative shrink-0">
            <input
              type="search"
              placeholder="Search phone, name or ID..."
              aria-label="Search users"
              className="w-full rounded-[24px] border border-gray-100 bg-[#fafbfc] py-3.5 pl-12 pr-4 text-[14px] font-medium text-[#333333] outline-none transition-all placeholder:text-[#6B7280] focus:border-[#00766C]/30 focus:bg-white focus:ring-4 focus:ring-[#00766C]/5 md:w-[360px]"
            />
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          </div>
        </div>

        {actionMessage && (
          <div className="mx-6 rounded-[24px] border border-teal-100 bg-[#F7FCFB] px-4 py-3 text-[13px] font-bold text-[#00766C] md:mx-8">
            {actionMessage}
          </div>
        )}

        <div className="border-b border-gray-100 px-6 md:px-8">
          <div className="flex gap-8 overflow-x-auto" role="group" aria-label="User registry filters">
            {(['patients', 'providers', 'suspended'] as RegistryTab[]).map((tab) => {
              const isActive = activeTab === tab

              return isActive ? (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed="true"
                  className={cn(
                    'border-b-2 py-4 text-[15px] capitalize transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                    'border-[#00766C] font-black text-[#00766C]'
                  )}
                >
                  {tab}
                </button>
              ) : (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed="false"
                  className={cn(
                    'border-b-2 py-4 text-[15px] capitalize transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
                    'border-transparent font-medium text-[#666666] hover:border-gray-100 hover:text-[#333333]'
                  )}
                >
                  {tab}
                </button>
              )
            })}
          </div>
        </div>

        <div className="overflow-x-auto p-2 md:p-6">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-[#fafbfc] border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-[13px] font-semibold text-[#6B7280] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="transition-colors hover:bg-[#fafbfc]">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6F4F3] font-bold text-[#00766C]">{currentRow.initials}</div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#333333]">{currentRow.name}</p>
                      <p className="text-[13px] text-[#6B7280]">{currentRow.subtitle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="mb-0.5 text-[14px] text-[#333333]">{currentRow.contact}</p>
                  <p className="text-[13px] text-[#666666]">{currentRow.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold',
                    activeTab === 'providers'
                      ? 'bg-teal-50 text-[#00766C]'
                      : activeTab === 'suspended'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-blue-50 text-blue-700'
                  )}>
                    {currentRow.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-[14px] text-[#666666]">{currentRow.lastActive}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setActionMessage(`Opened ${currentRow.name} for a detailed profile review.`)} aria-label="View user details" title="View Details" className="rounded-lg p-2 text-[#666666] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C]/20 cursor-pointer hover:bg-[#E6F4F3] hover:text-[#00766C]">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button onClick={() => setActionMessage(`${currentRow.name} has been moved into the suspension review queue.`)} aria-label="Suspend user" title="Suspend User" className="rounded-lg p-2 text-[#666666] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C]/20 cursor-pointer hover:bg-[#FEF2F2] hover:text-[#DC2626]">
                      <Ban className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-100 px-6 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          <p aria-live="polite" aria-atomic="true" className="text-[14px] text-[#666666]">
            Showing <span className="font-semibold text-[#333333]">1</span> to <span className="font-semibold text-[#333333]">1</span> of <span className="font-semibold text-[#333333]">{currentRow.count}</span> users
          </p>
          <div className="flex gap-2">
            <button disabled className="cursor-not-allowed rounded-lg border border-gray-100 bg-[#F8FAFC] px-4 py-2 text-[14px] font-medium text-[#64748B]">Previous</button>
            <button onClick={cycleTab} className="rounded-lg border border-gray-100 px-4 py-2 text-[14px] font-medium text-[#333333] transition-colors cursor-pointer hover:bg-[#fafbfc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00766C]/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white">Next</button>
          </div>
        </div>
      </section>
    </div>
  )
}
