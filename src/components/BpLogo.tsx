import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

const LOGO_SIZE_CLASSES = {
  nav: 'h-10 w-[170px] sm:h-11 sm:w-[184px]',
  auth: 'h-12 w-[220px] sm:h-14 sm:w-[260px]',
  footer: 'h-10 w-[190px] sm:h-11 sm:w-[210px]',
} as const

const LOGO_IMAGE_SIZES = {
  nav: '184px',
  auth: '260px',
  footer: '210px',
} as const

type BpLogoProps = {
  className?: string
  imageClassName?: string
  iconClassName?: string
  linkClassName?: string
  /** Apply dark-mode tint (white wordmark) for use on teal/dark backgrounds */
  invert?: boolean
  priority?: boolean
  href?: string
  size?: keyof typeof LOGO_SIZE_CLASSES
}

export default function BpLogo({
  className,
  imageClassName,
  iconClassName,
  linkClassName,
  invert = false,
  priority = true,
  href,
  size = 'nav',
}: BpLogoProps) {
  const logo = (
    <span className={cn('relative block overflow-hidden', LOGO_SIZE_CLASSES[size], className)}>
      <Image
        src="/logo.png"
        alt="BookPhysio.in"
        fill
        sizes={LOGO_IMAGE_SIZES[size]}
        className={cn('object-contain', invert && 'brightness-0 invert', imageClassName, iconClassName)}
        priority={priority}
      />
    </span>
  )

  if (!href) {
    return logo
  }

  return (
    <Link href={href} aria-label="BookPhysio home" className={cn('inline-flex', linkClassName)}>
      {logo}
    </Link>
  )
}
