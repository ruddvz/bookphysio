/**
 * Slice 16.18 — v2 patient records summary component tests.
 * Covers pure utility functions and the PatientRecordsSummaryV2 rendering paths.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, render, screen, within } from '@testing-library/react'
import type { PatientFacingRecord } from '@/lib/clinical/types'

// ── flag mock ──────────────────────────────────────────────────────────────
let mockV2 = false
vi.mock('@/hooks/useUiV2', () => ({ useUiV2: () => mockV2 }))
function setV2(value: boolean) { mockV2 = value }

import {
  buildVisitSparkline,
  groupRecordsByProvider,
  summaryCompletionCount,
  planCount,
  formatRecordDate,
  truncate,
} from './records-utils'
import { PatientRecordsSummaryV2 } from './PatientRecordsSummaryV2'

// ── helpers ────────────────────────────────────────────────────────────────
function makeRecord(overrides: Partial<PatientFacingRecord> & { visit_id: string }): PatientFacingRecord {
  return {
    visit_id: overrides.visit_id,
    visit_number: overrides.visit_number ?? 1,
    visit_date: overrides.visit_date ?? '2026-04-10',
    provider_name: overrides.provider_name ?? 'Priya Sharma',
    plan: overrides.plan ?? null,
    patient_summary: overrides.patient_summary ?? null,
  }
}

beforeEach(() => { mockV2 = false })
afterEach(() => cleanup())

// ── pure utility tests ─────────────────────────────────────────────────────
describe('truncate', () => {
  it('returns text unchanged when within limit', () =>
    expect(truncate('hello', 10)).toBe('hello'))
  it('truncates and appends ellipsis when over limit', () =>
    expect(truncate('hello world', 5)).toBe('hello…'))
  it('handles exact-length text without truncating', () =>
    expect(truncate('abcde', 5)).toBe('abcde'))
})

describe('formatRecordDate', () => {
  it('formats YYYY-MM-DD to en-IN locale string', () => {
    const result = formatRecordDate('2026-04-10')
    expect(result).toContain('2026')
    expect(result).toContain('Apr')
  })
})

describe('buildVisitSparkline', () => {
  it('returns an array of length equal to months param', () => {
    const values = buildVisitSparkline([], 6)
    expect(values).toHaveLength(6)
  })

  it('returns all zeros for an empty records array', () => {
    const values = buildVisitSparkline([], 6)
    expect(values.every((v) => v === 0)).toBe(true)
  })

  it('counts a visit in the correct current-month bucket', () => {
    const now = new Date()
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
    const values = buildVisitSparkline([makeRecord({ visit_id: 'r1', visit_date: thisMonth })], 6)
    expect(values[5]).toBe(1) // current month is the last bucket
  })

  it('ignores visits older than the window', () => {
    const values = buildVisitSparkline(
      [makeRecord({ visit_id: 'r1', visit_date: '2020-01-01' })],
      6,
    )
    expect(values.every((v) => v === 0)).toBe(true)
  })
})

describe('groupRecordsByProvider', () => {
  it('returns an empty array for no records', () =>
    expect(groupRecordsByProvider([])).toHaveLength(0))

  it('groups records by provider_name', () => {
    const records = [
      makeRecord({ visit_id: 'r1', provider_name: 'Alice' }),
      makeRecord({ visit_id: 'r2', provider_name: 'Bob' }),
      makeRecord({ visit_id: 'r3', provider_name: 'Alice' }),
    ]
    const groups = groupRecordsByProvider(records)
    expect(groups).toHaveLength(2)
    const alice = groups.find((g) => g.providerName === 'Alice')!
    expect(alice.visits).toHaveLength(2)
  })

  it('sorts providers by most-recent visit date descending', () => {
    const records = [
      makeRecord({ visit_id: 'r1', provider_name: 'Old', visit_date: '2026-01-01' }),
      makeRecord({ visit_id: 'r2', provider_name: 'New', visit_date: '2026-04-10' }),
    ]
    const groups = groupRecordsByProvider(records)
    expect(groups[0].providerName).toBe('New')
  })
})

describe('summaryCompletionCount', () => {
  it('returns 0 when no summaries', () =>
    expect(summaryCompletionCount([makeRecord({ visit_id: 'r1', patient_summary: null })])).toBe(0))
  it('counts only records with non-null summary', () => {
    const records = [
      makeRecord({ visit_id: 'r1', patient_summary: 'Good progress' }),
      makeRecord({ visit_id: 'r2', patient_summary: null }),
    ]
    expect(summaryCompletionCount(records)).toBe(1)
  })
})

describe('planCount', () => {
  it('counts only records with a non-null plan', () => {
    const records = [
      makeRecord({ visit_id: 'r1', plan: 'Do exercises' }),
      makeRecord({ visit_id: 'r2', plan: null }),
    ]
    expect(planCount(records)).toBe(1)
  })
})

// ── component rendering tests ──────────────────────────────────────────────
describe('PatientRecordsSummaryV2', () => {
  it('returns null in v1 mode', () => {
    setV2(false)
    const { container } = render(
      <PatientRecordsSummaryV2 records={[makeRecord({ visit_id: 'r1' })]} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('returns null when records list is empty in v2 mode', () => {
    setV2(true)
    const { container } = render(<PatientRecordsSummaryV2 records={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders data-ui-version="v2" in v2 mode', () => {
    setV2(true)
    render(<PatientRecordsSummaryV2 records={[makeRecord({ visit_id: 'r1' })]} />)
    expect(screen.getByTestId('patient-records-summary-v2')).toHaveAttribute('data-ui-version', 'v2')
  })

  it('renders the visit frequency sparkline card with total visit count', () => {
    setV2(true)
    const records = [
      makeRecord({ visit_id: 'r1' }),
      makeRecord({ visit_id: 'r2' }),
    ]
    render(<PatientRecordsSummaryV2 records={records} />)
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText(/total visits/i)).toBeInTheDocument()
  })

  it('shows summary-count and plan-count stats', () => {
    setV2(true)
    const records = [
      makeRecord({ visit_id: 'r1', patient_summary: 'Good progress', plan: 'Do squats' }),
      makeRecord({ visit_id: 'r2', patient_summary: null, plan: null }),
    ]
    render(<PatientRecordsSummaryV2 records={records} />)
    expect(screen.getByTestId('summary-count').textContent).toBe('1')
    expect(screen.getByTestId('plan-count').textContent).toBe('1')
  })

  it('renders one record-tile per record', () => {
    setV2(true)
    const records = [
      makeRecord({ visit_id: 'r1', visit_number: 1, visit_date: '2026-04-10' }),
      makeRecord({ visit_id: 'r2', visit_number: 2, visit_date: '2026-03-05' }),
    ]
    render(<PatientRecordsSummaryV2 records={records} />)
    expect(screen.getAllByTestId('record-tile')).toHaveLength(2)
  })

  it('groups records under a single provider header', () => {
    setV2(true)
    const records = [
      makeRecord({ visit_id: 'r1', provider_name: 'Alice', visit_number: 1, visit_date: '2026-04-10' }),
      makeRecord({ visit_id: 'r2', provider_name: 'Alice', visit_number: 2, visit_date: '2026-03-01' }),
    ]
    render(<PatientRecordsSummaryV2 records={records} />)
    const list = screen.getByTestId('provider-groups')
    expect(within(list).getAllByRole('listitem')).toHaveLength(1) // 1 provider group
    expect(screen.getAllByTestId('record-tile')).toHaveLength(2)
  })

  it('renders a Plan badge only on records that have a plan', () => {
    setV2(true)
    const records = [
      makeRecord({ visit_id: 'r1', plan: 'Exercise daily', visit_date: '2026-04-10' }),
      makeRecord({ visit_id: 'r2', plan: null, visit_date: '2026-03-05' }),
    ]
    render(<PatientRecordsSummaryV2 records={records} />)
    expect(screen.getAllByText('Plan')).toHaveLength(1)
  })

  it('shows patient_summary excerpt when available', () => {
    setV2(true)
    render(
      <PatientRecordsSummaryV2
        records={[makeRecord({ visit_id: 'r1', patient_summary: 'Great session today.' })]}
      />,
    )
    expect(screen.getByText('Great session today.')).toBeInTheDocument()
  })

  it('shows fallback text when no summary is shared', () => {
    setV2(true)
    render(
      <PatientRecordsSummaryV2
        records={[makeRecord({ visit_id: 'r1', patient_summary: null })]}
      />,
    )
    expect(screen.getByText(/no summary shared/i)).toBeInTheDocument()
  })

  it('truncates a long summary to the configured limit', () => {
    setV2(true)
    const long = 'A'.repeat(200)
    render(
      <PatientRecordsSummaryV2
        records={[makeRecord({ visit_id: 'r1', patient_summary: long })]}
      />,
    )
    const el = screen.getByText(/A+…/)
    expect(el.textContent!.endsWith('…')).toBe(true)
    expect(el.textContent!.length).toBeLessThan(200)
  })
})
