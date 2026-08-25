'use client'

import React, { useState } from 'react'
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  Printer,
  FileSpreadsheet,
} from 'lucide-react'
import { getProfitAndLossReport } from '@/lib/services/report-service'
import { getFYDateRange } from '@/lib/validations/report'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ReportsClientProps {
  initialPnL: any
  currentFY: { fyCode: string; startDate: string; endDate: string }
  businessId: string
  businessName: string
}

export default function ReportsClient({
  initialPnL,
  currentFY,
  businessId,
  businessName,
}: ReportsClientProps) {
  const [pnl, setPnl] = useState(initialPnL)
  const [preset, setPreset] = useState<string>('FY_CURRENT')
  const [fyCode, setFyCode] = useState<string>(currentFY.fyCode)
  const [fromDate, setFromDate] = useState<string>(currentFY.startDate)
  const [toDate, setToDate] = useState<string>(currentFY.endDate)

  const [activeTab, setActiveTab] = useState<'PNL' | 'BILLING' | 'RECEIPTS' | 'PAYMENTS' | 'EXPENSES' | 'LOANS'>('PNL')
  const [loading, setLoading] = useState(false)

  // Handle Date Filter Change
  const handlePresetChange = async (selectedPreset: string) => {
    setPreset(selectedPreset)
    let start = fromDate
    let end = toDate

    const todayStr = new Date().toISOString().split('T')[0]
    const now = new Date()

    if (selectedPreset === 'TODAY') {
      start = todayStr
      end = todayStr
    } else if (selectedPreset === 'MONTH') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      end = todayStr
    } else if (selectedPreset === 'FY_CURRENT') {
      start = currentFY.startDate
      end = currentFY.endDate
      setFyCode(currentFY.fyCode)
    } else if (selectedPreset === 'FY_PREVIOUS') {
      const prevParts = currentFY.fyCode.split('-')
      const prevStartYear = parseInt(prevParts[0], 10) - 1
      const prevCode = `${prevStartYear}-${String(prevStartYear + 1).slice(-2)}`
      const range = getFYDateRange(prevCode)
      start = range.startDate
      end = range.endDate
      setFyCode(prevCode)
    }

    setFromDate(start)
    setToDate(end)

    setLoading(true)
    const newPnL = await getProfitAndLossReport(businessId, start, end)
    setPnl(newPnL)
    setLoading(false)
  }

  const handleCustomFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const newPnL = await getProfitAndLossReport(businessId, fromDate, toDate)
    setPnl(newPnL)
    setLoading(false)
  }

  const handleExportCSV = () => {
    const csvRows = [
      ['Profit & Loss Statement', businessName],
      ['Period', `${fromDate} to ${toDate}`],
      [],
      ['Particulars', 'Amount (INR)'],
      ['OPERATING INCOME', ''],
      ['Total Receipts & Collections', pnl.receipts_total.toFixed(2)],
      ['TOTAL OPERATING REVENUE', pnl.total_operating_income.toFixed(2)],
      [],
      ['OPERATING EXPENSES', ''],
      ['Vendor / Worker Payments', pnl.vendor_payments_total.toFixed(2)],
      ['Overhead Business Expenses', pnl.overhead_expenses_total.toFixed(2)],
      ['Capital Loan Interest Paid', pnl.loan_interest_paid_total.toFixed(2)],
      ['TOTAL OPERATING EXPENSES', pnl.total_operating_expenses.toFixed(2)],
      [],
      ['NET OPERATING PROFIT', pnl.net_operating_profit.toFixed(2)],
      [],
      ['EXCLUDED CAPITAL TRANSACTIONS (NOT IN P&L)', ''],
      ['Loan Principal Received', pnl.capital_ledger_excluded.loan_principal_received.toFixed(2)],
      ['Loan Principal Repaid', pnl.capital_ledger_excluded.loan_principal_repaid.toFixed(2)],
    ]

    const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Profit_Loss_Statement_${fromDate}_to_${toDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financial Reports & Profit & Loss</h2>
          <p className="text-sm text-muted-foreground">Comprehensive accounting statements with Indian Financial Year (1 April - 31 March) filtering.</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()} className="flex items-center gap-1.5 text-xs">
            <Printer className="h-4 w-4" /> Print Statement
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="flex items-center gap-1.5 text-xs text-emerald-600 border-emerald-300">
            <FileSpreadsheet className="h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      {/* Date & Financial Year Filters Bar */}
      <Card className="p-4 bg-muted/20 border space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase text-muted-foreground mr-2">Preset Filters:</span>
          <Button
            variant={preset === 'FY_CURRENT' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange('FY_CURRENT')}
            className="text-xs h-8"
          >
            Current FY ({currentFY.fyCode})
          </Button>
          <Button
            variant={preset === 'FY_PREVIOUS' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange('FY_PREVIOUS')}
            className="text-xs h-8"
          >
            Previous FY
          </Button>
          <Button
            variant={preset === 'MONTH' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange('MONTH')}
            className="text-xs h-8"
          >
            This Month
          </Button>
          <Button
            variant={preset === 'TODAY' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePresetChange('TODAY')}
            className="text-xs h-8"
          >
            Today
          </Button>
        </div>

        {/* Custom Date Inputs */}
        <form onSubmit={handleCustomFilterSubmit} className="flex flex-wrap items-center gap-3 pt-2 border-t text-xs">
          <div className="flex items-center gap-2">
            <Label htmlFor="from-d">From Date:</Label>
            <Input
              id="from-d"
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value)
                setPreset('CUSTOM')
              }}
              className="h-8 w-36 text-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <Label htmlFor="to-d">To Date:</Label>
            <Input
              id="to-d"
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value)
                setPreset('CUSTOM')
              }}
              className="h-8 w-36 text-xs"
            />
          </div>

          <Button type="submit" size="sm" disabled={loading} className="h-8 text-xs font-semibold px-4">
            {loading ? 'Updating...' : 'Apply Date Range'}
          </Button>
        </form>
      </Card>

      {/* Reports Tabs */}
      <div className="border-b flex items-center gap-4 text-sm font-medium">
        <button
          onClick={() => setActiveTab('PNL')}
          className={`pb-2 border-b-2 transition-colors ${
            activeTab === 'PNL' ? 'border-primary text-primary font-bold' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Profit & Loss Statement
        </button>
      </div>

      {/* PROFIT & LOSS STATEMENT TAB */}
      {activeTab === 'PNL' && (
        <div className="space-y-6">
          {/* P&L Statement Card */}
          <Card className="p-6 space-y-6 border shadow-sm">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-xl font-bold tracking-tight">Profit & Loss Statement</h3>
                <p className="text-xs text-muted-foreground">
                  Statement for {fromDate} to {toDate} {preset.startsWith('FY') ? `(${fyCode})` : ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Net Profit</span>
                <div
                  className={`text-2xl font-extrabold font-mono ${
                    pnl.net_operating_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}
                >
                  ₹{pnl.net_operating_profit.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Operating Revenue Section */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                1. Operating Revenue (Money In)
              </h4>
              <div className="divide-y text-sm font-mono bg-muted/20 rounded border">
                <div className="p-3 flex justify-between">
                  <span className="font-sans text-muted-foreground">Customer Receipts & Direct Collections</span>
                  <span className="font-bold text-foreground">₹{pnl.receipts_total.toFixed(2)}</span>
                </div>
                <div className="p-3 flex justify-between font-bold bg-muted/40 text-base">
                  <span className="font-sans">Total Operating Revenue (A)</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{pnl.total_operating_income.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Operating Expenses Section */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs uppercase text-rose-600 dark:text-rose-400 tracking-wider">
                2. Operating Costs & Expenses (Money Out)
              </h4>
              <div className="divide-y text-sm font-mono bg-muted/20 rounded border">
                <div className="p-3 flex justify-between">
                  <span className="font-sans text-muted-foreground">Vendor & Subcontractor Payments</span>
                  <span className="font-bold text-foreground">₹{pnl.vendor_payments_total.toFixed(2)}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-sans text-muted-foreground">Overhead Business Expenses (Rent, Salary, Overheads)</span>
                  <span className="font-bold text-foreground">₹{pnl.overhead_expenses_total.toFixed(2)}</span>
                </div>
                <div className="p-3 flex justify-between">
                  <span className="font-sans text-muted-foreground">Capital Loan Interest Paid</span>
                  <span className="font-bold text-foreground">₹{pnl.loan_interest_paid_total.toFixed(2)}</span>
                </div>
                <div className="p-3 flex justify-between font-bold bg-muted/40 text-base">
                  <span className="font-sans">Total Operating Costs (B)</span>
                  <span className="text-rose-600 dark:text-rose-400">₹{pnl.total_operating_expenses.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Net Operating Profit Calculation Result */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 flex items-center justify-between font-mono">
              <div>
                <span className="text-xs uppercase font-bold text-primary">NET OPERATING PROFIT (A - B)</span>
                <p className="text-[11px] text-muted-foreground font-sans mt-0.5">Operating Revenue minus Total Costs</p>
              </div>
              <div
                className={`text-2xl font-extrabold ${
                  pnl.net_operating_profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                ₹{pnl.net_operating_profit.toFixed(2)}
              </div>
            </div>

            {/* Excluded Capital Ledger Disclosure */}
            <div className="p-3 bg-muted/30 rounded border space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-muted-foreground uppercase text-[11px]">
                <ShieldCheck className="h-4 w-4 text-primary" /> Capital Ledger Non-Operating Disclosure (Excluded from P&L)
              </div>
              <div className="grid grid-cols-2 gap-4 font-mono">
                <div>
                  <span className="text-muted-foreground">Loan Principal Received in Period:</span>
                  <p className="font-bold text-foreground">₹{pnl.capital_ledger_excluded.loan_principal_received.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Loan Principal Repaid in Period:</span>
                  <p className="font-bold text-foreground">₹{pnl.capital_ledger_excluded.loan_principal_repaid.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
