'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, User, DollarSign, AlertCircle, Check, FileText, Info } from 'lucide-react'
import { createReceipt, getCustomerOutstandingInvoices } from '@/lib/services/receipt-service'
import { validateReceiptAllocation } from '@/lib/validations/receipt'
import { roundCurrency } from '@/lib/validations/invoice'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CustomerOption {
  id: string
  name: string | null
  mobile: string | null
  customer_type: string
}

interface OutstandingInvoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  grand_total: number
  paid_amount: number
  balance_due: number
  status: string
}

interface CreateReceiptClientProps {
  businessId: string
  initialCustomers: CustomerOption[]
}

export default function CreateReceiptClient({ businessId, initialCustomers }: CreateReceiptClientProps) {
  const router = useRouter()

  // Mode: CUSTOMER_PAYMENT vs STANDALONE_INCOME
  const [receiptType, setReceiptType] = useState<'CUSTOMER_PAYMENT' | 'STANDALONE_INCOME'>('CUSTOMER_PAYMENT')

  // Common Fields
  const todayStr = new Date().toISOString().split('T')[0]
  const [receiptDate, setReceiptDate] = useState(todayStr)
  const [amount, setAmount] = useState<number>(0)
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'>('CASH')
  const [refNumber, setRefNumber] = useState('')
  const [notes, setNotes] = useState('')

  // Customer Payment state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [outstandingInvoices, setOutstandingInvoices] = useState<OutstandingInvoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(false)
  const [allocations, setAllocations] = useState<Record<string, number>>({}) // invoice_id -> allocated_amount

  // Standalone Income state
  const [category, setCategory] = useState('STANDALONE_INCOME')
  const [description, setDescription] = useState('')

  const [errors, setErrors] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  // Fetch outstanding invoices when customer changes
  useEffect(() => {
    if (!selectedCustomerId || receiptType !== 'CUSTOMER_PAYMENT') {
      setOutstandingInvoices([])
      setAllocations({})
      return
    }

    async function fetchOutstanding() {
      setLoadingInvoices(true)
      try {
        const invs = await getCustomerOutstandingInvoices(businessId, selectedCustomerId)
        setOutstandingInvoices(invs as any)
        setAllocations({})
      } catch (err) {
        console.error(err)
      } finally {
        setLoadingInvoices(false)
      }
    }

    fetchOutstanding()
  }, [selectedCustomerId, businessId, receiptType])

  // Calculation stats for allocation
  const allocationArray = Object.entries(allocations)
    .filter(([_, allocAmt]) => allocAmt > 0)
    .map(([invId, allocAmt]) => ({ invoice_id: invId, allocated_amount: allocAmt }))

  const invoiceMap = new Map<string, { balance_due: number; invoice_number: string }>()
  outstandingInvoices.forEach((inv) => invoiceMap.set(inv.id, { balance_due: inv.balance_due, invoice_number: inv.invoice_number }))

  const calcResult = validateReceiptAllocation(amount, allocationArray, invoiceMap)

  // Allocation handler (Manual allocation - user explicitly enters amount per invoice)
  const handleAllocationChange = (invoiceId: string, val: number) => {
    setAllocations((prev) => ({
      ...prev,
      [invoiceId]: Math.max(0, val),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const payload = {
      customer_id: receiptType === 'CUSTOMER_PAYMENT' ? selectedCustomerId || null : null,
      category: receiptType === 'CUSTOMER_PAYMENT' ? 'CUSTOMER_PAYMENT' : category,
      description: receiptType === 'STANDALONE_INCOME' ? description : null,
      receipt_date: receiptDate,
      amount: Number(amount),
      payment_mode: paymentMode,
      reference_number: refNumber || null,
      notes: notes || null,
      allocations: allocationArray,
    }

    const res = await createReceipt(businessId, payload)

    if (res.success && res.data) {
      router.push(`/dashboard/receipts/${res.data.id}`)
    } else if (res.errors) {
      setErrors(res.errors)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Record Receipt (Money In)</h2>
            <p className="text-xs text-muted-foreground">Manual allocation against customer bills or standalone income.</p>
          </div>
        </div>
      </div>

      {errors._form && (
        <div className="p-3 text-xs bg-destructive/10 text-destructive rounded border border-destructive/20 font-medium">
          {Array.isArray(errors._form) ? errors._form.join(', ') : errors._form}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b">
        <button
          type="button"
          onClick={() => setReceiptType('CUSTOMER_PAYMENT')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            receiptType === 'CUSTOMER_PAYMENT'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Customer Payment (Against Bills)
        </button>
        <button
          type="button"
          onClick={() => setReceiptType('STANDALONE_INCOME')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition-colors ${
            receiptType === 'STANDALONE_INCOME'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Standalone Income / Other Receipt
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details Card */}
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold text-sm border-b pb-2">Receipt Details</h3>

          {receiptType === 'CUSTOMER_PAYMENT' ? (
            <div>
              <Label htmlFor="cust-sel">Select Customer <span className="text-destructive">*</span></Label>
              <select
                id="cust-sel"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">-- Select Customer --</option>
                {initialCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || 'Unnamed'} {c.mobile ? `(${c.mobile})` : ''}
                  </option>
                ))}
              </select>
              {errors.customer_id && <p className="text-xs text-destructive mt-1">{errors.customer_id}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cat-sel">Income Category <span className="text-destructive">*</span></Label>
                <select
                  id="cat-sel"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="STANDALONE_INCOME">Standalone Income</option>
                  <option value="SCRAP_SALES">Scrap / Material Sales</option>
                  <option value="CONSULTING">Consulting / Service Fee</option>
                  <option value="OTHER_INCOME">Other Miscellaneous Income</option>
                </select>
              </div>
              <div>
                <Label htmlFor="income-desc">Description / Particulars</Label>
                <Input
                  id="income-desc"
                  placeholder="e.g. Sold unused packaging boxes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="rec-amount">Amount Received (₹) <span className="text-destructive">*</span></Label>
              <Input
                id="rec-amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-base"
              />
              {errors.amount && <p className="text-xs text-destructive mt-1">{errors.amount}</p>}
            </div>

            <div>
              <Label htmlFor="rec-date">Receipt Date <span className="text-destructive">*</span></Label>
              <Input
                id="rec-date"
                type="date"
                value={receiptDate}
                onChange={(e) => setReceiptDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="pm-mode">Payment Mode</Label>
              <select
                id="pm-mode"
                value={paymentMode}
                onChange={(e: any) => setPaymentMode(e.target.value)}
                className="w-full mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="CASH">CASH</option>
                <option value="UPI">UPI / QR Code</option>
                <option value="BANK_TRANSFER">BANK TRANSFER</option>
                <option value="CARD">CARD</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ref-num">Reference / Transaction # (Optional)</Label>
              <Input
                id="ref-num"
                placeholder="e.g. UTR / Cheque # / UPI Ref"
                value={refNumber}
                onChange={(e) => setRefNumber(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rec-notes">Remarks / Notes</Label>
              <Input
                id="rec-notes"
                placeholder="e.g. Payment received towards pending bill"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* FRD Manual Allocation Section (When Customer Payment) */}
        {receiptType === 'CUSTOMER_PAYMENT' && selectedCustomerId && (
          <Card className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
              <div>
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Manual Invoice Allocation
                </h3>
                <p className="text-xs text-muted-foreground">
                  Sorted oldest first. Enter manual allocation amount per invoice.
                </p>
              </div>

              {/* Live allocation counter */}
              <div className="flex items-center gap-4 text-xs font-mono bg-muted p-2 rounded-md border">
                <div>
                  <span className="text-muted-foreground">Payment:</span>{' '}
                  <span className="font-bold text-foreground">₹{calcResult.payment_amount.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Allocated:</span>{' '}
                  <span className="font-bold text-blue-600">₹{calcResult.allocated_total.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Remaining:</span>{' '}
                  <span className="font-bold text-emerald-600">₹{calcResult.unallocated_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {calcResult.unallocated_amount > 0 && calcResult.allocated_total > 0 && (
              <div className="p-2.5 text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 rounded border border-blue-200 dark:border-blue-800 flex items-center gap-2">
                <Info className="h-4 w-4 shrink-0" />
                <span>
                  Overpayment detected: Unallocated <strong>₹{calcResult.unallocated_amount.toFixed(2)}</strong> will be credited as Customer Advance Balance.
                </span>
              </div>
            )}

            {!calcResult.is_valid && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive rounded border border-destructive/20 space-y-1">
                {calcResult.errors.map((err, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{err}</span>
                  </div>
                ))}
              </div>
            )}

            {loadingInvoices ? (
              <p className="text-xs text-muted-foreground py-4 text-center">Loading customer invoices...</p>
            ) : outstandingInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs uppercase font-semibold text-muted-foreground">
                      <th className="p-2.5">Invoice #</th>
                      <th className="p-2.5">Date</th>
                      <th className="p-2.5 text-right">Grand Total</th>
                      <th className="p-2.5 text-right">Balance Due</th>
                      <th className="p-2.5 text-right">Allocation (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-xs">
                    {outstandingInvoices.map((inv) => {
                      const currentAlloc = allocations[inv.id] || 0
                      return (
                        <tr key={inv.id} className="hover:bg-muted/20">
                          <td className="p-2.5 font-mono font-semibold text-primary">{inv.invoice_number}</td>
                          <td className="p-2.5 text-muted-foreground">{inv.invoice_date}</td>
                          <td className="p-2.5 text-right font-mono">₹{Number(inv.grand_total).toFixed(2)}</td>
                          <td className="p-2.5 text-right font-mono text-rose-600 dark:text-rose-400 font-semibold">
                            ₹{Number(inv.balance_due).toFixed(2)}
                          </td>
                          <td className="p-2.5 text-right w-40">
                            <div className="flex items-center justify-end gap-1">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                max={inv.balance_due}
                                value={currentAlloc || ''}
                                placeholder="0.00"
                                onChange={(e) => handleAllocationChange(inv.id, parseFloat(e.target.value) || 0)}
                                className="h-8 text-xs text-right font-mono font-bold"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleAllocationChange(inv.id, inv.balance_due)}
                                className="h-8 text-[10px] px-1.5"
                                title="Full balance"
                              >
                                Full
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                This customer has no unpaid outstanding invoices. Payment will be saved as Standalone / Advance.
              </div>
            )}
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading || (receiptType === 'CUSTOMER_PAYMENT' && !calcResult.is_valid)}
            className="px-8 font-semibold"
          >
            {loading ? 'Saving Receipt...' : 'Save & Issue Receipt'}
          </Button>
        </div>
      </form>
    </div>
  )
}
