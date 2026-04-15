"use client"

import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Plus,
  Trash2,
  Loader2,
  Download,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { BillLineItem } from '@/lib/clinical/types'
import { formatIndianPhone, stripPhoneFormat, toIndianE164 } from '@/lib/format-phone'
import {
  PageHeader,
  SectionCard,
} from '@/components/dashboard/primitives'

interface ProviderProfile {
  full_name: string | null
  phone: string | null
  bio: string | null
  iap_registration_no: string | null
  consultation_fee_inr: number | null
}

interface PatientPrefillResponse {
  profile: {
    patient_name: string
    patient_phone: string | null
  }
}

async function fetchProfile(): Promise<ProviderProfile> {
  const res = await fetch('/api/profile')
  if (!res.ok) throw new Error('Failed to load profile')
  return res.json()
}

async function fetchPatientPrefill(profileId: string): Promise<PatientPrefillResponse> {
  const res = await fetch(`/api/provider/patients/${profileId}?billingPrefill=1`)
  if (!res.ok) throw new Error('Failed to load patient details')
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
  const profileId = searchParams.get('profileId')

  const { data: profile } = useQuery({ queryKey: ['provider-profile'], queryFn: fetchProfile })
  const { data: patientPrefill } = useQuery({
    queryKey: ['provider-bill-prefill', profileId],
    queryFn: () => fetchPatientPrefill(profileId as string),
    enabled: Boolean(profileId),
  })
  const prefillProfile = patientPrefill?.profile

  const [patientName, setPatientName] = useState('')
  const [patientPhone, setPatientPhone] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [invoiceNumber, setInvoiceNumber] = useState(() => defaultInvoiceNumber())
  const [includeGst, setIncludeGst] = useState(true)
  const [notes, setNotes] = useState('')
  const [providerSpecialization, setProviderSpecialization] = useState('')
  const [providerEmail, setProviderEmail] = useState('')
  const patientAddress = ''
  const providerClinicAddress = ''

  const defaultRate = profile?.consultation_fee_inr ?? 800

  const [lineItems, setLineItems] = useState<BillLineItem[]>([
    { description: 'Physiotherapy session', visit_count: 1, rate_inr: defaultRate },
  ])

  useEffect(() => {
    const consultationFee = profile?.consultation_fee_inr
    if (consultationFee == null) return

    setLineItems((current) => {
      if (current.length !== 1 || current[0].rate_inr !== 800) {
        return current
      }

      return [{ ...current[0], rate_inr: consultationFee }]
    })
  }, [profile?.consultation_fee_inr])

  useEffect(() => {
    if (!prefillProfile) return

    setPatientName((current) => current || prefillProfile.patient_name)
    setPatientPhone((current) => current || prefillProfile.patient_phone || '')
  }, [prefillProfile])

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
          patient_phone: toIndianE164(patientPhone),
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

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
      <PageHeader
        role="provider"
        kicker="FINANCIALS"
        title="Generate Invoice"
        subtitle="Produce a professional, clinical-grade digital invoice for your sessions"
        action={{
          label: generating ? 'Finalizing PDF...' : 'Generate PDF',
          icon: generating ? Loader2 : Download,
          onClick: handleDownload,
          disabled: !canSubmit
        }}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,400px] gap-6">
        <div className="space-y-6 lg:space-y-10">
          <SectionCard role="provider" title="Invoice Registry Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="invoice-number" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Invoice Number</label>
                <input
                  id="invoice-number"
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-[var(--color-pv-primary)] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="invoice-date" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Creation Date</label>
                <input
                  id="invoice-date"
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-[var(--color-pv-primary)] outline-none transition-all"
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard role="provider" title="Issuing Provider" kicker="PRACTICE IDENTITY">
            <div className="space-y-6">
              <div className="p-5 bg-[var(--color-pv-track-bg)] border border-slate-100 rounded-[var(--sq-lg)]">
                <div className="text-[16px] font-bold text-slate-900 mb-1">{profile?.full_name ?? 'Practitioner'}</div>
                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                  {profile?.iap_registration_no ? `IAP Reg: ${profile.iap_registration_no}` : 'Verified Clinical Practitioner'}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Specialization (Optional)</label>
                  <input
                    type="text"
                    value={providerSpecialization}
                    onChange={(e) => setProviderSpecialization(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-[var(--color-pv-primary)] outline-none transition-all"
                    placeholder="e.g. Sports Physiotherapist"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    value={providerEmail}
                    onChange={(e) => setProviderEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-[var(--color-pv-primary)] outline-none transition-all"
                    placeholder="clinic@example.com"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard role="provider" title="Target Clinical Profile" kicker="PATIENT DATA">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="patient-full-name" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Patient Full Name *</label>
                <input
                  id="patient-full-name"
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[14px] font-bold text-slate-900 focus:bg-white focus:border-[var(--color-pv-primary)] outline-none transition-all"
                  placeholder="Full legal name"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="patient-contact-number" className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                <div className="flex bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] overflow-hidden focus-within:bg-white focus-within:border-[var(--color-pv-primary)] transition-all">
                  <span className="px-4 py-3 text-[14px] font-bold text-slate-400 bg-slate-100/50 border-r border-slate-200 flex items-center shrink-0">+91</span>
                  <input
                    id="patient-contact-number"
                    type="tel"
                    maxLength={11}
                    value={formatIndianPhone(patientPhone)}
                    onChange={(e) => setPatientPhone(stripPhoneFormat(e.target.value))}
                    className="flex-1 px-4 py-3 bg-transparent text-[14px] font-bold text-slate-900 outline-none"
                    placeholder="98765 43210"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            role="provider"
            title="Clinical Ledger Items"
            action={{ label: 'Append Line', icon: Plus, onClick: addLine }}
          >
            <div className="space-y-4">
              {lineItems.map((line, idx) => (
                <div key={idx} className="flex flex-col md:grid md:grid-cols-[1fr,100px,140px,44px] gap-4 p-5 bg-slate-50 border border-slate-100 rounded-[var(--sq-lg)] relative">
                  <div className="space-y-2">
                    <label htmlFor={`line-description-${idx}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                    <input
                      id={`line-description-${idx}`}
                      type="text"
                      value={line.description}
                      onChange={(e) => updateLine(idx, { description: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[var(--sq-xs)] text-[13px] font-bold text-slate-900 focus:border-[var(--color-pv-primary)] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`line-quantity-${idx}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty</label>
                    <input
                      id={`line-quantity-${idx}`}
                      type="number"
                      value={line.visit_count}
                      onChange={(e) => updateLine(idx, { visit_count: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[var(--sq-xs)] text-[13px] font-bold text-slate-900 focus:border-[var(--color-pv-primary)] outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor={`line-rate-${idx}`} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rate (₹)</label>
                    <input
                      id={`line-rate-${idx}`}
                      type="number"
                      value={line.rate_inr}
                      onChange={(e) => updateLine(idx, { rate_inr: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-[var(--sq-xs)] text-[13px] font-bold text-slate-900 focus:border-[var(--color-pv-primary)] outline-none transition-all"
                    />
                  </div>
                  <div className="flex items-end pb-1.5 justify-end">
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(idx)}
                        aria-label={`Remove line item ${idx + 1}`}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard role="provider" title="Persistence Summary">
             <div className="bg-[var(--color-pv-ink)] rounded-[var(--sq-lg)] p-6 text-white space-y-6">
                <div className="space-y-4">
                   <div className="flex justify-between items-center text-[13px] text-indigo-100/60">
                      <span>Registry Subtotal</span>
                      <span className="font-bold text-white">{formatRupees(totals.subtotal)}</span>
                   </div>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <input
                           id="apply-gst"
                           type="checkbox"
                           checked={includeGst}
                           onChange={(e) => setIncludeGst(e.target.checked)}
                           className="w-4 h-4 rounded border-white/20 bg-white/10 text-[var(--color-pv-primary)]"
                         />
                         <label htmlFor="apply-gst" className="text-[13px] text-indigo-100/60">Apply GST (18%)</label>
                      </div>
                      {includeGst && <span className="text-[13px] font-bold text-indigo-300">+{formatRupees(totals.gst)}</span>}
                   </div>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                   <div>
                      <div className="text-[10px] font-bold text-indigo-100/40 uppercase tracking-widest mb-1">Settlement Total</div>
                      <div className="text-[32px] font-bold leading-none">{formatRupees(totals.total)}</div>
                   </div>
                   {totals.total > 0 && <CheckCircle2 className="text-indigo-400/30" size={32} />}
                </div>
                <button
                  onClick={handleDownload}
                  disabled={!canSubmit || generating}
                  className="w-full py-4 bg-[var(--color-pv-primary)] hover:bg-[var(--color-pv-primary-hover)] text-white rounded-[var(--sq-sm)] text-[14px] font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                   {generating ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                   {generating ? 'Finalizing PDF...' : 'Generate PDF'}
                </button>
             </div>
          </SectionCard>

          <SectionCard role="provider" title="Additional Context">
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Clinical Notes</label>
                   <textarea
                     rows={4}
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[var(--sq-sm)] text-[13px] font-bold text-slate-900 focus:bg-white outline-none resize-none"
                     placeholder="Instructions or clinical observations..."
                   />
                </div>
             </div>
          </SectionCard>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-[var(--sq-sm)] flex items-center gap-3 text-rose-700">
               <AlertCircle size={18} />
               <p className="text-[12px] font-bold">{error}</p>
            </div>
          )}

          <p className="text-[11px] text-slate-400 text-center font-bold px-4">
             Invoices are generated locally. Clinical persistence is the responsibility of the provider.
          </p>
        </div>
      </div>
    </div>
  )
}

function NewBillPageContent() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-40">
           <Loader2 className="w-12 h-12 text-[var(--color-pv-primary)] animate-spin" />
           <p className="mt-4 text-[13px] font-bold text-slate-400 uppercase tracking-widest">Waking Billing Engine...</p>
        </div>
      }
    >
      <NewBillForm />
    </Suspense>
  )
}

export default function NewBillPage() {
   return <NewBillPageContent />
}
