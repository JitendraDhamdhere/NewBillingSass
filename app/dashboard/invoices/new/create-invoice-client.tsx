'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowLeft, Check, Sparkles, User, Tag } from 'lucide-react'
import { createInvoice } from '@/lib/services/invoice-service'
import { calculateInvoiceTotals, roundCurrency } from '@/lib/validations/invoice'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface CustomerOption {
  id: string
  name: string | null
  mobile: string | null
  customer_type: 'REGULAR' | 'WAL_IN'
}

interface ServiceOption {
  id: string
  name: string
  default_rate: number
  pricing_mode: string
  category: string | null
}

interface LineItem {
  id: string
  service_id: string | null
  description: string
  quantity: number
  unit_price: number
  discount_amount: number
}

interface CreateInvoiceClientProps {
  businessId: string
  initialCustomers: CustomerOption[]
  initialServices: ServiceOption[]
}

export default function CreateInvoiceClient({
  businessId,
  initialCustomers,
  initialServices,
}: CreateInvoiceClientProps) {
  const router = useRouter()

  // Form State
  const [isWalkIn, setIsWalkIn] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [walkInName, setWalkInName] = useState('')
  const [walkInMobile, setWalkInMobile] = useState('')

  const todayStr = new Date().toISOString().split('T')[0]
  const [invoiceDate, setInvoiceDate] = useState(todayStr)
  const [dueDate, setDueDate] = useState('')
  const [numberingMode, setNumberingMode] = useState<'FY_WISE' | 'CONTINUOUS'>('FY_WISE')

  // Line items
  const [items, setItems] = useState<LineItem[]>([
    { id: '1', service_id: null, description: '', quantity: 1, unit_price: 0, discount_amount: 0 },
  ])

  // Discount & Tax
  const [discountType, setDiscountType] = useState<'AMOUNT' | 'PERCENTAGE'>('AMOUNT')
  const [discountInput, setDiscountInput] = useState<number>(0)
  const [taxAmount, setTaxAmount] = useState<number>(0)

  // Payment Received Now
  const [paidNow, setPaidNow] = useState<number>(0)
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'>('CASH')

  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')
  const [errors, setErrors] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  // Computed Totals
  const computed = calculateInvoiceTotals({
    items,
    discount_percentage: discountType === 'PERCENTAGE' ? discountInput : 0,
    discount_amount: discountType === 'AMOUNT' ? discountInput : 0,
    tax_amount: taxAmount,
    paid_amount_now: paidNow,
    due_date: dueDate || null,
  })

  // Line item handlers
  const updateLineItem = (index: number, field: keyof LineItem, value: any) => {
    setItems((prev) => {
      const copy = [...prev]
      const updated = { ...copy[index], [field]: value }

      // If service selected, update default price & description
      if (field === 'service_id' && value) {
        const found = initialServices.find((s) => s.id === value)
        if (found) {
          updated.description = found.name
          updated.unit_price = Number(found.default_rate)
        }
      }

      copy[index] = updated
      return copy
    })
  }

  const addLineItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), service_id: null, description: '', quantity: 1, unit_price: 0, discount_amount: 0 },
    ])
  }

  const removeLineItem = (index: number) => {
    if (items.length <= 1) return
    setItems((prev) => prev.filter((_, idx) => idx !== index))
  }

  // Quick fill paid amount to full
  const setFullPaidNow = () => {
    setPaidNow(computed.grand_total)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    let customerName: string | null = null
    let customerMobile: string | null = null

    if (isWalkIn) {
      customerName = walkInName.trim() || null
      customerMobile = walkInMobile.trim() || null
    } else if (selectedCustomerId) {
      const selected = initialCustomers.find((c) => c.id === selectedCustomerId)
      if (selected) {
        customerName = selected.name
        customerMobile = selected.mobile
      }
    }

    const payload = {
      customer_id: isWalkIn ? null : selectedCustomerId || null,
      customer_name: customerName,
      customer_mobile: customerMobile,
      is_walk_in: isWalkIn,
      invoice_date: invoiceDate,
      due_date: dueDate || null,
      numbering_mode: numberingMode,
      items: items.map((i) => ({
        service_id: i.service_id,
        description: i.description,
        quantity: Number(i.quantity),
        unit_price: Number(i.unit_price),
        discount_amount: Number(i.discount_amount),
      })),
      discount_percentage: discountType === 'PERCENTAGE' ? Number(discountInput) : 0,
      discount_amount: discountType === 'AMOUNT' ? Number(discountInput) : 0,
      tax_amount: Number(taxAmount),
      paid_amount_now: Number(paidNow),
      payment_mode: paymentMode,
      notes: notes || null,
      terms: terms || null,
    }

    const res = await createInvoice(businessId, payload)

    if (res.success && res.data) {
      router.push(`/dashboard/invoices/${res.data.id}`)
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
            <h2 className="text-2xl font-bold tracking-tight">Create Bill / Invoice</h2>
            <p className="text-xs text-muted-foreground">Fast, mobile-ready billing entry.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={numberingMode}
            onChange={(e: any) => setNumberingMode(e.target.value)}
            className="text-xs border rounded-md px-2 py-1 bg-background"
          >
            <option value="FY_WISE">FY Numbering (e.g. INV-2026-27-0001)</option>
            <option value="CONTINUOUS">Continuous Numbering (e.g. INV-000001)</option>
          </select>
        </div>
      </div>

      {errors._form && (
        <div className="p-3 text-xs bg-destructive/10 text-destructive rounded border border-destructive/20 font-medium">
          {Array.isArray(errors._form) ? errors._form.join(', ') : errors._form}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection Section */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Customer Information
            </h3>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWalkIn}
                  onChange={(e) => {
                    setIsWalkIn(e.target.checked)
                    if (e.target.checked) setSelectedCustomerId('')
                  }}
                  className="rounded text-primary focus:ring-primary h-4 w-4"
                />
                Walk-in Customer
              </label>
            </div>
          </div>

          {!isWalkIn ? (
            <div>
              <Label htmlFor="cust-select">Select Existing Customer</Label>
              <select
                id="cust-select"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">-- Choose Customer --</option>
                {initialCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || 'Unnamed'} {c.mobile ? `(${c.mobile})` : ''} [{c.customer_type}]
                  </option>
                ))}
              </select>
              {errors.customer_id && <p className="text-xs text-destructive mt-1">{errors.customer_id}</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="walkin-name">Customer Name {computed.balance_due > 0 && <span className="text-destructive">*</span>}</Label>
                <Input
                  id="walkin-name"
                  placeholder="e.g. Ramesh Patel"
                  value={walkInName}
                  onChange={(e) => setWalkInName(e.target.value)}
                />
                {errors.customer_name && <p className="text-xs text-destructive mt-1">{errors.customer_name}</p>}
              </div>
              <div>
                <Label htmlFor="walkin-mobile">Mobile Number {computed.balance_due > 0 && <span className="text-destructive">*</span>}</Label>
                <Input
                  id="walkin-mobile"
                  placeholder="e.g. 9876543210"
                  value={walkInMobile}
                  onChange={(e) => setWalkInMobile(e.target.value)}
                />
                {errors.customer_mobile && <p className="text-xs text-destructive mt-1">{errors.customer_mobile}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <Label htmlFor="inv-date">Bill Date <span className="text-destructive">*</span></Label>
              <Input
                id="inv-date"
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="due-date">Due Date (Optional)</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Line Items Section */}
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" /> Line Items / Services
            </h3>
            <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="h-8 text-xs flex items-center gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Row
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={item.id} className="grid grid-cols-12 gap-2 items-end bg-muted/20 p-3 rounded-md border">
                {/* Catalog Dropdown or Custom Text */}
                <div className="col-span-12 md:col-span-5 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Service / Description</Label>
                  <div className="space-y-1.5">
                    {initialServices.length > 0 && (
                      <select
                        value={item.service_id || ''}
                        onChange={(e) => updateLineItem(idx, 'service_id', e.target.value || null)}
                        className="w-full h-9 text-xs rounded-md border border-input bg-background px-2"
                      >
                        <option value="">-- Quick Pick Service Catalog --</option>
                        {initialServices.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (₹{s.default_rate})
                          </option>
                        ))}
                      </select>
                    )}
                    <Input
                      placeholder="Item name / description"
                      value={item.description}
                      onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div className="col-span-4 md:col-span-2 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Qty</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={item.quantity}
                    onChange={(e) => updateLineItem(idx, 'quantity', parseFloat(e.target.value) || 0)}
                    className="h-9 text-xs text-right font-mono"
                  />
                </div>

                {/* Unit Price */}
                <div className="col-span-4 md:col-span-2 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Rate (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => updateLineItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="h-9 text-xs text-right font-mono"
                  />
                </div>

                {/* Amount */}
                <div className="col-span-3 md:col-span-2 space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Amount</Label>
                  <div className="h-9 flex items-center justify-end font-semibold text-xs font-mono px-2 bg-muted rounded border">
                    ₹{roundCurrency(item.quantity * item.unit_price - item.discount_amount).toFixed(2)}
                  </div>
                </div>

                {/* Remove Button */}
                <div className="col-span-1 flex items-center justify-center pb-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={items.length <= 1}
                    onClick={() => removeLineItem(idx)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Financial Summary & Payment Received Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-5 space-y-4">
            <h3 className="font-semibold text-sm border-b pb-2">Discount & Extras</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center text-xs font-medium mb-1">
                  <span>Overall Discount</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDiscountType('AMOUNT')}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        discountType === 'AMOUNT' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted'
                      }`}
                    >
                      ₹ Fixed
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountType('PERCENTAGE')}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        discountType === 'PERCENTAGE' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted'
                      }`}
                    >
                      % Percent
                    </button>
                  </div>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <Label htmlFor="tax-amt" className="text-xs">Tax Amount (₹ Optional)</Label>
                <Input
                  id="tax-amt"
                  type="number"
                  step="0.01"
                  min="0"
                  value={taxAmount}
                  onChange={(e) => setTaxAmount(parseFloat(e.target.value) || 0)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div>
                <Label htmlFor="inv-notes" className="text-xs">Notes / Remarks</Label>
                <textarea
                  id="inv-notes"
                  placeholder="e.g. Thanks for your business!"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full mt-1 flex min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Money In / Payment Received Now */}
          <Card className="p-5 space-y-4 bg-muted/10 border-primary/20">
            <h3 className="font-semibold text-sm border-b pb-2 flex items-center justify-between">
              <span>Payment Received Now</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={setFullPaidNow}
                className="h-6 text-[10px] px-2 text-primary border-primary/40 hover:bg-primary/10"
              >
                Mark Full Paid
              </Button>
            </h3>

            <div className="space-y-3">
              <div>
                <Label htmlFor="paid-now" className="text-xs">Amount Received (₹)</Label>
                <Input
                  id="paid-now"
                  type="number"
                  step="0.01"
                  min="0"
                  max={computed.grand_total}
                  value={paidNow}
                  onChange={(e) => setPaidNow(parseFloat(e.target.value) || 0)}
                  className="h-10 text-base font-bold font-mono text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div>
                <Label className="text-xs">Payment Mode</Label>
                <select
                  value={paymentMode}
                  onChange={(e: any) => setPaymentMode(e.target.value)}
                  className="w-full mt-1 flex h-9 rounded-md border border-input bg-background px-3 py-2 text-xs"
                >
                  <option value="CASH">CASH</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="BANK_TRANSFER">BANK TRANSFER</option>
                  <option value="CARD">CARD</option>
                  <option value="CHEQUE">CHEQUE</option>
                  <option value="OTHER">OTHER</option>
                </select>
              </div>

              {/* Totals Summary */}
              <div className="pt-3 border-t space-y-1.5 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-mono">₹{computed.subtotal.toFixed(2)}</span>
                </div>
                {computed.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span className="font-mono">-₹{computed.discount_amount.toFixed(2)}</span>
                  </div>
                )}
                {computed.tax_amount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax:</span>
                    <span className="font-mono">+₹{computed.tax_amount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t">
                  <span>Grand Total:</span>
                  <span className="font-mono text-base text-primary">₹{computed.grand_total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-xs text-rose-600 dark:text-rose-400">
                  <span>Balance Due:</span>
                  <span className="font-mono text-sm">₹{computed.balance_due.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="px-8 font-semibold">
            {loading ? 'Creating Bill...' : 'Save & Issue Bill'}
          </Button>
        </div>
      </form>
    </div>
  )
}
