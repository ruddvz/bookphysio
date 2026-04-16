import type { DashRole } from '../primitives'

export interface SparklineProps {
  role?: DashRole
  values: readonly number[]
  width?: number
  height?: number
  strokeWidth?: number
  fill?: boolean
  ariaLabel?: string
  className?: string
}

const rolePrefix: Record<DashRole, 'pt' | 'pv' | 'ad'> = {
  patient: 'pt',
  provider: 'pv',
  admin: 'ad',
}

function buildPath(values: readonly number[], width: number, height: number): { line: string; area: string } {
  if (values.length === 0) {
    return { line: '', area: '' }
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const step = values.length > 1 ? width / (values.length - 1) : 0
  const points = values.map((v, i) => {
    const x = i * step
    const y = height - ((v - min) / range) * height
    return { x, y }
  })
  const line = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(' ')
  const first = points[0]
  const last = points[points.length - 1]
  const area = `${line} L${last.x.toFixed(2)},${height} L${first.x.toFixed(2)},${height} Z`
  return { line, area }
}

interface FillGradientProps {
  id: string
  stroke: string
  area: string
}

function FillGradient({ id, stroke, area }: FillGradientProps) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.28" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
    </>
  )
}

export function Sparkline({
  role = 'provider',
  values,
  width = 96,
  height = 28,
  strokeWidth = 1.75,
  fill = true,
  ariaLabel,
  className = '',
}: SparklineProps) {
  const prefix = rolePrefix[role]
  const stroke = `var(--color-${prefix}-primary)`
  const { line, area } = buildPath(values, width, height)
  const viewBox = `0 0 ${width} ${height}`

  if (!line) {
    return <svg className={className} width={width} height={height} viewBox={viewBox} aria-hidden="true" />
  }

  const gradientId = `spark-${prefix}-${values.length}-${values[0] ?? 0}-${values[values.length - 1] ?? 0}`

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={viewBox}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : 'true'}
    >
      {fill ? <FillGradient id={gradientId} stroke={stroke} area={area} /> : null}
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
