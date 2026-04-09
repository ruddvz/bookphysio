import { redirect } from 'next/navigation'

interface HindiAuthRedirectProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function buildRedirectPath(pathname: string, params: Record<string, string | string[] | undefined>) {
  const query = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item)
      }
      continue
    }

    if (value) {
      query.set(key, value)
    }
  }

  const queryString = query.toString()
  return queryString ? `${pathname}?${queryString}` : pathname
}

export default async function HindiSignupPage({ searchParams }: HindiAuthRedirectProps) {
  redirect(buildRedirectPath('/signup', await searchParams))
}
