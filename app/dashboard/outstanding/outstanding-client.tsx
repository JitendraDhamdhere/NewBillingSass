'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  DollarSign,
  Search,
  Share2,
  FileText,
  Calendar,
  User,
  Plus,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ReceivableItem {
  id: string
  invoice_number: string
  invoice_date: string
  due_date: string | null
  customer_name: string | null
  customer_mobile: string | null
  grand_total: number
  paid_amount: number
  balance_due: number
  calculatedStatus: 'OVERDUE' | 'DUE_SOON' | 'PENDING'
  customer: { id: string; name: string | null; mobile: string | null; email: string | null } | null
}

interface CollectionMetrics {
  todaysCollection: number
  totalOutstanding: number
  overdueAmount: number
  dueTodayAmount: number
}

interface OutstandingClientProps {
  receivables: ReceivableItem[]
  metrics: CollectionMetrics
  businessName: string
}

export default function OutstandingClient({ receivables, metrics, businessName }: OutstandingClientProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OVERDUE' | 'DUE_SOON' | 'PENDING'>('ALL')

  const filteredReceivables = receivables.filter((r) => {
    const term = search.toLowerCase()
    const matchesSearch =
      r.invoice_number.toLowerCase().includes(term) ||
      (r.customer_name && r.customer_name.toLowerCase().includes(term)) ||
      (r.customer_mobile && r.customer_mobile.includes(term))

    const matchesStatus = statusFilter === 'ALL' || r.calculatedStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const sendWhatsAppReminder = (r: ReceivableItem) => {
    const mobile = r.customer_mobile || r.customer?.mobile || ''
    const text = encodeURIComponent(
      `Hello ${r.customer_name || 'Customer'},\n\nThis is a friendly payment reminder from *${businessName}* regarding Invoice *${r.invoice_number}*.\nTotal Bill Amount: ₹${Number(r.grand_total).toFixed(2)}\nBalance Outstanding: *₹${Number(r.balance_due).toFixed(2)}*\nDue Date: ${r.due_date || 'Immediate'}\n\nPlease settle at your earliest convenience. Thank you!`
    )
    const url = mobile ? `https://wa.me/${mobile.replace(/[^0-9]/g, '')}?text=${text}` : `https://wa.me/?text=${text}`
    window.open(url, '_blank')
  }

  const getStatusBadge = (status: ReceivableItem['calculatedStatus']) => {
    switch (status) {
      case 'OVERDUE':
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 flex items-center gap-1 w-max">
            <AlertTriangle className="h-3 w-3" /> OVERDUE
          </span>
        )
      case 'DUE_SOON':
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 flex items-center gap-1 w-max">
            <Clock className="h-3 w-3" /> DUE SOON
          </span>
        )
      case 'PENDING':
        return (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 flex items-center gap-1 w-max">
            PENDING
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Outstanding & Customer Dues</h2>
          <p className="text-sm text-muted-foreground">Monitor unpaid receivables, send collection reminders, and track money in.</p>
        </div>
        <Link href="/dashboard/receipts/new">
          <Button className="flex items-center gap-2 font-semibold">
            <Plus className="h-4 w-4" /> Collect Payment / Issue Receipt
          </Button>
        </Link>
      </div>

      {/* Dashboard Collection Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-semibold">Today's Collection</span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-2">
            ₹{metrics.todaysCollection.toFixed(2)}
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-blue-500 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-semibold">Total Outstanding</span>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 font-mono mt-2">
            ₹{metrics.totalOutstanding.toFixed(2)}
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-rose-500 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-semibold">Overdue Amount</span>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-2">
            ₹{metrics.overdueAmount.toFixed(2)}
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <span className="text-xs text-muted-foreground font-semibold">Due Today</span>
          <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-2">
            ₹{metrics.dueTodayAmount.toFixed(2)}
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customer name, mobile, invoice #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'OVERDUE', 'DUE_SOON', 'PENDING'] as const).map((st) => (
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

      {/* Outstanding Receivables Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Invoice #</th>
                <th className="p-3.5">Due Date</th>
                <th className="p-3.5 text-right">Grand Total</th>
                <th className="p-3.5 text-right">Balance Due</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Collection Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReceivables.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5">
                    <div className="font-semibold text-foreground">
                      {r.customer_name || r.customer?.name || 'Customer'}
                    </div>
                    {(r.customer_mobile || r.customer?.mobile) && (
                      <div className="text-xs text-muted-foreground">{r.customer_mobile || r.customer?.mobile}</div>
                    )}
                    {r.customer?.id && (
                      <Link
                        href={`/dashboard/customers/${r.customer.id}/statement`}
                        className="text-[11px] text-primary hover:underline font-medium block mt-0.5"
                      >
                        View Statement
                      </Link>
                    )}
                  </td>
                  <td className="p-3.5 font-mono font-medium">
                    <Link href={`/dashboard/invoices/${r.id}`} className="hover:underline text-primary">
                      {r.invoice_number}
                    </Link>
                  </td>
                  <td className="p-3.5 text-muted-foreground whitespace-nowrap font-mono text-xs">
                    {r.due_date || 'No due date'}
                  </td>
                  <td className="p-3.5 text-right font-mono">₹{Number(r.grand_total).toFixed(2)}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    ₹{Number(r.balance_due).toFixed(2)}
                  </td>
                  <td className="p-3.5">{getStatusBadge(r.calculatedStatus)}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => sendWhatsAppReminder(r)}
                        className="h-8 px-2 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-1"
                      >
                        <Share2 className="h-3.5 w-3.5" /> WhatsApp Reminder
                      </Button>
                      <Link href="/dashboard/receipts/new">
                        <Button variant="secondary" size="sm" className="h-8 px-2 text-xs">
                          Collect
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReceivables.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500 mb-2" />
                    <p className="font-medium">No outstanding receivables match your search</p>
                    <p className="text-xs">All bills in this filter are fully collected!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
