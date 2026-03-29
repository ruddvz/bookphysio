import { cn } from '@/lib/utils'

interface StarRatingProps {
  rating: number
  reviewCount?: number
  size?: 'sm' | 'md'
  className?: string
}

export function StarRating({ rating, reviewCount, size = 'md', className }: StarRatingProps) {
  const starSize = size === 'sm' ? 'text-xs' : 'text-sm'
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className={cn('text-yellow-400', starSize)}>★</span>
      <span className={cn('font-semibold text-[#333]', textSize)}>{rating.toFixed(1)}</span>
      {reviewCount !== undefined && (
        <span className={cn('text-[#666]', textSize)}>· {reviewCount} reviews</span>
      )}
    </span>
  )
}
