import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'

export interface TrendDeltaProps {
  value: number
  suffix?: string
  inverse?: boolean
  className?: string
}

export function TrendDelta({ value, suffix = '%', inverse = false, className = '' }: TrendDeltaProps) {
  const direction = value === 0 ? 'flat' : value > 0 ? 'up' : 'down'
  const positive = inverse ? direction === 'down' : direction === 'up'
  const color =
    direction === 'flat'
      ? 'text-slate-500 bg-slate-100'
      : positive
        ? 'text-emerald-700 bg-emerald-50'
        : 'text-rose-700 bg-rose-50'
  const Icon = direction === 'flat' ? Minus : direction === 'up' ? ArrowUpRight : ArrowDownRight
  const prefix = direction === 'up' ? '+' : ''
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${color} ${className}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {prefix}
      {value.toFixed(value % 1 === 0 ? 0 : 1)}
      {suffix}
    </span>
  )
}
