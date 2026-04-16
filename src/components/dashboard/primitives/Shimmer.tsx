export interface ShimmerProps {
  className?: string
  style?: React.CSSProperties
}

export function Shimmer({ className = '', style }: ShimmerProps) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-100 motion-reduce:animate-none ${className}`}
      style={style}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent motion-reduce:hidden"
      />
    </div>
  )
}
