'use client'

import React, { useState } from 'react'
import { Plus, Search, ArrowDownLeft, FileText, X, TrendingUp, AlertCircle } from 'lucide-react'
import { createPayment, getInvoiceJobProfitability } from '@/lib/services/payment-service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PaymentItem {
  id: string
  payment_number: string
  paid_to: string
  mobile: string | null
  work_purpose: string
  amount: number
  payment_date: string
  payment_mode: string
  invoice_id: string | null
  invoice: { id: string; invoice_number: string; grand_total: number; customer_name: string | null } | null
  notes: string | null
}

interface PaymentsClientProps {
  initialPayments: PaymentItem[]
  invoices: Array<{ id: string; invoice_number: string; grand_total: number; customer_name: string | null }>
  businessId: string
}

export default function PaymentsClient({ initialPayments, invoices, businessId }: PaymentsClientProps) {
  const [payments, setPayments] = useState<PaymentItem[]>(initialPayments)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [profitModalData, setProfitModalData] = useState<any>(null)

  // Form State
  const todayStr = new Date().toISOString().split('T')[0]
  const [paidTo, setPaidTo] = useState('')
  const [mobile, setMobile] = useState('')
  const [workPurpose, setWorkPurpose] = useState('')
  const [linkedInvoiceId, setLinkedInvoiceId] = useState<string>('')
  const [amount, setAmount] = useState<number>(0)
  const [paymentDate, setPaymentDate] = useState(todayStr)
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'>('CASH')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, any>>({})

  const filteredPayments = payments.filter((p) => {
    const term = search.toLowerCase()
    return (
      p.payment_number.toLowerCase().includes(term) ||
      p.paid_to.toLowerCase().includes(term) ||
      p.work_purpose.toLowerCase().includes(term) ||
      (p.invoice?.invoice_number && p.invoice.invoice_number.toLowerCase().includes(term))
    )
  })

  const totalPaymentsSum = filteredPayments.reduce((acc, curr) => acc + Number(curr.amount), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const res = await createPayment(businessId, {
      paid_to: paidTo,
      mobile: mobile || null,
      work_purpose: workPurpose,
      invoice_id: linkedInvoiceId || null,
      amount: Number(amount),
      payment_date: paymentDate,
      payment_mode: paymentMode,
      notes: notes || null,
    })

    if (res.success && res.data) {
      const newPay = res.data as any
      // Attach invoice object if linked
      if (linkedInvoiceId) {
        const invObj = invoices.find((i) => i.id === linkedInvoiceId)
        if (invObj) newPay.invoice = invObj
      }
      setPayments((prev) => [newPay, ...prev])
      setModalOpen(false)
      // reset
      setPaidTo('')
      setMobile('')
      setWorkPurpose('')
      setLinkedInvoiceId('')
      setAmount(0)
      setNotes('')
    } else if (res.errors) {
      setErrors(res.errors)
    }
    setLoading(false)
  }

  const handleCheckProfitability = async (invoiceId: string) => {
    const data = await getInvoiceJobProfitability(businessId, invoiceId)
    if (data) {
      setProfitModalData(data)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vendor & Worker Payments (Money Out for Work)</h2>
          <p className="text-sm text-muted-foreground">Track payments to vendors and workers. Link payments to customer bills for job profitability calculation.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Record New Payment
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="p-4 border-l-4 border-l-amber-500 max-w-sm">
        <span className="text-xs text-muted-foreground font-semibold uppercase">Total Vendor Payments</span>
        <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-1">
          ₹{totalPaymentsSum.toFixed(2)}
        </div>
      </Card>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search vendor name, work purpose, invoice #..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Payments Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="p-3.5">Payment #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Paid To</th>
                <th className="p-3.5">Work / Purpose</th>
                <th className="p-3.5">Linked Invoice / Job</th>
                <th className="p-3.5">Mode</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
                <th className="p-3.5 text-right">Job Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-mono font-medium text-primary">{p.payment_number}</td>
                  <td className="p-3.5 text-muted-foreground whitespace-nowrap text-xs">{p.payment_date}</td>
                  <td className="p-3.5 font-semibold text-foreground">
                    {p.paid_to}
                    {p.mobile && <span className="block text-xs font-normal text-muted-foreground">{p.mobile}</span>}
                  </td>
                  <td className="p-3.5 text-muted-foreground text-xs">{p.work_purpose}</td>
                  <td className="p-3.5">
                    {p.invoice ? (
                      <span className="text-xs font-mono font-bold text-primary">{p.invoice.invoice_number}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="p-3.5 font-mono text-xs">{p.payment_mode}</td>
                  <td className="p-3.5 text-right font-bold text-amber-600 dark:text-amber-400 font-mono">
                    ₹{Number(p.amount).toFixed(2)}
                  </td>
                  <td className="p-3.5 text-right">
                    {p.invoice ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCheckProfitability(p.invoice!.id)}
                        className="h-7 text-[11px] px-2 flex items-center gap-1 text-emerald-600 border-emerald-300"
                      >
                        <TrendingUp className="h-3 w-3" /> Profit
                      </Button>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <ArrowDownLeft className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-medium">No vendor payments recorded</p>
                    <p className="text-xs">Click "Record New Payment" to log money paid to workers/vendors.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Record Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg max-w-lg w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg">Record Vendor / Worker Payment</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errors._form && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive rounded border border-destructive/20 font-medium">
                {Array.isArray(errors._form) ? errors._form.join(', ') : errors._form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pay-to">Paid To (Vendor/Worker Name) <span className="text-destructive">*</span></Label>
                  <Input
                    id="pay-to"
                    placeholder="e.g. Rakesh Carpenter"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pay-mobile">Mobile Number (Optional)</Label>
                  <Input
                    id="pay-mobile"
                    placeholder="9876543210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="pay-work">Work / Purpose Description <span className="text-destructive">*</span></Label>
                <Input
                  id="pay-work"
                  placeholder="e.g. Woodwork polishing & assembly"
                  value={workPurpose}
                  onChange={(e) => setWorkPurpose(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="pay-inv">Link to Customer Invoice / Job (Optional for Job Profitability)</Label>
                <select
                  id="pay-inv"
                  value={linkedInvoiceId}
                  onChange={(e) => setLinkedInvoiceId(e.target.value)}
                  className="w-full mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">-- No Linked Customer Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} — {inv.customer_name || 'Customer'} (Bill: ₹{Number(inv.grand_total).toFixed(2)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="pay-amount">Amount (₹) <span className="text-destructive">*</span></Label>
                  <Input
                    id="pay-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    required
                    className="font-mono font-bold text-amber-600 dark:text-amber-400"
                  />
                </div>
                <div>
                  <Label htmlFor="pay-date">Payment Date <span className="text-destructive">*</span></Label>
                  <Input
                    id="pay-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="pay-pm">Payment Mode</Label>
                  <select
                    id="pay-pm"
                    value={paymentMode}
                    onChange={(e: any) => setPaymentMode(e.target.value)}
                    className="w-full mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="CASH">CASH</option>
                    <option value="UPI">UPI / QR</option>
                    <option value="BANK_TRANSFER">BANK TRANSFER</option>
                    <option value="CARD">CARD</option>
                    <option value="CHEQUE">CHEQUE</option>
                    <option value="OTHER">OTHER</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="pay-notes">Remarks / Notes</Label>
                <Input
                  id="pay-notes"
                  placeholder="Additional remarks"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="px-6 font-semibold">
                  {loading ? 'Saving...' : 'Save Vendor Payment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Job Profitability Calculation Modal */}
      {profitModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg max-w-md w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" /> Job Profitability Analysis
              </h3>
              <button onClick={() => setProfitModalData(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="p-3 bg-muted/30 rounded border space-y-1">
                <div className="text-xs text-muted-foreground">Invoice #</div>
                <div className="font-mono font-bold text-primary">{profitModalData.invoice.invoice_number}</div>
                <div className="text-xs text-muted-foreground">Customer: {profitModalData.invoice.customer_name || 'Walk-in'}</div>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Bill Total:</span>
                  <span className="font-bold">₹{profitModalData.profitability.bill_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>(-) Linked Vendor Payments ({profitModalData.linkedPayments.length}):</span>
                  <span className="font-bold">₹{profitModalData.profitability.vendor_payments_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  <span>(=) Job Profit Contribution:</span>
                  <span>₹{profitModalData.profitability.job_profit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Contribution Margin:</span>
                  <span className="font-bold text-foreground">{profitModalData.profitability.margin_percentage}%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setProfitModalData(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
