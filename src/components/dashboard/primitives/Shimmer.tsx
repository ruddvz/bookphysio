export interface ShimmerProps {
  className?: string
}

export function Shimmer({ className = '' }: ShimmerProps) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-100 motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent motion-reduce:hidden"
      />
    </div>
  )
}
