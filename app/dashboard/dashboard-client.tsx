'use client'

import React from 'react'
import Link from 'next/link'
import {
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  PlusCircle,
  ShieldCheck,
  CheckCircle2,
  Building,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface DashboardClientProps {
  metrics: {
    today: {
      billsCount: number
      billsAmount: number
      collectionAmount: number
      paymentsAmount: number
      expensesAmount: number
    }
    month: {
      income: number
      costs: number
      netProfit: number
      totalOutstanding: number
      loanTakenOutstanding: number
      loanGivenOutstanding: number
    }
    notifications: {
      overdueCount: number
      overdueAmount: number
      dueTodayCount: number
      dueTodayAmount: number
      receivedTodayAmount: number
    }
    recentReceipts: Array<{
      id: string
      receipt_number: string
      amount: number
      receipt_date: string
      customer_name: string | null
      category: string
    }>
  }
  businessName: string
}

export default function DashboardClient({ metrics, businessName }: DashboardClientProps) {
  const { today, month, notifications, recentReceipts } = metrics

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-xl border">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {businessName}</h1>
          <p className="text-sm text-muted-foreground">Here is your daily executive ledger & financial performance summary.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/invoices/new">
            <Button size="sm" className="flex items-center gap-1.5 font-semibold text-xs">
              <PlusCircle className="h-4 w-4" /> Create Bill
            </Button>
          </Link>
          <Link href="/dashboard/receipts/new">
            <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs">
              <ArrowUpRight className="h-4 w-4 text-emerald-600" /> Record Receipt
            </Button>
          </Link>
          <Link href="/dashboard/payments">
            <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-xs">
              <ArrowDownLeft className="h-4 w-4 text-amber-600" /> Record Payment
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. TODAY'S PERFORMANCE GRID */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Today's Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Today's Invoices ({today.billsCount})</span>
              <FileText className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-foreground">
              ₹{today.billsAmount.toFixed(2)}
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-emerald-500 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Today's Collection (Receipts)</span>
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ₹{today.collectionAmount.toFixed(2)}
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-amber-500 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Today's Vendor Payments</span>
              <ArrowDownLeft className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              ₹{today.paymentsAmount.toFixed(2)}
            </div>
          </Card>

          <Card className="p-4 border-l-4 border-l-rose-500 space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
              <span>Today's Overhead Expenses</span>
              <DollarSign className="h-4 w-4 text-rose-500" />
            </div>
            <div className="text-2xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              ₹{today.expensesAmount.toFixed(2)}
            </div>
          </Card>
        </div>
      </div>

      {/* 2. MONTHLY FINANCIAL SUMMARY & PROFIT ENGINE */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">This Month's Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 space-y-2">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Operating Income (Receipts)</span>
            <div className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              ₹{month.income.toFixed(2)}
            </div>
            <p className="text-[11px] text-muted-foreground">Excludes capital loans received</p>
          </Card>

          <Card className="p-5 space-y-2">
            <span className="text-xs text-muted-foreground font-semibold uppercase">Operating Costs (Payments + Expenses)</span>
            <div className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              ₹{month.costs.toFixed(2)}
            </div>
            <p className="text-[11px] text-muted-foreground">Vendor payments + overheads + loan interest</p>
          </Card>

          <Card className={`p-5 space-y-2 ${month.netProfit >= 0 ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300' : 'bg-rose-50/50 dark:bg-rose-950/30 border-rose-300'}`}>
            <span className="text-xs font-semibold uppercase text-muted-foreground flex items-center justify-between">
              Net Operating Profit
              <TrendingUp className={`h-4 w-4 ${month.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`} />
            </span>
            <div className={`text-3xl font-extrabold font-mono ${month.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              ₹{month.netProfit.toFixed(2)}
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Income minus Operating Costs</p>
          </Card>
        </div>
      </div>

      {/* 3. RECEIVABLES & CAPITAL LEDGER METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm">Customer Outstanding Receivables</h3>
              <p className="text-xs text-muted-foreground">Total unpaid customer invoice balances</p>
            </div>
            <Link href="/dashboard/outstanding">
              <Button size="sm" variant="ghost" className="text-xs text-primary">
                Manage Outstanding →
              </Button>
            </Link>
          </div>
          <div className="text-3xl font-extrabold font-mono text-foreground">
            ₹{month.totalOutstanding.toFixed(2)}
          </div>

          {notifications.overdueCount > 0 && (
            <div className="p-2.5 bg-destructive/10 text-destructive text-xs rounded border border-destructive/20 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                <strong>{notifications.overdueCount} Overdue Invoices</strong> totaling ₹{notifications.overdueAmount.toFixed(2)}
              </span>
            </div>
          )}
        </Card>

        <Card className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="font-bold text-sm">Capital Ledger / Loans</h3>
              <p className="text-xs text-muted-foreground">Non-operating borrowed vs. lent funds</p>
            </div>
            <Link href="/dashboard/capital-ledger">
              <Button size="sm" variant="ghost" className="text-xs text-primary">
                View Loans →
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-sm">
            <div className="p-3 bg-muted/40 rounded border">
              <span className="text-[11px] font-sans text-muted-foreground uppercase">Loans Borrowed (Taken)</span>
              <p className="text-lg font-bold text-purple-600 dark:text-purple-400 mt-1">₹{month.loanTakenOutstanding.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-muted/40 rounded border">
              <span className="text-[11px] font-sans text-muted-foreground uppercase">Loans Lent (Given)</span>
              <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-1">₹{month.loanGivenOutstanding.toFixed(2)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 4. RECENT ACTIVITY & RECEIPTS */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base flex items-center gap-2">
            <ArrowUpRight className="h-5 w-5 text-emerald-600" /> Recent Receipts / Collection Stream
          </h3>
          <Link href="/dashboard/receipts">
            <Button size="sm" variant="outline" className="text-xs">
              View All Receipts
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground font-semibold">
              <tr>
                <th className="p-2.5">Receipt #</th>
                <th className="p-2.5">Date</th>
                <th className="p-2.5">Customer / Source</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs">
              {recentReceipts.map((r) => (
                <tr key={r.id} className="hover:bg-muted/20">
                  <td className="p-2.5 font-mono font-bold text-primary">{r.receipt_number}</td>
                  <td className="p-2.5 text-muted-foreground font-mono">{r.receipt_date}</td>
                  <td className="p-2.5 font-semibold text-foreground">{r.customer_name || 'Walk-in / Direct'}</td>
                  <td className="p-2.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold uppercase text-[10px]">
                      {r.category}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(r.amount).toFixed(2)}
                  </td>
                </tr>
              ))}

              {recentReceipts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No receipts recorded recently.
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
