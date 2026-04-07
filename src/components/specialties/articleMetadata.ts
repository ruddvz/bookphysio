import type { Metadata } from 'next'

interface SpecialtyArticleMetadataInput {
  slug: string
  title: string
  subtitle: string
  description: string
}

export function buildSpecialtyArticleMetadata({
  slug,
  title,
  subtitle,
  description,
}: SpecialtyArticleMetadataInput): Metadata {
  const pageTitle = `${title} in India | BookPhysio.in`
  const pageDescription = `${subtitle} ${description}`

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: {
      canonical: `https://bookphysio.in/specialties/${slug}`,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `https://bookphysio.in/specialties/${slug}`,
      siteName: 'BookPhysio.in',
      locale: 'en_IN',
      type: 'article',
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: `BookPhysio — ${title} in India`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: ['/opengraph-image'],
    },
  }
}