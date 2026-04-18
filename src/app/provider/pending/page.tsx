import { createClient } from '@/lib/supabase/server'
import { ProviderPendingClient } from './ProviderPendingClient'

export default async function ProviderPendingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const emailConfirmed = Boolean(user?.email_confirmed_at)
  const email = user?.email ?? ''

  return <ProviderPendingClient emailConfirmed={emailConfirmed} email={email} />
}
