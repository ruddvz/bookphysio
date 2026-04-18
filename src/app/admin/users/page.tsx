"use client"

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, RefreshCw, Search, ShieldCheck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatTile,
  ListRow,
} from '@/components/dashboard/primitives'
import { useUiV2 } from '@/hooks/useUiV2'
import { RoleBadge, type DirectoryRole } from './UsersV2'

type RegistryTab = 'patients' | 'providers' | 'pending'

interface AdminUserRow {
  id: string
  full_name: string | null
  phone: string | null
  role: 'patient' | 'provider' | 'provider_pending' | 'admin' | string | null
  created_at: string
}

interface AdminUsersResponse {
  users: AdminUserRow[]
  total: number
  page: number
  limit: number
}

interface AdminStatsResponse {
  activeProviders: number
  pendingApprovals: number
  totalPatients: number
  gmvMtd: number
}

function formatAdminTabLabel(tab: RegistryTab): string {
  return tab === 'pending' ? 'Pending' : tab === 'providers' ? 'Providers' : 'Patients'
}

function mapUserRoleToTab(role: AdminUserRow['role']): RegistryTab | null {
  if (role === 'patient') return 'patients'
  if (role === 'provider') return 'providers'
  if (role === 'provider_pending') return 'pending'
  return null
}

function mapRoleBadge(role: AdminUserRow['role']): DirectoryRole {
  if (role === 'provider') return 'Provider'
  if (role === 'provider_pending') return 'Pending'
  return 'Patient'
}

function formatRelativeTime(dateString: string): string {
  const then = new Date(dateString).getTime()
  const now = Date.now()
  const diffMs = Math.max(now - then, 0)
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes} mins ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} hours ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} days ago`
}

function initialsFor(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || '?'
}

export default function AdminUsers() {
  const uiV2 = useUiV2()
  const [activeTab, setActiveTab] = useState<RegistryTab>('patients')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const tabOrder: RegistryTab[] = ['patients', 'providers', 'pending']

  const usersQuery = useQuery<AdminUsersResponse>({
    queryKey: ['admin-users-registry', page],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users?page=${page}`)
      if (!response.ok) throw new Error(`Failed to load users (${response.status})`)
      return response.json()
    },
    staleTime: 60000,
  })

  const statsQuery = useQuery<AdminStatsResponse>({
    queryKey: ['admin-stats-summary'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error(`Failed to load stats (${response.status})`)
      return response.json()
    },
    staleTime: 60000,
  })

  const allUsers = useMemo(() => usersQuery.data?.users ?? [], [usersQuery.data?.users])
  const filteredUsers = useMemo(() => {
    const searchNeedle = search.trim().toLowerCase()
    return allUsers.filter((user) => {
      const tabMatch = mapUserRoleToTab(user.role) === activeTab
      if (!tabMatch) return false

      if (!searchNeedle) return true

      const haystack = [
        user.full_name ?? '',
        user.phone ?? '',
        user.id,
      ].join(' ').toLowerCase()

      return haystack.includes(searchNeedle)
    })
  }, [activeTab, allUsers, search])

  const patientsCount = statsQuery.data?.totalPatients ?? 0
  const providersCount = statsQuery.data?.activeProviders ?? 0
  const pendingCount = statsQuery.data?.pendingApprovals ?? 0
  const totalUsers = usersQuery.data?.total ?? allUsers.length
  const totalPages = usersQuery.data ? Math.max(1, Math.ceil(usersQuery.data.total / usersQuery.data.limit)) : 1
  const registryLoading = usersQuery.isLoading
  const statsLoading = statsQuery.isLoading
  const registryError = usersQuery.error instanceof Error
    ? 'We could not load the registry right now.'
    : null
  const statsError = statsQuery.error instanceof Error
    ? 'Counters are temporarily unavailable. The registry list below is still live.'
    : null

  const handleRefresh = () => {
    void usersQuery.refetch()
    void statsQuery.refetch()
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="admin"
        title="Account registry"
        action={{
           label: 'Refresh',
           icon: RefreshCw,
           onClick: handleRefresh,
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        <StatTile
          role="admin"
          tone={1}
          icon={Users}
          label="Patients"
          value={statsLoading ? '—' : patientsCount.toLocaleString('en-IN')}
          delta={{ value: 'Live', positive: true }}
        />
        <StatTile
          role="admin"
          tone={4}
          icon={ShieldCheck}
          label="Providers"
          value={statsLoading ? '—' : providersCount.toLocaleString('en-IN')}
          delta={{ value: 'Verified', positive: true }}
        />
        <StatTile
          role="admin"
          tone={6}
          icon={ShieldCheck}
          label="Pending approval"
          value={statsLoading ? '—' : pendingCount.toLocaleString('en-IN')}
          delta={{ value: 'In review' }}
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
                        onClick={() => {
                          setActiveTab(t)
                          setPage(1)
                        }}
                        className={cn(
                          "px-6 py-2 rounded-full text-[13px] font-bold transition-all capitalize",
                          activeTab === t
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-700"
                        )}
                      >
                        {formatAdminTabLabel(t)}
                      </button>
                    ))}
                  </div>
                  <div className="relative group w-full lg:max-w-xs">
                     <input
                       type="text"
                       placeholder="Search records..."
                       value={search}
                       onChange={(event) => setSearch(event.target.value)}
                       className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[var(--sq-lg)] text-[14px] text-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-900/10 transition-all outline-none"
                     />
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                  </div>
               </div>

               {statsError ? (
                 <div className="rounded-[var(--sq-sm)] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-semibold text-amber-800">
                   {statsError}
                 </div>
               ) : null}

               {registryLoading ? (
                 <div className="rounded-[var(--sq-sm)] border border-slate-100 bg-slate-50/60 p-6 text-[13px] font-semibold text-slate-500">
                   Loading registry…
                 </div>
               ) : registryError ? (
                 <EmptyState
                   role="admin"
                   icon={ShieldCheck}
                   title="Registry unavailable"
                   description={registryError}
                   cta={{ label: 'Retry', onClick: handleRefresh }}
                 />
               ) : filteredUsers.length === 0 ? (
                 <EmptyState
                   role="admin"
                   icon={Search}
                   title={search ? `No ${formatAdminTabLabel(activeTab).toLowerCase()} match your search` : `No ${formatAdminTabLabel(activeTab).toLowerCase()} in the registry`}
                   description={search ? 'Try a name, phone number, or user ID.' : 'Live records will appear here as accounts are created.'}
                 />
               ) : (
                 <div className="divide-y divide-slate-100/50">
                   {filteredUsers.map((user) => {
                     const displayName = user.full_name?.trim() || 'Unnamed account'
                     const relativeActivity = formatRelativeTime(user.created_at)
                     const badgeRole = mapRoleBadge(user.role)

                     return (
                       <ListRow
                         key={user.id}
                         role="admin"
                         icon={
                           <div className="w-11 h-11 rounded-[var(--sq-lg)] bg-slate-900 text-white flex items-center justify-center text-sm font-black border border-slate-800">
                             {initialsFor(displayName)}
                           </div>
                         }
                         primary={displayName}
                         secondary={
                            <div className="flex items-center gap-4">
                              <span className="text-slate-400">ID: {user.id.slice(0, 8)}</span>
                              <span className="text-slate-500 font-bold">{user.phone ?? 'Phone unavailable'}</span>
                            </div>
                         }
                         right={
                           <div className="flex items-center gap-6">
                              <div className="hidden lg:flex flex-col items-end gap-1">
                                 <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined</span>
                                 <div className="flex items-center gap-2 text-[13px] font-bold text-slate-900">
                                   <span className="text-[13px] font-bold text-slate-900">{relativeActivity}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 {uiV2 ? (
                                   <RoleBadge role={badgeRole} />
                                 ) : null}
                              </div>
                           </div>
                         }
                       />
                     )
                   })}
                 </div>
               )}

               {!registryLoading && !registryError ? (
                 <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                   <p className="text-[12px] font-medium text-slate-500">
                     Page {page} of {totalPages} · {totalUsers.toLocaleString('en-IN')} total account{totalUsers === 1 ? '' : 's'}
                   </p>
                   <div className="flex items-center gap-2">
                     <button
                       type="button"
                       onClick={() => setPage((current) => Math.max(1, current - 1))}
                       disabled={page === 1}
                       className="rounded-full border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                     >
                       Previous
                     </button>
                     <button
                       type="button"
                       onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                       disabled={page >= totalPages}
                       className="rounded-full border border-slate-200 px-4 py-2 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                     >
                       Next
                     </button>
                   </div>
                 </div>
               ) : null}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard role="admin" title="Quick Actions">
             <div className="space-y-3">
               <Link
                 href="/admin/listings"
                 className="flex w-full items-center gap-3 rounded-[var(--sq-sm)] border border-slate-100 p-4 text-[14px] font-bold text-slate-700 transition-all hover:bg-slate-50"
               >
                 <ShieldCheck size={18} className="text-slate-400" />
                 Review approvals
               </Link>
               <Link
                 href="/admin/analytics"
                 className="flex w-full items-center gap-3 rounded-[var(--sq-sm)] border border-slate-100 p-4 text-[14px] font-bold text-slate-700 transition-all hover:bg-slate-50"
               >
                 <BarChart3 size={18} className="text-slate-400" />
                 Open analytics
               </Link>
               <button
                 type="button"
                 onClick={handleRefresh}
                 className="flex w-full items-center gap-3 rounded-[var(--sq-sm)] border border-slate-100 p-4 text-[14px] font-bold text-slate-700 transition-all hover:bg-slate-50"
               >
                 <RefreshCw size={18} className="text-slate-400" />
                 Refresh registry
               </button>
             </div>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}
