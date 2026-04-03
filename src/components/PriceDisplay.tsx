import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  amountInr: number
  suffix?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceDisplay({ amountInr, suffix, size = 'md', className }: PriceDisplayProps) {
  const sizeClass = {
    sm: 'text-sm font-medium',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold',
  }[size]

  return (
    <span className={cn(sizeClass, 'text-bp-primary', className)}>
      ₹{amountInr.toLocaleString('en-IN')}
      {suffix && <span className="text-bp-body font-normal text-sm">{suffix}</span>}
    </span>
  )
}

/** Compute 18% GST on an integer INR amount */
export function calcGst(amountInr: number): number {
  return Math.round(amountInr * 0.18)
}
