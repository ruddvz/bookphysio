"use client"

import { useState } from 'react'
import { Ban, Eye, Search, ShieldCheck, UserPlus, Users } from 'lucide-react'
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
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700">
              <Users size={12} />
              User operations
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <ShieldCheck size={12} />
              Identity review
            </span>
          </div>
          <h1 className="text-[24px] md:text-[28px] font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="mt-0.5 text-[14px] text-slate-500">
            Search, review, and manage patient and provider accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => { setActiveTab('providers'); setActionMessage('Provider profiles are ready for review.') }} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-[14px] font-semibold text-white transition-colors hover:bg-slate-800">
            Open profile queue
          </button>
          <button type="button" onClick={() => { setActiveTab('suspended'); setActionMessage('Suspended accounts moved into focus.') }} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[14px] font-semibold text-slate-700 transition-colors hover:border-slate-300">
            Review suspensions
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {overviewCards.map((card) => {
          const CardIcon = card.icon
          return (
            <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <CardIcon size={18} />
                </div>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Live
                </span>
              </div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{card.title}</p>
              <p className="mt-1 text-[22px] font-bold tracking-tight text-slate-900">{card.value}</p>
              <p className="mt-1 text-[12px] text-slate-500">{card.detail}</p>
            </div>
          )
        })}
      </div>

      {/* User Registry Table */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-lg">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-[17px] font-bold tracking-tight text-slate-900">User registry</h2>
            <p className="mt-0.5 text-[12px] font-medium uppercase tracking-wider text-slate-400">Search, suspend, and inspect accounts</p>
          </div>

          <div className="relative shrink-0">
            <input
              type="search"
              placeholder="Search phone, name or ID..."
              aria-label="Search users"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-[14px] text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 md:w-[320px]"
            />
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {actionMessage && (
          <div className="mx-5 mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-[13px] font-medium text-blue-800 md:mx-6">
            {actionMessage}
          </div>
        )}

        <div className="border-b border-slate-200 px-5 md:px-6">
          <div className="flex gap-6 overflow-x-auto" role="group" aria-label="User registry filters">
            {(['patients', 'providers', 'suspended'] as RegistryTab[]).map((tab) => {
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  aria-pressed={isActive}
                  className={cn(
                    'border-b-2 py-3.5 text-[14px] capitalize transition-colors cursor-pointer',
                    isActive
                      ? 'border-blue-600 font-bold text-blue-600'
                      : 'border-transparent font-medium text-slate-500 hover:border-slate-300 hover:text-slate-700'
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
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-4 text-[12px] font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="transition-colors hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700 text-[13px]">{currentRow.initials}</div>
                    <div>
                      <p className="text-[14px] font-semibold text-slate-900">{currentRow.name}</p>
                      <p className="text-[12px] text-slate-400">{currentRow.subtitle}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="mb-0.5 text-[14px] text-slate-700">{currentRow.contact}</p>
                  <p className="text-[12px] text-slate-400">{currentRow.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold',
                    activeTab === 'suspended'
                      ? 'bg-rose-50 text-rose-700'
                      : activeTab === 'providers'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-blue-50 text-blue-700'
                  )}>
                    {currentRow.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-[14px] text-slate-500">{currentRow.lastActive}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => setActionMessage(`Opened ${currentRow.name} for a detailed profile review.`)} aria-label="View user details" title="View Details" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={() => setActionMessage(`${currentRow.name} has been moved into the suspension review queue.`)} aria-label="Suspend user" title="Suspend User" className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600">
                      <Ban className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-200 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
          <p aria-live="polite" aria-atomic="true" className="text-[14px] text-slate-500">
            Showing <span className="font-semibold text-slate-900">1</span> to <span className="font-semibold text-slate-900">1</span> of <span className="font-semibold text-slate-900">{currentRow.count}</span> users
          </p>
          <div className="flex gap-2">
            <button type="button" disabled className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-[14px] font-medium text-slate-400">Previous</button>
            <button type="button" onClick={cycleTab} className="rounded-lg border border-slate-200 px-4 py-2 text-[14px] font-medium text-slate-700 transition-colors cursor-pointer hover:bg-slate-50">Next</button>
          </div>
        </div>
      </section>
    </div>
  )
}
