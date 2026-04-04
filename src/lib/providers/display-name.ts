import type { ProviderCard } from '@/app/api/contracts/provider'

const PROVIDER_TITLE_PREFIX_PATTERN = /^(dr\.?|pt|bpt|mpt)\s+/i

type ProviderIdentity = Pick<ProviderCard, 'full_name' | 'title'>

export function getProviderDisplayName(provider: ProviderIdentity): string {
  const fullName = provider.full_name.trim()

  if (PROVIDER_TITLE_PREFIX_PATTERN.test(fullName)) {
    return fullName
  }

  return provider.title ? `${provider.title} ${fullName}` : fullName
}

export function getProviderInitials(fullName: string): string {
  return fullName
    .replace(PROVIDER_TITLE_PREFIX_PATTERN, '')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
}