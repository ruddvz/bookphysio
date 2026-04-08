import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import type { GenerateBillInput } from '@/lib/clinical/types'

const TEAL = '#00766C'
const BORDER = '#E5E5E5'
const BODY = '#333333'
const MUTED = '#6B7280'
const FOOTER_GRAY = '#999999'

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BODY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: TEAL,
    paddingBottom: 10,
    marginBottom: 20,
  },
  brandBlock: {
    justifyContent: 'flex-end',
  },
  brandLogo: {
    width: 180,
    height: 34,
    marginBottom: 4,
  },
  brand: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: TEAL },
  brandSub: { fontSize: 9, color: MUTED, marginTop: 2 },
  invoiceLabel: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: BODY,
    letterSpacing: 2,
  },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  col: { width: '48%' },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  fromName: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: BODY, marginBottom: 2 },
  fromLine: { fontSize: 9, color: BODY, marginBottom: 1 },
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    marginBottom: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tableRowLast: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  th: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: MUTED, textTransform: 'uppercase' },
  td: { fontSize: 10, color: BODY },
  colDescription: { width: '52%' },
  colVisits: { width: '14%', textAlign: 'center' },
  colRate: { width: '17%', textAlign: 'right' },
  colAmount: { width: '17%', textAlign: 'right' },
  totals: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 14,
  },
  totalsBox: { width: '45%' },
  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  totalsLabel: { fontSize: 10, color: MUTED },
  totalsValue: { fontSize: 10, color: BODY },
  totalsGrand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginTop: 4,
  },
  totalsGrandLabel: { fontSize: 12, fontFamily: 'Helvetica-Bold', color: BODY },
  totalsGrandValue: { fontSize: 14, fontFamily: 'Helvetica-Bold', color: TEAL },
  notes: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  notesText: { fontSize: 9, color: BODY, lineHeight: 1.4 },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 7,
    color: FOOTER_GRAY,
    lineHeight: 1.5,
  },
})

interface ComputedTotals {
  subtotal: number
  gst: number
  total: number
  lines: Array<{
    description: string
    visit_count: number
    rate_inr: number
    amount: number
  }>
}

function computeTotals(input: GenerateBillInput): ComputedTotals {
  const lines = input.line_items.map((item) => ({
    description: item.description,
    visit_count: item.visit_count,
    rate_inr: item.rate_inr,
    amount: item.visit_count * item.rate_inr,
  }))
  const subtotal = lines.reduce((sum, l) => sum + l.amount, 0)
  const gst = input.include_gst ? Math.round(subtotal * 0.18) : 0
  return { subtotal, gst, total: subtotal + gst, lines }
}

function formatRupees(amount: number): string {
  return `\u20B9${amount.toLocaleString('en-IN')}`
}

function formatDateLong(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface BillPdfDocumentProps {
  bill: GenerateBillInput
  logoSrc?: string | null
}

export function BillPdfDocument({ bill, logoSrc = null }: BillPdfDocumentProps) {
  const totals = computeTotals(bill)

  return (
    <Document title={`BookPhysio Invoice ${bill.invoice_number}`} author="BookPhysio.in">
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.brandBlock}>
            {logoSrc ? (
              /* eslint-disable-next-line jsx-a11y/alt-text */
              <Image src={logoSrc} style={styles.brandLogo} />
            ) : <Text style={styles.brand}>BookPhysio.in</Text>}
            <Text style={styles.brandSub}>Physiotherapy invoice</Text>
          </View>
          <Text style={styles.invoiceLabel}>INVOICE</Text>
        </View>

        <View style={styles.twoCol}>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>From</Text>
            <Text style={styles.fromName}>
              {bill.provider_name}
              {bill.provider_specialization ? `, ${bill.provider_specialization}` : ''}
            </Text>
            {bill.provider_phone && <Text style={styles.fromLine}>{bill.provider_phone}</Text>}
            {bill.provider_email && <Text style={styles.fromLine}>{bill.provider_email}</Text>}
            {bill.provider_clinic_address && (
              <Text style={styles.fromLine}>{bill.provider_clinic_address}</Text>
            )}
            {bill.provider_registration_no && (
              <Text style={styles.fromLine}>Reg. No: {bill.provider_registration_no}</Text>
            )}
          </View>
          <View style={styles.col}>
            <Text style={styles.sectionLabel}>Invoice Details</Text>
            <Text style={styles.fromLine}>Invoice #: {bill.invoice_number}</Text>
            <Text style={styles.fromLine}>Date: {formatDateLong(bill.invoice_date)}</Text>
          </View>
        </View>

        <View style={styles.twoCol}>
          <View style={{ width: '100%' }}>
            <Text style={styles.sectionLabel}>Bill To</Text>
            <Text style={styles.fromName}>{bill.patient_name}</Text>
            {bill.patient_phone && <Text style={styles.fromLine}>{bill.patient_phone}</Text>}
            {bill.patient_address && <Text style={styles.fromLine}>{bill.patient_address}</Text>}
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.th, styles.colDescription]}>Description</Text>
            <Text style={[styles.th, styles.colVisits]}>Visits</Text>
            <Text style={[styles.th, styles.colRate]}>Rate</Text>
            <Text style={[styles.th, styles.colAmount]}>Amount</Text>
          </View>
          {totals.lines.map((line, idx) => {
            const isLast = idx === totals.lines.length - 1
            const rowStyle = isLast ? styles.tableRowLast : styles.tableRow
            return (
              <View key={idx} style={rowStyle}>
                <Text style={[styles.td, styles.colDescription]}>{line.description}</Text>
                <Text style={[styles.td, styles.colVisits]}>{line.visit_count}</Text>
                <Text style={[styles.td, styles.colRate]}>{formatRupees(line.rate_inr)}</Text>
                <Text style={[styles.td, styles.colAmount]}>{formatRupees(line.amount)}</Text>
              </View>
            )
          })}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalsBox}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>{formatRupees(totals.subtotal)}</Text>
            </View>
            {bill.include_gst && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>GST (18%)</Text>
                <Text style={styles.totalsValue}>{formatRupees(totals.gst)}</Text>
              </View>
            )}
            <View style={styles.totalsGrand}>
              <Text style={styles.totalsGrandLabel}>TOTAL</Text>
              <Text style={styles.totalsGrandValue}>{formatRupees(totals.total)}</Text>
            </View>
          </View>
        </View>

        {bill.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionLabel}>Notes</Text>
            <Text style={styles.notesText}>{bill.notes}</Text>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            This invoice is issued directly by the healthcare provider. BookPhysio.in facilitates
            discovery and communication only and is not a party to this transaction.
          </Text>
        </View>
      </Page>
    </Document>
  )
}
