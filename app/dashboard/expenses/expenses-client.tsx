'use client'

import React, { useState } from 'react'
import { Plus, Search, DollarSign, Tag, Calendar, X, AlertCircle } from 'lucide-react'
import { createExpense } from '@/lib/services/expense-service'
import { DEFAULT_EXPENSE_CATEGORIES } from '@/lib/validations/expense'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ExpenseItem {
  id: string
  expense_number: string
  category: string
  description: string
  amount: number
  expense_date: string
  payment_mode: string
  payee_vendor: string | null
  attachment_url: string | null
  notes: string | null
}

interface ExpensesClientProps {
  initialExpenses: ExpenseItem[]
  businessId: string
}

export default function ExpensesClient({ initialExpenses, businessId }: ExpensesClientProps) {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(initialExpenses)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [modalOpen, setModalOpen] = useState(false)

  // Form State
  const todayStr = new Date().toISOString().split('T')[0]
  const [category, setCategory] = useState<string>('Rent')
  const [customCategory, setCustomCategory] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState<number>(0)
  const [expenseDate, setExpenseDate] = useState(todayStr)
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE' | 'CARD' | 'OTHER'>('CASH')
  const [payeeVendor, setPayeeVendor] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, any>>({})

  const filteredExpenses = expenses.filter((e) => {
    const term = search.toLowerCase()
    const matchesSearch =
      e.expense_number.toLowerCase().includes(term) ||
      e.description.toLowerCase().includes(term) ||
      (e.payee_vendor && e.payee_vendor.toLowerCase().includes(term))

    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalExpenseSum = filteredExpenses.reduce((acc, curr) => acc + Number(curr.amount), 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const finalCategory = category === 'CUSTOM' ? customCategory.trim() : category

    const res = await createExpense(businessId, {
      category: finalCategory,
      description,
      amount: Number(amount),
      expense_date: expenseDate,
      payment_mode: paymentMode,
      payee_vendor: payeeVendor || null,
      notes: notes || null,
    })

    if (res.success && res.data) {
      setExpenses((prev) => [res.data as any, ...prev])
      setModalOpen(false)
      // reset form
      setDescription('')
      setAmount(0)
      setPayeeVendor('')
      setNotes('')
    } else if (res.errors) {
      setErrors(res.errors)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Business Expenses (Overhead)</h2>
          <p className="text-sm text-muted-foreground">Track operating expenses like Rent, Salary, Electricity, Marketing & Subscriptions.</p>
        </div>
        <Button onClick={() => setModalOpen(true)} className="flex items-center gap-2 font-semibold">
          <Plus className="h-4 w-4" /> Add New Expense
        </Button>
      </div>

      {/* Summary Card */}
      <Card className="p-4 border-l-4 border-l-rose-500 max-w-sm">
        <span className="text-xs text-muted-foreground font-semibold uppercase">Total Overhead Expenses</span>
        <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 font-mono mt-1">
          ₹{totalExpenseSum.toFixed(2)}
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expense description, payee, ref #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 text-xs rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="ALL">All Categories</option>
          {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b text-xs uppercase font-semibold text-muted-foreground">
              <tr>
                <th className="p-3.5">Expense #</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Payee / Vendor</th>
                <th className="p-3.5">Mode</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-3.5 font-mono font-medium text-primary">{exp.expense_number}</td>
                  <td className="p-3.5 text-muted-foreground whitespace-nowrap text-xs">{exp.expense_date}</td>
                  <td className="p-3.5">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-medium text-foreground">{exp.description}</td>
                  <td className="p-3.5 text-muted-foreground text-xs">{exp.payee_vendor || '—'}</td>
                  <td className="p-3.5 font-mono text-xs">{exp.payment_mode}</td>
                  <td className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400 font-mono">
                    ₹{Number(exp.amount).toFixed(2)}
                  </td>
                </tr>
              ))}

              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <DollarSign className="h-10 w-10 mx-auto text-muted-foreground/40 mb-2" />
                    <p className="font-medium">No business expenses found</p>
                    <p className="text-xs">Click "Add New Expense" to log overhead costs.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Expense Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg border shadow-lg max-w-lg w-full p-6 space-y-4 relative">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-lg">Add Business Expense</h3>
              <button onClick={() => setModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            {errors._form && (
              <div className="p-3 text-xs bg-destructive/10 text-destructive rounded border border-destructive/20 font-medium">
                {Array.isArray(errors._form) ? errors._form.join(', ') : errors._form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exp-cat">Category <span className="text-destructive">*</span></Label>
                  <select
                    id="exp-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {DEFAULT_EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Custom Category</option>
                  </select>
                </div>

                {category === 'CUSTOM' && (
                  <div>
                    <Label htmlFor="custom-cat">Custom Category Name <span className="text-destructive">*</span></Label>
                    <Input
                      id="custom-cat"
                      placeholder="e.g. Legal Fees"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="exp-amount">Amount (₹) <span className="text-destructive">*</span></Label>
                  <Input
                    id="exp-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    required
                    className="font-mono font-bold text-rose-600 dark:text-rose-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="exp-desc">Description / Particulars <span className="text-destructive">*</span></Label>
                <Input
                  id="exp-desc"
                  placeholder="e.g. Monthly shop rent payment"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="exp-date">Expense Date <span className="text-destructive">*</span></Label>
                  <Input
                    id="exp-date"
                    type="date"
                    value={expenseDate}
                    onChange={(e) => setExpenseDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="exp-pm">Payment Mode</Label>
                  <select
                    id="exp-pm"
                    value={paymentMode}
                    onChange={(e: any) => setPaymentMode(e.target.value)}
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

              <div>
                <Label htmlFor="exp-vendor">Payee / Vendor Name (Optional)</Label>
                <Input
                  id="exp-vendor"
                  placeholder="e.g. Landlord Name / Electricity Board"
                  value={payeeVendor}
                  onChange={(e) => setPayeeVendor(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="exp-notes">Notes / Remarks</Label>
                <Input
                  id="exp-notes"
                  placeholder="Additional remarks"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="px-6 font-semibold">
                  {loading ? 'Saving...' : 'Save Expense'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
