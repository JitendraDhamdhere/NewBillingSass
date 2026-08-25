'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Printer,
  Share2,
  Lock,
  Edit,
  Ban,
  Building,
  QrCode,
  AlertTriangle,
  Receipt,
  FileText,
} from 'lucide-react'
import { cancelInvoice, createCreditNote } from '@/lib/services/invoice-service'
import { buildUpiPaymentUri, generateUpiQrDataUrl } from '@/lib/validations/upi'
import { renderWhatsAppTemplate, buildWhatsAppShareUrl, DEFAULT_WHATSAPP_TEMPLATES } from '@/lib/validations/whatsapp'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface InvoiceDetailProps {
  invoice: any
  business: any
  businessId: string
}

export default function InvoiceDetailClient({ invoice: initialInvoice, business, businessId }: InvoiceDetailProps) {
  const router = useRouter()
  const [invoice, setInvoice] = useState(initialInvoice)
  const [printLayout, setPrintLayout] = useState<'A4' | 'THERMAL'>('A4')

  // UPI QR Data URL State
  const [upiQrDataUrl, setUpiQrDataUrl] = useState<string>('')

  // Cancel modal state
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  // Credit note modal state
  const [isCreditNoteModalOpen, setIsCreditNoteModalOpen] = useState(false)
  const [cnAmount, setCnAmount] = useState(invoice.balance_due || invoice.grand_total)
  const [cnReason, setCnReason] = useState('')
  const [cnError, setCnError] = useState('')
  const [cnLoading, setCnLoading] = useState(false)

  const isEditLocked = invoice.paid_amount > 0

  // Regenerate Dynamic UPI QR Code whenever invoice balance_due or business upi_id changes
  useEffect(() => {
    async function updateQr() {
      const upiVpa = business.upi_id
      if (upiVpa && invoice.balance_due > 0 && invoice.status !== 'CANCELLED') {
        const upiUri = buildUpiPaymentUri({
          vpa: upiVpa,
          payeeName: business.upi_name || business.name,
          amount: Number(invoice.balance_due),
          refNumber: invoice.invoice_number,
          note: `Payment for Invoice ${invoice.invoice_number}`,
        })
        const qrUrl = await generateUpiQrDataUrl(upiUri)
        setUpiQrDataUrl(qrUrl)
      } else {
        setUpiQrDataUrl('')
      }
    }
    updateQr()
  }, [invoice.balance_due, invoice.invoice_number, invoice.status, business.upi_id, business.upi_name, business.name])

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsAppShare = () => {
    const templates = business.whatsapp_templates || DEFAULT_WHATSAPP_TEMPLATES
    const tpl = templates.invoice || DEFAULT_WHATSAPP_TEMPLATES.invoice

    const messageText = renderWhatsAppTemplate(tpl, {
      customer_name: invoice.customer_name || 'Customer',
      invoice_number: invoice.invoice_number,
      amount: invoice.grand_total,
      due_amount: invoice.balance_due,
      due_date: invoice.due_date || 'On Receipt',
      business_name: business.name,
      upi_id: business.upi_id || 'Contact Business',
    })

    const shareUrl = buildWhatsAppShareUrl(invoice.customer_mobile, messageText)
    window.open(shareUrl, '_blank')
  }

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCancelLoading(true)
    setCancelError('')

    const res = await cancelInvoice(businessId, invoice.id, cancelReason)
    if (res.success) {
      setInvoice((prev: any) => ({
        ...prev,
        status: 'CANCELLED',
        cancellation_reason: cancelReason,
        balance_due: 0,
      }))
      setIsCancelModalOpen(false)
      setCancelReason('')
    } else if (res.error) {
      setCancelError(res.error)
    }
    setCancelLoading(false)
  }

  const handleCreditNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCnLoading(true)
    setCnError('')

    const res = await createCreditNote(businessId, {
      invoice_id: invoice.id,
      customer_id: invoice.customer_id,
      amount: Number(cnAmount),
      reason: cnReason,
    })

    if (res.success && res.data) {
      setInvoice((prev: any) => ({
        ...prev,
        creditNotes: [...(prev.creditNotes || []), res.data],
      }))
      setIsCreditNoteModalOpen(false)
      setCnReason('')
    } else if (res.error) {
      setCnError(res.error)
    }
    setCnLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:max-w-none print:p-0">
      {/* Top Action Bar (Hidden on print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/invoices')} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-mono">{invoice.invoice_number}</h2>
            <p className="text-xs text-muted-foreground">Issued on {invoice.invoice_date}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Print Layout Toggle */}
          <div className="border rounded p-0.5 flex text-xs">
            <button
              onClick={() => setPrintLayout('A4')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                printLayout === 'A4' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              A4 Layout
            </button>
            <button
              onClick={() => setPrintLayout('THERMAL')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                printLayout === 'THERMAL' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Thermal 80mm
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1.5 text-xs">
            <Printer className="h-4 w-4" /> Print / PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <Share2 className="h-4 w-4" /> WhatsApp
          </Button>

          {invoice.status !== 'CANCELLED' && (
            <>
              {isEditLocked ? (
                <div title="Item editing locked due to recorded payments" className="inline-block">
                  <Button variant="secondary" size="sm" disabled className="flex items-center gap-1.5 text-xs opacity-70">
                    <Lock className="h-3.5 w-3.5" /> Edit Locked
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => alert('Edit feature active')} className="flex items-center gap-1.5 text-xs">
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreditNoteModalOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                + Credit Note
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsCancelModalOpen(true)}
                className="flex items-center gap-1.5 text-xs"
              >
                <Ban className="h-3.5 w-3.5" /> Cancel Bill
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Lock / Warning Notification Banner */}
      {isEditLocked && invoice.status !== 'CANCELLED' && (
        <div className="p-3 text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-md text-amber-800 dark:text-amber-300 flex items-center gap-2 print:hidden">
          <Lock className="h-4 w-4 shrink-0" />
          <span>
            <strong>Item-level Editing Locked:</strong> Payments have been recorded for this bill. Item line edits are disabled per FRD rules.
          </span>
        </div>
      )}

      {invoice.status === 'CANCELLED' && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-md text-rose-800 dark:text-rose-300 space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Ban className="h-4 w-4" /> INVOICE CANCELLED
          </div>
          {invoice.cancellation_reason && (
            <p className="text-xs">Reason: {invoice.cancellation_reason}</p>
          )}
        </div>
      )}

      {/* STANDARD A4 PRINTABLE LAYOUT */}
      {printLayout === 'A4' && (
        <Card className="p-8 space-y-8 bg-background border shadow-md print:shadow-none print:border-none print:p-0">
          {/* Business Header */}
          <div className="flex justify-between items-start border-b pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Building className="h-6 w-6 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
              </div>
              {business.address && <p className="text-xs text-muted-foreground">{business.address}</p>}
              {business.mobile && <p className="text-xs text-muted-foreground">Ph: {business.mobile}</p>}
              {business.email && <p className="text-xs text-muted-foreground">{business.email}</p>}
            </div>

            <div className="text-right space-y-1">
              <h2 className="text-xl font-bold font-mono text-primary">TAX INVOICE</h2>
              <p className="font-mono text-sm font-semibold">{invoice.invoice_number}</p>
              <p className="text-xs text-muted-foreground">Date: {invoice.invoice_date}</p>
              {invoice.due_date && <p className="text-xs text-muted-foreground">Due: {invoice.due_date}</p>}
              <div className="pt-1">
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded border bg-secondary">
                  Status: {invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-md border">
            <div>
              <span className="text-xs text-muted-foreground uppercase font-semibold">Billed To:</span>
              <p className="font-bold text-foreground mt-1">
                {invoice.customer_name || (invoice.is_walk_in ? 'Walk-in Customer' : 'Customer')}
              </p>
              {invoice.customer_mobile && <p className="text-xs text-muted-foreground">Ph: {invoice.customer_mobile}</p>}
              {invoice.customer?.address && <p className="text-xs text-muted-foreground">{invoice.customer.address}</p>}
            </div>
            <div className="text-right space-y-1 text-xs">
              <span className="text-muted-foreground uppercase font-semibold">Billing Details:</span>
              <p className="text-muted-foreground">Numbering Mode: {invoice.numbering_mode}</p>
              <p className="text-muted-foreground">FY: {invoice.fy_year}</p>
            </div>
          </div>

          {/* Invoice Line Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs uppercase font-semibold text-muted-foreground">
                  <th className="p-3">#</th>
                  <th className="p-3">Item / Service Description</th>
                  <th className="p-3 text-right">Qty</th>
                  <th className="p-3 text-right">Rate (₹)</th>
                  <th className="p-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoice.items?.map((item: any, idx: number) => (
                  <tr key={item.id || idx}>
                    <td className="p-3 text-xs text-muted-foreground font-mono">{idx + 1}</td>
                    <td className="p-3 font-medium">{item.description}</td>
                    <td className="p-3 text-right font-mono">{Number(item.quantity).toFixed(2)}</td>
                    <td className="p-3 text-right font-mono">₹{Number(item.unit_price).toFixed(2)}</td>
                    <td className="p-3 text-right font-mono font-semibold">₹{Number(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals, UPI QR & Footer Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t gap-6">
            {/* Dynamic UPI QR Code Box */}
            <div className="space-y-3 max-w-xs">
              {upiQrDataUrl ? (
                <div className="p-3 border rounded-lg bg-muted/20 text-center space-y-2">
                  <span className="text-[11px] font-bold uppercase text-purple-600 dark:text-purple-400 flex items-center justify-center gap-1">
                    <QrCode className="h-3.5 w-3.5" /> Scan & Pay via UPI
                  </span>
                  <img src={upiQrDataUrl} alt="UPI Payment QR Code" className="w-40 h-40 mx-auto rounded border bg-white p-1" />
                  <p className="text-[10px] font-mono text-muted-foreground">
                    Pay <strong>₹{Number(invoice.balance_due).toFixed(2)}</strong> to <code>{business.upi_id}</code>
                  </p>
                  <p className="text-[9px] text-muted-foreground">Scan with GPay / PhonePe / Paytm</p>
                </div>
              ) : (
                invoice.balance_due > 0 &&
                invoice.status !== 'CANCELLED' && (
                  <div className="p-3 border rounded text-[11px] text-muted-foreground bg-muted/10 print:hidden">
                    <p className="font-semibold text-foreground">UPI QR Code not configured</p>
                    <p>Add your UPI VPA in <Link href="/dashboard/settings" className="text-primary underline">Settings</Link> to show dynamic QR.</p>
                  </div>
                )
              )}
            </div>

            <div className="w-full sm:w-64 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono">₹{Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              {Number(invoice.discount_amount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-mono">-₹{Number(invoice.discount_amount).toFixed(2)}</span>
                </div>
              )}
              {Number(invoice.tax_amount) > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax:</span>
                  <span className="font-mono">+₹{Number(invoice.tax_amount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t pt-2 text-foreground">
                <span>Grand Total:</span>
                <span className="font-mono text-primary">₹{Number(invoice.grand_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-semibold">
                <span>Paid Amount:</span>
                <span className="font-mono">₹{Number(invoice.paid_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold border-t pt-1">
                <span>Balance Due:</span>
                <span className="font-mono">₹{Number(invoice.balance_due).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* THERMAL 80mm PRINTABLE LAYOUT */}
      {printLayout === 'THERMAL' && (
        <div className="max-w-[320px] mx-auto p-4 bg-white text-black font-mono text-xs space-y-4 border shadow-md print:border-none print:shadow-none print:p-0">
          <div className="text-center space-y-1 border-b border-black pb-3">
            <h1 className="font-bold text-base uppercase">{business.name}</h1>
            {business.address && <p className="text-[10px]">{business.address}</p>}
            {business.mobile && <p className="text-[10px]">Ph: {business.mobile}</p>}
            <div className="font-bold pt-1 text-sm">INVOICE: {invoice.invoice_number}</div>
            <p className="text-[10px]">Date: {invoice.invoice_date}</p>
          </div>

          <div className="border-b border-black pb-2 text-[11px]">
            <p><strong>Customer:</strong> {invoice.customer_name || 'Walk-in'}</p>
            {invoice.customer_mobile && <p>Ph: {invoice.customer_mobile}</p>}
          </div>

          {/* Line items */}
          <div className="space-y-1 text-[11px] border-b border-black pb-2">
            <div className="flex justify-between font-bold text-[10px] border-b border-black pb-0.5">
              <span>Item</span>
              <span>Amt (₹)</span>
            </div>
            {invoice.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between text-[11px]">
                <span className="truncate max-w-[180px]">{item.description} (x{item.quantity})</span>
                <span>₹{Number(item.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-[11px] border-b border-black pb-2">
            <div className="flex justify-between">
              <span>Grand Total:</span>
              <span className="font-bold">₹{Number(invoice.grand_total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span>₹{Number(invoice.paid_amount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-xs pt-1 border-t border-dashed border-black">
              <span>Balance Due:</span>
              <span>₹{Number(invoice.balance_due).toFixed(2)}</span>
            </div>
          </div>

          {/* Thermal UPI QR */}
          {upiQrDataUrl && (
            <div className="text-center space-y-1 pt-1">
              <span className="text-[10px] font-bold block">SCAN TO PAY UPI</span>
              <img src={upiQrDataUrl} alt="Thermal UPI QR" className="w-32 h-32 mx-auto border" />
              <p className="text-[9px]">{business.upi_id}</p>
            </div>
          )}

          <div className="text-center text-[10px] pt-2 border-t border-black">
            Thank you for your visit!
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-destructive flex items-center gap-2">
              <Ban className="h-5 w-5" /> Cancel Invoice
            </h3>
            {cancelError && <p className="text-xs text-destructive">{cancelError}</p>}
            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold">Mandatory Cancellation Reason</label>
                <textarea
                  required
                  placeholder="Enter reason..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full mt-1 min-h-[80px] p-2 border rounded text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCancelModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive" disabled={cancelLoading}>
                  Confirm Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit Note Modal */}
      {isCreditNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:hidden">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold">Issue Credit Note</h3>
            {cnError && <p className="text-xs text-destructive">{cnError}</p>}
            <form onSubmit={handleCreditNoteSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold">Credit Note Amount (₹)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={cnAmount}
                  onChange={(e) => setCnAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold">Reason</label>
                <textarea
                  required
                  placeholder="e.g. Return of damaged goods"
                  value={cnReason}
                  onChange={(e) => setCnReason(e.target.value)}
                  className="w-full mt-1 min-h-[80px] p-2 border rounded text-xs"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreditNoteModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={cnLoading}>
                  Create Credit Note
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
