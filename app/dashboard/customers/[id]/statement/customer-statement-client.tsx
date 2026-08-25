'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer, Share2, Building, User, FileText, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface StatementEntry {
  date: string
  type: 'INVOICE' | 'RECEIPT'
  refNumber: string
  debit: number
  credit: number
  description: string
  balance: number
}

interface CustomerStatementClientProps {
  customer: any
  ledger: {
    statement: StatementEntry[]
    totalBilled: number
    totalPaid: number
    netBalance: number
  }
  business: any
}

export default function CustomerStatementClient({ customer, ledger, business }: CustomerStatementClientProps) {
  const router = useRouter()

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsAppShare = () => {
    const mobile = customer.mobile || ''
    const text = encodeURIComponent(
      `Hello ${customer.name || 'Customer'},\n\nHere is your account statement from *${business.name}*.\nTotal Billed: ₹${ledger.totalBilled.toFixed(2)}\nTotal Paid: ₹${ledger.totalPaid.toFixed(2)}\nNet Balance Due: *₹${ledger.netBalance.toFixed(2)}*\n\nThank you!`
    )
    const url = mobile ? `https://wa.me/${mobile.replace(/[^0-9]/g, '')}?text=${text}` : `https://wa.me/?text=${text}`
    window.open(url, '_blank')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:m-0 print:max-w-none print:p-0">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Customer Statement</h2>
            <p className="text-xs text-muted-foreground">{customer.name || 'Walk-in Customer'} • Ledger Timeline</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1.5 text-xs">
            <Printer className="h-4 w-4" /> Print / PDF Statement
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <Share2 className="h-4 w-4" /> WhatsApp Statement
          </Button>
        </div>
      </div>

      {/* Printable Statement Card */}
      <Card className="p-8 space-y-6 bg-background border shadow-md print:shadow-none print:border-none print:p-0">
        {/* Business Header */}
        <div className="flex justify-between items-start border-b pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">{business.name}</h1>
            </div>
            {business.address && <p className="text-xs text-muted-foreground">{business.address}</p>}
            {business.mobile && <p className="text-xs text-muted-foreground">Ph: {business.mobile}</p>}
          </div>

          <div className="text-right space-y-1">
            <h2 className="text-xl font-bold text-primary">ACCOUNT STATEMENT</h2>
            <p className="text-xs text-muted-foreground">Generated on {new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        {/* Customer & Ledger Summary Box */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-md border">
          <div>
            <span className="text-xs text-muted-foreground uppercase font-semibold">Statement For:</span>
            <p className="font-bold text-foreground mt-1 text-base">{customer.name || 'Customer'}</p>
            {customer.mobile && <p className="text-xs text-muted-foreground">Ph: {customer.mobile}</p>}
            {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
            {customer.address && <p className="text-xs text-muted-foreground">{customer.address}</p>}
          </div>

          <div className="text-right space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-muted-foreground">
              <span>Total Billed:</span>
              <span className="font-bold text-foreground">₹{ledger.totalBilled.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-emerald-600">
              <span>Total Paid:</span>
              <span className="font-bold">₹{ledger.totalPaid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm border-t pt-1 text-rose-600 dark:text-rose-400">
              <span>Net Balance Due:</span>
              <span className="text-base">₹{ledger.netBalance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Timeline Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b bg-muted/40 text-xs uppercase font-semibold text-muted-foreground">
                <th className="p-3">Date</th>
                <th className="p-3">Type</th>
                <th className="p-3">Ref #</th>
                <th className="p-3">Description</th>
                <th className="p-3 text-right">Debit (+₹)</th>
                <th className="p-3 text-right">Credit (-₹)</th>
                <th className="p-3 text-right">Running Balance (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs font-mono">
              {ledger.statement.map((entry, idx) => (
                <tr key={idx} className="hover:bg-muted/20">
                  <td className="p-3 text-muted-foreground">{entry.date}</td>
                  <td className="p-3">
                    <span
                      className={`font-semibold uppercase px-2 py-0.5 rounded ${
                        entry.type === 'INVOICE'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>
                  <td className="p-3 font-semibold text-foreground">{entry.refNumber}</td>
                  <td className="p-3 font-sans text-muted-foreground">{entry.description}</td>
                  <td className="p-3 text-right text-rose-600 dark:text-rose-400">
                    {entry.debit > 0 ? `₹${entry.debit.toFixed(2)}` : '—'}
                  </td>
                  <td className="p-3 text-right text-emerald-600 dark:text-emerald-400">
                    {entry.credit > 0 ? `₹${entry.credit.toFixed(2)}` : '—'}
                  </td>
                  <td className="p-3 text-right font-bold text-foreground">
                    ₹{entry.balance.toFixed(2)}
                  </td>
                </tr>
              ))}

              {ledger.statement.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center font-sans text-muted-foreground">
                    No transactions recorded for this customer.
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
