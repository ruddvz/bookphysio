'use client'

import { useCallback, useState } from 'react'
import {
  Sparkles,
  AlertTriangle,
  Lightbulb,
  Activity,
  Loader2,
  Globe,
} from 'lucide-react'
import { SectionCard } from '@/components/dashboard/primitives'

interface AiInsights {
  summary: string
  summaryHi: string
  alerts: string[]
  alertsHi: string[]
  recommendations: string[]
  recommendationsHi: string[]
  healthScore: number
  keyMetrics: {
    appointmentTrend: string
    revenueStatus: string
    providerSupply: string
  }
  generatedAt: string
}

export function AdminAiInsightsCard() {
  const [insights, setInsights] = useState<AiInsights | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHindi, setShowHindi] = useState(false)

  const fetchInsights = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/ai-insights', { method: 'POST' })
      if (!res.ok) {
        throw new Error('Failed to generate insights. Please try again.')
      }
      const data = await res.json() as AiInsights
      setInsights(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate insights')
    } finally {
      setLoading(false)
    }
  }, [])

  const summary = showHindi ? insights?.summaryHi : insights?.summary
  const alerts = showHindi ? insights?.alertsHi : insights?.alerts
  const recommendations = showHindi ? insights?.recommendationsHi : insights?.recommendations

  const healthColor = (insights?.healthScore ?? 0) >= 70
    ? 'text-emerald-600'
    : (insights?.healthScore ?? 0) >= 40
      ? 'text-amber-600'
      : 'text-red-600'

  const healthBg = (insights?.healthScore ?? 0) >= 70
    ? 'bg-emerald-50'
    : (insights?.healthScore ?? 0) >= 40
      ? 'bg-amber-50'
      : 'bg-red-50'

  return (
    <SectionCard
      role="admin"
      title="AI Insights"
      action={
        insights
          ? { label: 'Refresh', onClick: fetchInsights }
          : undefined
      }
    >
      {!insights && !loading && !error && (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto rounded-[var(--sq-lg)] bg-[var(--color-ad-tile-3-bg)] flex items-center justify-center mb-4">
            <Sparkles size={28} className="text-[var(--color-ad-tile-3-fg)]" />
          </div>
          <h3 className="text-[16px] font-bold text-[var(--color-ad-ink)] mb-2">
            AI-powered platform analysis
          </h3>
          <p className="text-[13px] text-slate-500 mb-6 max-w-sm mx-auto">
            Get an instant AI summary of today&apos;s appointments, revenue, provider activity, and actionable recommendations — in English and Hindi.
          </p>
          <button
            type="button"
            onClick={fetchInsights}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-ad-primary)] text-white text-[13px] font-semibold shadow-sm hover:opacity-90 transition-opacity"
          >
            <Sparkles size={14} />
            Generate insights
          </button>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12 gap-3">
          <Loader2 size={20} className="animate-spin text-[var(--color-ad-primary)]" />
          <span className="text-[13px] text-slate-500">Analyzing platform data with AI…</span>
        </div>
      )}

      {error && (
        <div className="py-6 text-center">
          <AlertTriangle size={24} className="mx-auto text-amber-500 mb-2" />
          <p className="text-[13px] text-slate-600 mb-3">{error}</p>
          <button
            type="button"
            onClick={fetchInsights}
            className="text-[13px] font-semibold text-[var(--color-ad-primary)] hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {insights && !loading && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-[var(--sq-sm)] flex items-center justify-center ${healthBg}`}>
                <Activity size={18} className={healthColor} />
              </div>
              <div>
                <div className={`text-[20px] font-bold ${healthColor}`}>{insights.healthScore}/100</div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Health score</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHindi(!showHindi)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--sq-xs)] border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Globe size={12} />
              {showHindi ? 'English' : 'हिन्दी'}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Appointments', value: insights.keyMetrics.appointmentTrend, icon: '📊' },
              { label: 'Revenue', value: insights.keyMetrics.revenueStatus, icon: '💰' },
              { label: 'Supply', value: insights.keyMetrics.providerSupply, icon: '👥' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="rounded-[var(--sq-sm)] border border-[var(--color-ad-border-soft)] bg-[var(--color-ad-surface)] p-3 text-center">
                <div className="text-[16px] mb-1">{icon}</div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
                <div className="text-[13px] font-semibold text-[var(--color-ad-ink)] capitalize">{value}</div>
              </div>
            ))}
          </div>

          <div className="rounded-[var(--sq-sm)] border border-[var(--color-ad-border-soft)] bg-[var(--color-ad-surface)] p-4">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Summary</div>
            <p className="text-[13px] text-[var(--color-ad-ink)] leading-relaxed">{summary}</p>
          </div>

          {alerts && alerts.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={13} className="text-amber-500" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Alerts</span>
              </div>
              <div className="space-y-2">
                {alerts.map((alert, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-[var(--sq-sm)] border border-amber-200 bg-amber-50 p-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span className="text-[12px] text-amber-800">{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations && recommendations.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Lightbulb size={13} className="text-[var(--color-ad-primary)]" />
                <span className="text-[10px] font-bold text-[var(--color-ad-primary)] uppercase tracking-widest">Recommendations</span>
              </div>
              <div className="space-y-2">
                {recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2.5 rounded-[var(--sq-sm)] border border-[var(--color-ad-border-soft)] bg-[var(--color-ad-surface)] p-3">
                    <div className="w-5 h-5 rounded-full bg-[var(--color-ad-tile-1-bg)] flex items-center justify-center shrink-0 text-[10px] font-bold text-[var(--color-ad-primary)]">
                      {i + 1}
                    </div>
                    <span className="text-[12px] text-[var(--color-ad-ink)]">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-[10px] text-slate-400 text-right">
            Generated {new Date(insights.generatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
          </div>
        </div>
      )}
    </SectionCard>
  )
}
