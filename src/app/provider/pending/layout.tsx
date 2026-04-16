import type { ReactNode } from 'react'

// Minimal layout — no DashboardShell, no provider nav.
// provider_pending users should not see navigation links to pages they cannot access.
export default function PendingProviderLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
