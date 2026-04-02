import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type BpLogoProps = {
  className?: string
  iconClassName?: string
  /** Apply dark-mode tint (white icon + text) for use on teal/dark backgrounds */
  invert?: boolean
  priority?: boolean
  href?: string
}

export default function BpLogo({
  className,
  iconClassName,
  invert = false,
  priority = true,
  href,
}: BpLogoProps) {
  const logo = (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="/icon.png"
        alt=""
        aria-hidden="true"
        width={36}
        height={36}
        className={cn(
          'h-9 w-9 flex-shrink-0',
          invert && 'brightness-0 invert',
          iconClassName
        )}
        priority={priority}
      />
      <span
        className={cn(
          'font-semibold text-[15px] leading-none tracking-tight',
          invert ? 'text-white' : 'text-[#005A52]'
        )}
      >
        BookPhysio
        <span className={cn(invert ? 'text-white/70' : 'text-[#00766C]')}>.in</span>
      </span>
    </div>
  )

  if (!href) {
    return logo
  }

  return (
    <Link href={href} aria-label="BookPhysio home">
      {logo}
    </Link>
  )
}
