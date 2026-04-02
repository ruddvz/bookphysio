import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type BpLogoProps = {
  className?: string
  frameClassName?: string
  imageClassName?: string
  priority?: boolean
  href?: string
}

export default function BpLogo({
  className,
  frameClassName,
  imageClassName,
  priority = true,
  href,
}: BpLogoProps) {
  const logo = (
    <div className={cn('mb-7 flex items-center gap-2.5', className)}>
      <span className={cn('block h-[36px] w-[144px] overflow-hidden', frameClassName)}>
        <Image
          src="/logo.png"
          alt="BookPhysio"
          width={800}
          height={800}
          className={cn('h-full w-full object-cover object-center', imageClassName)}
          priority={priority}
        />
      </span>
    </div>
  )

  if (!href) {
    return logo
  }

  return (
    <Link href={href} aria-label="BookPhysio logo">
      {logo}
    </Link>
  )
}
