'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, ArrowUpRight, Eye, Printer, Filter } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Receipt {
  id: string
  receipt_number: string
  receipt_date: string
  amount: number
  payment_mode: string
  category: string
  reference_number: string | null
  notes: string | null
  customer_id: string | null
  customer: { id: string; name: string | null; mobile: string | null } | null
  created_at: string
}

interface ReceiptsClientProps {
  initialReceipts: Receipt[]
  businessId: string
}

export default function ReceiptsClient({ initialReceipts, businessId }: ReceiptsClientProps) {
  const [receipts, setReceipts] = useState<Receipt[]>(initialReceipts)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL')

  const filteredReceipts = receipts.filter((r) => {
    const term = search.toLowerCase()
    const matchesSearch =
      r.receipt_number.toLowerCase().includes(term) ||
      (r.customer?.name && r.customer.name.toLowerCase().includes(term)) ||
      (r.notes && r.notes.toLowerCase().includes(term))

    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Receipts (Money In)</h2>
          <p className="text-sm text-muted-foreground">Track customer payments, invoice allocations, and standalone income.</p>
        </div>
        <Link href="/dashboard/receipts/new">
          <Button className="flex items-center gap-2 font-semibold">
            <Plus className="h-4 w-4" /> Record New Receipt
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search receipt #, customer, notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 text-xs rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="ALL">All Categories</option>
            <option value="CUSTOMER_PAYMENT">Customer Payment</option>
            <option value="STANDALONE_INCOME">Standalone Income</option>
            <option value="SCRAP_SALES">Scrap Sales</option>
            <option value="CONSULTING">Consulting</option>
          </select>
        </div>
      </div>

      {/* Receipts Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="p-3.5">Receipt #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Customer / Source</th>
                <th className="p-3.5">Mode</th>
                <th className="p-3.5 text-right">Amount Received</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredReceipts.map((rec) => (
                <tr key={rec.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-mono font-medium">
                    <Link href={`/dashboard/receipts/${rec.id}`} className="hover:underline text-primary">
                      {rec.receipt_number}
                    </Link>
                  </td>
                  <td className="p-3.5 text-muted-foreground whitespace-nowrap">{rec.receipt_date}</td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {rec.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <div className="font-medium text-foreground">
                      {rec.customer?.name || (rec.category === 'STANDALONE_INCOME' ? 'Standalone Income' : 'Direct Customer')}
                    </div>
                    {rec.customer?.mobile && <div className="text-xs text-muted-foreground">{rec.customer.mobile}</div>}
                  </td>
                  <td className="p-3.5 font-mono text-xs">{rec.payment_mode}</td>
                  <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ₹{Number(rec.amount).toFixed(2)}
                  </td>
                  <td className="p-3.5 text-right">
                    <Link href={`/dashboard/receipts/${rec.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs flex items-center gap-1">
                        <Eye className="h-3.5 w-3.5" /> View
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}

              {filteredReceipts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <ArrowUpRight className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-medium">No receipts found</p>
                    <p className="text-xs">Click "Record New Receipt" to log money received.</p>
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
