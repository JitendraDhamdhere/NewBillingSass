'use client'

import React, { useState } from 'react'
import { Plus, Search, Building, Info, DollarSign, X, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react'
import { createLoan, recordLoanRepayment, getLoanById } from '@/lib/services/loan-service'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoanItem {
  id: string
  lender_borrower_name: string
  loan_type: 'TAKEN' | 'GIVEN'
  principal_amount: number
  outstanding_principal: number
  interest_rate_annual: number
  start_date: string
  due_date: string | null
  status: 'ACTIVE' | 'CLOSED'
  notes: string | null
}

interface CapitalLedgerClientProps {
  initialLoans: LoanItem[]
  businessId: string
}

export default function CapitalLedgerClient({ initialLoans, businessId }: CapitalLedgerClientProps) {
  const [loans, setLoans] = useState<LoanItem[]>(initialLoans)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL')
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'TAKEN' | 'GIVEN'>('ALL')

  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [repayModalLoan, setRepayModalLoan] = useState<LoanItem | null>(null)
  const [loanDetailModal, setLoanDetailModal] = useState<any>(null)

  // New Loan Form State
  const todayStr = new Date().toISOString().split('T')[0]
  const [name, setName] = useState('')
  const [loanType, setLoanType] = useState<'TAKEN' | 'GIVEN'>('TAKEN')
  const [principalAmount, setPrincipalAmount] = useState<number>(0)
  const [interestRate, setInterestRate] = useState<number>(0)
  const [startDate, setStartDate] = useState(todayStr)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  // Repayment Form State
  const [repayDate, setRepayDate] = useState(todayStr)
  const [principalPaid, setPrincipalPaid] = useState<number>(0)
  const [interestPaid, setInterestPaid] = useState<number>(0)
  const [repayPaymentMode, setRepayPaymentMode] = useState<
    'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'
  >('CASH')
  const [refNumber, setRefNumber] = useState('')
  const [repayNotes, setRepayNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, any>>({})

  const filteredLoans = loans.filter((l) => {
    const term = search.toLowerCase()
    const matchesSearch = l.lender_borrower_name.toLowerCase().includes(term)
    const matchesStatus = statusFilter === 'ALL' || l.status === statusFilter
    const matchesType = typeFilter === 'ALL' || l.loan_type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const totalTakenOutstanding = loans
    .filter((l) => l.loan_type === 'TAKEN' && l.status === 'ACTIVE')
    .reduce((acc, curr) => acc + Number(curr.outstanding_principal), 0)

  const totalGivenOutstanding = loans
    .filter((l) => l.loan_type === 'GIVEN' && l.status === 'ACTIVE')
    .reduce((acc, curr) => acc + Number(curr.outstanding_principal), 0)

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const res = await createLoan(businessId, {
      lender_borrower_name: name,
      loan_type: loanType,
      principal_amount: Number(principalAmount),
      interest_rate_annual: Number(interestRate),
      start_date: startDate,
      due_date: dueDate || null,
      notes: notes || null,
    })

    if (res.success && res.data) {
      setLoans((prev) => [res.data as any, ...prev])
      setCreateModalOpen(false)
      // reset
      setName('')
      setPrincipalAmount(0)
      setInterestRate(0)
      setDueDate('')
      setNotes('')
    } else if (res.errors) {
      setErrors(res.errors)
    }
    setLoading(false)
  }

  const handleRecordRepayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repayModalLoan) return
    setLoading(true)
    setErrors({})

    const res = await recordLoanRepayment(businessId, {
      loan_id: repayModalLoan.id,
      repayment_date: repayDate,
      principal_paid: Number(principalPaid),
      interest_paid: Number(interestPaid),
      payment_mode: repayPaymentMode,
      reference_number: refNumber || null,
      notes: repayNotes || null,
    })

    if (res.success && res.data) {
      // update loans list
      const updatedLoans = loans.map((l) => {
        if (l.id === repayModalLoan.id) {
          const newOutstanding = Math.max(0, l.outstanding_principal - Number(principalPaid))
          return {
            ...l,
            outstanding_principal: newOutstanding,
            status: (newOutstanding === 0 ? 'CLOSED' : 'ACTIVE') as any,
          }
        }
        return l
      })
      setLoans(updatedLoans)
      setRepayModalLoan(null)
      setPrincipalPaid(0)
      setInterestPaid(0)
      setRefNumber('')
      setRepayNotes('')
    } else if (res.errors) {
      setErrors(res.errors)
    }
    setLoading(false)
  }

  const handleViewDetails = async (loanId: string) => {
    const data = await getLoanById(businessId, loanId)
    if (data) {
      setLoanDetailModal(data)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Capital Ledger & Loans (Non-Operating)</h2>
          <p className="text-sm text-muted-foreground">Track capital borrowed or lent. Loan principal affects cash position but NEVER affects business operating profit.</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} className="flex items-center gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Add Capital Record / Loan
        </Button>
      </div>

      {/* Accounting Compliance Banner */}
      <div className="p-3 text-xs bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0" />
        <span>
          <strong>FRD Capital Rule:</strong> Loan principal received is NOT treated as revenue. Loan principal repayments decrease liability, NOT profit. Only interest paid is accounted as an operating expense.
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Card className="p-4 border-l-4 border-l-purple-500">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Loans Borrowed (Taken)</span>
          <div className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 font-mono mt-1">
            ₹{totalTakenOutstanding.toFixed(2)}
          </div>
        </Card>

        <Card className="p-4 border-l-4 border-l-indigo-500">
          <span className="text-xs text-muted-foreground font-semibold uppercase">Loans Lent (Given)</span>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono mt-1">
            ₹{totalGivenOutstanding.toFixed(2)}
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search lender or borrower name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={typeFilter}
            onChange={(e: any) => setTypeFilter(e.target.value)}
            className="h-10 text-xs rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="ALL">All Types</option>
            <option value="TAKEN">Loans Borrowed (Taken)</option>
            <option value="GIVEN">Loans Lent (Given)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="h-10 text-xs rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>

      {/* Capital Loans Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="p-3.5">Lender / Borrower</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Start Date</th>
                <th className="p-3.5 text-right">Original Principal</th>
                <th className="p-3.5 text-right">Outstanding Principal</th>
                <th className="p-3.5 text-center">Interest %</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredLoans.map((l) => (
                <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-bold text-foreground">{l.lender_borrower_name}</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        l.loan_type === 'TAKEN'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                          : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'
                      }`}
                    >
                      {l.loan_type === 'TAKEN' ? 'BORROWED' : 'LENT'}
                    </span>
                  </td>
                  <td className="p-3.5 text-muted-foreground text-xs">{l.start_date}</td>
                  <td className="p-3.5 text-right font-mono">₹{Number(l.principal_amount).toFixed(2)}</td>
                  <td className="p-3.5 text-right font-mono font-bold text-foreground">
                    ₹{Number(l.outstanding_principal).toFixed(2)}
                  </td>
                  <td className="p-3.5 text-center font-mono text-xs">{l.interest_rate_annual}% / yr</td>
                  <td className="p-3.5">
                    <span
                      className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${
                        l.status === 'ACTIVE'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      }`}
                    >
                      {l.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {l.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setRepayModalLoan(l)
                            setPrincipalPaid(0)
                            setInterestPaid(0)
                          }}
                          className="h-8 px-2 text-xs text-primary flex items-center gap-1"
                        >
                          <RefreshCw className="h-3.5 w-3.5" /> Repay
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(l.id)}
                        className="h-8 px-2 text-xs"
                      >
                        Ledger History
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-muted-foreground">
                    <Building className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-medium">No capital loan records found</p>
                    <p className="text-xs">Click "Add Capital Record / Loan" to log borrowed/lent funds.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Loan Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg max-w-lg w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg">Add Capital Loan / Udhar Record</h3>
              <button onClick={() => setCreateModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errors._form && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive rounded border border-destructive/20 font-medium">
                {Array.isArray(errors._form) ? errors._form.join(', ') : errors._form}
              </div>
            )}

            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loan-t">Record Type <span className="text-destructive">*</span></Label>
                  <select
                    id="loan-t"
                    value={loanType}
                    onChange={(e: any) => setLoanType(e.target.value)}
                    className="w-full mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="TAKEN">Loan Borrowed (Taken)</option>
                    <option value="GIVEN">Loan Lent (Given)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="loan-name">Lender / Borrower Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="loan-name"
                    placeholder="e.g. HDFC Bank / Friend Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loan-p">Principal Amount (₹) <span className="text-destructive">*</span></Label>
                  <Input
                    id="loan-p"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={principalAmount || ''}
                    onChange={(e) => setPrincipalAmount(parseFloat(e.target.value) || 0)}
                    required
                    className="font-mono font-bold text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="loan-ir">Annual Interest Rate (%)</Label>
                  <Input
                    id="loan-ir"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={interestRate || ''}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="loan-sd">Start Date <span className="text-destructive">*</span></Label>
                  <Input
                    id="loan-sd"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="loan-dd">Due / Maturity Date (Optional)</Label>
                  <Input
                    id="loan-dd"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="loan-notes">Remarks / Purpose</Label>
                <Input
                  id="loan-notes"
                  placeholder="Additional notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="px-6 font-semibold">
                  {loading ? 'Saving...' : 'Save Capital Record'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Repayment Modal (Principal / Interest Split) */}
      {repayModalLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg max-w-lg w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg">Record Loan Repayment</h3>
                <p className="text-xs text-muted-foreground">
                  {repayModalLoan.lender_borrower_name} • Outstanding ₹{Number(repayModalLoan.outstanding_principal).toFixed(2)}
                </p>
              </div>
              <button onClick={() => setRepayModalLoan(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errors._form && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive rounded border border-destructive/20 font-medium">
                {Array.isArray(errors._form) ? errors._form.join(', ') : errors._form}
              </div>
            )}

            <form onSubmit={handleRecordRepayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rep-p">Principal Paid (₹) <span className="text-destructive">*</span></Label>
                  <Input
                    id="rep-p"
                    type="number"
                    step="0.01"
                    min="0"
                    max={repayModalLoan.outstanding_principal}
                    placeholder="0.00"
                    value={principalPaid || ''}
                    onChange={(e) => setPrincipalPaid(parseFloat(e.target.value) || 0)}
                    className="font-mono font-bold"
                  />
                  <p className="text-[10px] text-muted-foreground mt-0.5">Decreases liability balance.</p>
                </div>

                <div>
                  <Label htmlFor="rep-i">Interest Paid (₹)</Label>
                  <Input
                    id="rep-i"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={interestPaid || ''}
                    onChange={(e) => setInterestPaid(parseFloat(e.target.value) || 0)}
                    className="font-mono font-bold text-rose-600 dark:text-rose-400"
                  />
                  <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-0.5">Operating expense affecting profit.</p>
                </div>
              </div>

              <div className="p-3 bg-muted/40 rounded border flex items-center justify-between font-mono text-xs">
                <span>Total Payment Amount:</span>
                <span className="font-bold text-sm text-foreground">
                  ₹{(Number(principalPaid || 0) + Number(interestPaid || 0)).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rep-date">Repayment Date <span className="text-destructive">*</span></Label>
                  <Input
                    id="rep-date"
                    type="date"
                    value={repayDate}
                    onChange={(e) => setRepayDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="rep-pm">Payment Mode</Label>
                  <select
                    id="rep-pm"
                    value={repayPaymentMode}
                    onChange={(e: any) => setRepayPaymentMode(e.target.value)}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rep-ref">Reference / UTR #</Label>
                  <Input
                    id="rep-ref"
                    placeholder="Ref number"
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="rep-notes">Notes</Label>
                  <Input
                    id="rep-notes"
                    placeholder="Remarks"
                    value={repayNotes}
                    onChange={(e) => setRepayNotes(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setRepayModalLoan(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="px-6 font-semibold">
                  {loading ? 'Processing...' : 'Save Repayment'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loan Detail & Repayment History Modal */}
      {loanDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg max-w-xl w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-lg">{loanDetailModal.lender_borrower_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {loanDetailModal.loan_type === 'TAKEN' ? 'Borrowed Loan' : 'Lent Loan'} • Started {loanDetailModal.start_date}
                </p>
              </div>
              <button onClick={() => setLoanDetailModal(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-xs font-mono p-3 bg-muted/30 rounded border">
              <div>
                <span className="text-muted-foreground">Original Principal:</span>
                <p className="font-bold text-foreground">₹{Number(loanDetailModal.principal_amount).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Outstanding:</span>
                <p className="font-bold text-purple-600 dark:text-purple-400">
                  ₹{Number(loanDetailModal.outstanding_principal).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Interest Rate:</span>
                <p className="font-bold text-foreground">{loanDetailModal.interest_rate_annual}% / yr</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold text-xs uppercase text-muted-foreground">Repayment History</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-mono">
                  <thead>
                    <tr className="border-b bg-muted/40 text-[11px] uppercase text-muted-foreground">
                      <th className="p-2">Date</th>
                      <th className="p-2 text-right">Principal Paid</th>
                      <th className="p-2 text-right">Interest Paid</th>
                      <th className="p-2 text-right">Total Paid</th>
                      <th className="p-2">Mode</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {loanDetailModal.repayments.map((rep: any) => (
                      <tr key={rep.id}>
                        <td className="p-2 text-muted-foreground">{rep.repayment_date}</td>
                        <td className="p-2 text-right font-bold">₹{Number(rep.principal_paid).toFixed(2)}</td>
                        <td className="p-2 text-right font-bold text-rose-600 dark:text-rose-400">
                          ₹{Number(rep.interest_paid).toFixed(2)}
                        </td>
                        <td className="p-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{Number(rep.total_amount).toFixed(2)}
                        </td>
                        <td className="p-2">{rep.payment_mode}</td>
                      </tr>
                    ))}

                    {loanDetailModal.repayments.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-muted-foreground font-sans">
                          No repayments recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setLoanDetailModal(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
