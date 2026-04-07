'use client'

import { useState, useMemo, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft, Plus, Trash2, Loader2, Download, Receipt, AlertCircle,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { BillLineItem } from '@/lib/clinical/types'

interface ProviderProfile {
  full_name: string | null
  phone: string | null
  bio: string | null
  iap_registration_no: string | null
  consultation_fee_inr: number | null
}

async function fetchProfile(): Promise<ProviderProfile> {
  const res = await fetch('/api/profile')
  if (!res.ok) throw new Error('Failed to load profile')
  return res.json()
}

function formatRupees(n: number): string {
  return `\u20B9${n.toLocaleString('en-IN')}`
}

function defaultInvoiceNumber(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const seq = Math.floor(Math.random() * 9000 + 1000)
  return `BP-${yyyy}${mm}-${seq}`
}

function NewBillForm() {
  const searchParams = useSearchParams()
  const prefillName = searchParams.get('patient') ?? ''
  const prefillPhone = searchParams.get('phone') ?? ''

  const { data: profile } = useQuery({ queryKey: ['provider-profile'], queryFn: fetchProfile })

  const [patientName, setPatientName] = useState(prefillName)
  const [patientPhone, setPatientPhone] = useState(prefillPhone)
  const [patientAddress, setPatientAddress] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [invoiceNumber, setInvoiceNumber] = useState(() => defaultInvoiceNumber())
  const [includeGst, setIncludeGst] = useState(true)
  const [notes, setNotes] = useState('')
  const [providerSpecialization, setProviderSpecialization] = useState('')
  const [providerEmail, setProviderEmail] = useState('')
  const [providerClinicAddress, setProviderClinicAddress] = useState('')

  const defaultRate = profile?.consultation_fee_inr ?? 800

  const [lineItems, setLineItems] = useState<BillLineItem[]>([
    { description: 'Physiotherapy session', visit_count: 1, rate_inr: defaultRate },
  ])

  useEffect(() => {
    if (profile?.consultation_fee_inr && lineItems.length === 1 && lineItems[0].rate_inr === 800) {
      setLineItems([{ ...lineItems[0], rate_inr: profile.consultation_fee_inr }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.consultation_fee_inr])

  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const totals = useMemo(() => {
    const subtotal = lineItems.reduce((sum, l) => sum + l.visit_count * l.rate_inr, 0)
    const gst = includeGst ? Math.round(subtotal * 0.18) : 0
    return { subtotal, gst, total: subtotal + gst }
  }, [lineItems, includeGst])

  function updateLine(idx: number, patch: Partial<BillLineItem>) {
    setLineItems((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)))
  }
  function addLine() {
    setLineItems((prev) => [...prev, { description: '', visit_count: 1, rate_inr: defaultRate }])
  }
  function removeLine(idx: number) {
    setLineItems((prev) => prev.filter((_, i) => i !== idx))
  }

  const canSubmit =
    patientName.trim().length >= 2 &&
    invoiceNumber.trim().length > 0 &&
    lineItems.length > 0 &&
    lineItems.every((l) => l.description.trim().length > 0 && l.visit_count > 0 && l.rate_inr >= 0) &&
    !generating

  async function handleDownload() {
    if (!canSubmit) return
    setGenerating(true)
    setError(null)
    try {
      const res = await fetch('/api/provider/bills/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_name: patientName.trim(),
          patient_phone: patientPhone.trim() || null,
          patient_address: patientAddress.trim() || null,
          invoice_date: invoiceDate,
          invoice_number: invoiceNumber.trim(),
          line_items: lineItems,
          include_gst: includeGst,
          notes: notes.trim() || null,
          provider_name: profile?.full_name?.trim() || 'Provider',
          provider_phone: profile?.phone ?? null,
          provider_email: providerEmail.trim() || null,
          provider_specialization: providerSpecialization.trim() || null,
          provider_clinic_address: providerClinicAddress.trim() || null,
          provider_registration_no: profile?.iap_registration_no ?? null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to generate bill')
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bookphysio-invoice-${invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to generate bill')
    } finally {
      setGenerating(false)
    }
  }

  const labelClass = 'text-[12px] font-semibold text-slate-500 uppercase tracking-wider'
  const inputClass =
    'w-full px-4 py-3 border border-slate-200 rounded-lg text-[14px] text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 outline-none transition-all'

  return (
    <div className="max-w-[920px] mx-auto px-6 py-12 animate-in fade-in duration-500 delay-100 fill-mode-both">
      <Link
        href="/provider/earnings"
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-bp-body hover:text-bp-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Earnings
      </Link>

      <div className="mb-8">
        <h1 className="text-[32px] font-bold text-slate-900 tracking-tight mb-1 flex items-center gap-3">
          <Receipt className="w-8 h-8 text-emerald-600" />
          Generate Bill
        </h1>
        <p className="text-[15px] text-slate-600">
          Fill in the details below and download a real PDF invoice. You can charge multiple visits in one bill.
        </p>
      </div>

      <div className="bg-white rounded-[12px] border border-slate-200 shadow-sm p-8 space-y-8">
        {/* Invoice meta */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label htmlFor="bn" className={labelClass}>Invoice number</label>
            <input id="bn" type="text" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="bd" className={labelClass}>Invoice date</label>
            <input id="bd" type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className={inputClass} />
          </div>
        </section>

        {/* Provider context */}
        <section className="space-y-4 pt-6 border-t border-slate-100">
          <div>
            <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">From</h2>
            <p className="text-[13px] text-slate-500">Pulled from your profile. Add optional details below if you want them on the invoice.</p>
          </div>
          <div className="bg-slate-50 rounded-lg px-4 py-3 text-[13px] text-slate-700">
            <p className="font-semibold text-slate-900">{profile?.full_name ?? 'Loading…'}</p>
            {profile?.phone && <p>{profile.phone}</p>}
            {profile?.iap_registration_no && <p>Reg. No: {profile.iap_registration_no}</p>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="psp" className={labelClass}>Specialization (optional)</label>
              <input id="psp" type="text" value={providerSpecialization} onChange={(e) => setProviderSpecialization(e.target.value)} className={inputClass} placeholder="e.g. Sports Physiotherapist" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pem" className={labelClass}>Email (optional)</label>
              <input id="pem" type="email" value={providerEmail} onChange={(e) => setProviderEmail(e.target.value)} className={inputClass} placeholder="dr@example.com" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pcl" className={labelClass}>Clinic address (optional)</label>
            <input id="pcl" type="text" value={providerClinicAddress} onChange={(e) => setProviderClinicAddress(e.target.value)} className={inputClass} placeholder="Clinic address" />
          </div>
        </section>

        {/* Patient details */}
        <section className="space-y-4 pt-6 border-t border-slate-100">
          <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">Bill to</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="pn" className={labelClass}>Patient name *</label>
              <input id="pn" type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} className={inputClass} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="pp" className={labelClass}>Patient phone</label>
              <input id="pp" type="tel" value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)} className={inputClass} placeholder="+91 XXXXX XXXXX" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="pa" className={labelClass}>Patient address (optional)</label>
            <input id="pa" type="text" value={patientAddress} onChange={(e) => setPatientAddress(e.target.value)} className={inputClass} placeholder="Address" />
          </div>
        </section>

        {/* Line items */}
        <section className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-slate-900 uppercase tracking-wider">Line items</h2>
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="w-4 h-4" />
              Add line
            </button>
          </div>

          <div className="space-y-3">
            {lineItems.map((line, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-12 md:col-span-6 space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Description</label>
                  <input
                    type="text"
                    value={line.description}
                    onChange={(e) => updateLine(idx, { description: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Physiotherapy session"
                  />
                </div>
                <div className="col-span-4 md:col-span-2 space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Visits</label>
                  <input
                    type="number"
                    min={1}
                    value={line.visit_count}
                    onChange={(e) => updateLine(idx, { visit_count: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-5 md:col-span-3 space-y-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase">Rate (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={line.rate_inr}
                    onChange={(e) => updateLine(idx, { rate_inr: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className={inputClass}
                  />
                </div>
                <div className="col-span-3 md:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeLine(idx)}
                    disabled={lineItems.length === 1}
                    title="Remove line"
                    aria-label="Remove line"
                    className="p-3 text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-3 px-4 py-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
            <input type="checkbox" checked={includeGst} onChange={(e) => setIncludeGst(e.target.checked)} className="w-4 h-4 accent-emerald-600" />
            <span className="text-[14px] text-slate-900 font-medium">Include GST (18%)</span>
          </label>

          <div className="bg-slate-50 rounded-lg px-5 py-4 space-y-2">
            <div className="flex justify-between text-[14px]">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-900">{formatRupees(totals.subtotal)}</span>
            </div>
            {includeGst && (
              <div className="flex justify-between text-[14px]">
                <span className="text-slate-500">GST (18%)</span>
                <span className="font-semibold text-slate-900">{formatRupees(totals.gst)}</span>
              </div>
            )}
            <div className="flex justify-between text-[18px] pt-2 border-t border-slate-200">
              <span className="font-bold text-slate-900">Total</span>
              <span className="font-bold text-emerald-600">{formatRupees(totals.total)}</span>
            </div>
          </div>
        </section>

        <section className="space-y-1.5 pt-6 border-t border-slate-100">
          <label htmlFor="nt" className={labelClass}>Notes (optional)</label>
          <textarea id="nt" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className={`${inputClass} resize-none`} placeholder="Anything you want to add to the bill" />
        </section>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-600">{error}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Link
            href="/provider/earnings"
            className="flex-1 px-4 py-3 border border-slate-200 rounded-lg text-[14px] font-medium text-slate-900 hover:bg-slate-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleDownload}
            disabled={!canSubmit}
            className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-lg text-[14px] font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {generating ? 'Generating PDF…' : 'Download PDF'}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 italic text-center">
          BookPhysio.in does not provide healthcare services. This invoice is issued by you, the provider, directly to your patient.
        </p>
      </div>
    </div>
  )
}

export default function NewBillPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <NewBillForm />
    </Suspense>
  )
}
