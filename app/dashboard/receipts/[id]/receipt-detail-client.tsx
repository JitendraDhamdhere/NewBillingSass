'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Printer, Share2, Building, CheckCircle2, FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ReceiptDetailProps {
  receipt: any
  business: any
  businessId: string
}

export default function ReceiptDetailClient({ receipt, business }: ReceiptDetailProps) {
  const router = useRouter()

  const handlePrint = () => {
    window.print()
  }

  const handleWhatsAppShare = () => {
    const mobile = receipt.customer?.mobile || ''
    const text = encodeURIComponent(
      `Hello ${receipt.customer?.name || 'Customer'},\n\nPayment receipt *${receipt.receipt_number}* of *₹${Number(receipt.amount).toFixed(2)}* confirmed by *${business.name}*.\nDate: ${receipt.receipt_date}\nPayment Mode: ${receipt.payment_mode}\n\nThank you!`
    )
    const url = mobile ? `https://wa.me/${mobile.replace(/[^0-9]/g, '')}?text=${text}` : `https://wa.me/?text=${text}`
    window.open(url, '_blank')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 print:m-0 print:max-w-none print:p-0">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/receipts')} className="h-9 w-9 p-0">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight font-mono">{receipt.receipt_number}</h2>
            <p className="text-xs text-muted-foreground">Issued on {receipt.receipt_date}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1.5 text-xs">
            <Printer className="h-4 w-4" /> Print / PDF Receipt
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
          >
            <Share2 className="h-4 w-4" /> WhatsApp Receipt
          </Button>
        </div>
      </div>

      {/* Printable Receipt Card */}
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
            <h2 className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1.5">
              <CheckCircle2 className="h-5 w-5" /> PAYMENT RECEIPT
            </h2>
            <p className="font-mono text-sm font-semibold">{receipt.receipt_number}</p>
            <p className="text-xs text-muted-foreground">Date: {receipt.receipt_date}</p>
          </div>
        </div>

        {/* Customer & Payment Info */}
        <div className="grid grid-cols-2 gap-4 text-sm bg-muted/20 p-4 rounded-md border">
          <div>
            <span className="text-xs text-muted-foreground uppercase font-semibold">Received From:</span>
            <p className="font-bold text-foreground mt-1">
              {receipt.customer?.name || (receipt.category === 'STANDALONE_INCOME' ? 'Standalone Income Source' : 'Direct Customer')}
            </p>
            {receipt.customer?.mobile && <p className="text-xs text-muted-foreground">Ph: {receipt.customer.mobile}</p>}
          </div>
          <div className="text-right space-y-1 text-xs">
            <span className="text-muted-foreground uppercase font-semibold">Payment Mode:</span>
            <p className="font-bold text-foreground text-sm uppercase">{receipt.payment_mode}</p>
            {receipt.reference_number && <p className="text-muted-foreground">Ref #: {receipt.reference_number}</p>}
            <p className="text-muted-foreground">Category: {receipt.category.replace('_', ' ')}</p>
          </div>
        </div>

        {/* Amount Box */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-md flex items-center justify-between">
          <span className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">TOTAL AMOUNT RECEIVED</span>
          <span className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            ₹{Number(receipt.amount).toFixed(2)}
          </span>
        </div>

        {/* Invoice Allocations Breakdown */}
        {receipt.allocations && receipt.allocations.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="font-semibold text-xs uppercase text-muted-foreground">Invoice Allocations Breakdown</h3>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs uppercase font-semibold text-muted-foreground">
                  <th className="p-2.5">Invoice #</th>
                  <th className="p-2.5 text-right">Invoice Total</th>
                  <th className="p-2.5 text-right">Allocated Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-mono">
                {receipt.allocations.map((alloc: any) => (
                  <tr key={alloc.id}>
                    <td className="p-2.5 font-bold text-primary">{alloc.invoice?.invoice_number || 'Invoice'}</td>
                    <td className="p-2.5 text-right text-muted-foreground">
                      ₹{Number(alloc.invoice?.grand_total || 0).toFixed(2)}
                    </td>
                    <td className="p-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(alloc.allocated_amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Notes / Remarks */}
        {receipt.notes && (
          <div className="text-xs text-muted-foreground pt-4 border-t">
            <span className="font-semibold text-foreground">Remarks:</span> {receipt.notes}
          </div>
        )}
      </Card>
    </div>
  )
}
