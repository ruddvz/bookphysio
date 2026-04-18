/**
 * Public provider listing filters — must match search RPC + product rules:
 * active, phone-verified, and admin-approved only.
 */
export function applyPublicProviderFilters<T extends { eq: (column: string, value: unknown) => T }>(
  query: T,
): T {
  return query.eq('active', true).eq('verified', true).eq('approval_status', 'approved')
}
