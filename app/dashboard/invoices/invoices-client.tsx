'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, FileText, Eye, Printer, Ban, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cancelInvoice } from '@/lib/services/invoice-service'

interface Invoice {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  customer_name: string | null
  customer_mobile: string | null
  is_walk_in: boolean
  grand_total: number
  paid_amount: number
  balance_due: number
  status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERDUE' | 'CANCELLED'
  cancellation_reason: string | null
  created_at: string
}

interface InvoicesClientProps {
  initialInvoices: Invoice[]
  businessId: string
}

export default function InvoicesClient({ initialInvoices, businessId }: InvoicesClientProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

  // Cancel Modal state
  const [cancellingInvoice, setCancellingInvoice] = useState<Invoice | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelError, setCancelError] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)

  const filteredInvoices = invoices.filter((inv) => {
    const term = search.toLowerCase()
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(term) ||
      (inv.customer_name && inv.customer_name.toLowerCase().includes(term)) ||
      (inv.customer_mobile && inv.customer_mobile.includes(term))

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">PAID</span>
      case 'PARTIALLY_PAID':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">PARTIAL</span>
      case 'UNPAID':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">UNPAID</span>
      case 'OVERDUE':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">OVERDUE</span>
      case 'CANCELLED':
        return <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-400">CANCELLED</span>
    }
  }

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cancellingInvoice) return
    setCancelLoading(true)
    setCancelError('')

    const res = await cancelInvoice(businessId, cancellingInvoice.id, cancelReason)
    if (res.success) {
      setInvoices((prev) =>
        prev.map((i) =>
          i.id === cancellingInvoice.id
            ? { ...i, status: 'CANCELLED', cancellation_reason: cancelReason, balance_due: 0 }
            : i
        )
      )
      setCancellingInvoice(null)
      setCancelReason('')
    } else if (res.error) {
      setCancelError(res.error)
    }
    setCancelLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Bills & Invoices</h2>
          <p className="text-sm text-muted-foreground">Manage, view, and issue new customer billing records.</p>
        </div>
        <Link href="/dashboard/invoices/new">
          <Button className="flex items-center gap-2 font-semibold">
            <Plus className="h-4 w-4" /> Create Bill (Quick)
          </Button>
        </Link>
      </div>

      {/* Filter and Search toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice #, customer name, mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice List Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5 text-right">Paid</th>
                <th className="p-3.5 text-right">Balance Due</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-mono font-medium text-foreground">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="hover:underline text-primary">
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="p-3.5 text-muted-foreground whitespace-nowrap">{inv.invoice_date}</td>
                  <td className="p-3.5">
                    <div className="font-medium text-foreground">
                      {inv.customer_name || (inv.is_walk_in ? 'Walk-in Customer' : '—')}
                    </div>
                    {inv.customer_mobile && <div className="text-xs text-muted-foreground">{inv.customer_mobile}</div>}
                  </td>
                  <td className="p-3.5 text-right font-semibold">₹{Number(inv.grand_total).toFixed(2)}</td>
                  <td className="p-3.5 text-right text-emerald-600 dark:text-emerald-400 font-medium">
                    ₹{Number(inv.paid_amount).toFixed(2)}
                  </td>
                  <td className="p-3.5 text-right text-rose-600 dark:text-rose-400 font-medium">
                    ₹{Number(inv.balance_due).toFixed(2)}
                  </td>
                  <td className="p-3.5 text-center">{getStatusBadge(inv.status)}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/dashboard/invoices/${inv.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </Link>
                      {inv.status !== 'CANCELLED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancellingInvoice(inv)}
                          className="h-8 px-2 text-xs text-destructive hover:bg-destructive/10 flex items-center gap-1"
                        >
                          <Ban className="h-3.5 w-3.5" /> Cancel
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-medium">No invoices match your filter</p>
                    <p className="text-xs">Click "Create Bill" to issue a new bill.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Cancellation Modal with Mandatory Reason */}
      {cancellingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" /> Cancel Invoice {cancellingInvoice.invoice_number}
            </h3>

            <p className="text-xs text-muted-foreground">
              Cancelling will lock this invoice as CANCELLED and set the balance due to zero. A cancellation reason is mandatory.
            </p>

            {cancelError && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive rounded border border-destructive/20">
                {cancelError}
              </div>
            )}

            <form onSubmit={handleCancelSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground">
                  Cancellation Reason <span className="text-destructive">*</span>
                </label>
                <textarea
                  required
                  placeholder="e.g. Wrong items entered / Customer requested cancellation"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full mt-1 flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <Button type="button" variant="outline" onClick={() => setCancellingInvoice(null)}>
                  Back
                </Button>
                <Button type="submit" variant="destructive" disabled={cancelLoading}>
                  {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
