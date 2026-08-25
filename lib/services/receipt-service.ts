'use server'

import { createClient } from '@/lib/supabase/server'
import { receiptSchema, validateReceiptAllocation, ReceiptInput } from '@/lib/validations/receipt'
import { roundCurrency } from '@/lib/validations/invoice'

export async function getReceipts(
  businessId: string,
  options?: {
    search?: string
    customerId?: string
    category?: string
    fromDate?: string
    toDate?: string
  }
) {
  const supabase = await createClient()

  let query = supabase
    .from('receipts')
    .select('*, customer:customers(id, name, mobile)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (options?.customerId) {
    query = query.eq('customer_id', options.customerId)
  }

  if (options?.category && options.category !== 'ALL') {
    query = query.eq('category', options.category)
  }

  if (options?.fromDate) {
    query = query.gte('receipt_date', options.fromDate)
  }

  if (options?.toDate) {
    query = query.lte('receipt_date', options.toDate)
  }

  if (options?.search && options.search.trim() !== '') {
    const term = `%${options.search.trim()}%`
    query = query.or(`receipt_number.ilike.${term},notes.ilike.${term},reference_number.ilike.${term}`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch receipts: ${error.message}`)
  }

  return data
}

export async function getReceiptById(businessId: string, receiptId: string) {
  const supabase = await createClient()

  const { data: receipt, error: recErr } = await supabase
    .from('receipts')
    .select('*, customer:customers(*)')
    .eq('business_id', businessId)
    .eq('id', receiptId)
    .single()

  if (recErr || !receipt) {
    return null
  }

  // Fetch allocations with invoice details
  const { data: allocations } = await supabase
    .from('receipt_allocations')
    .select('*, invoice:invoices(id, invoice_number, grand_total, balance_due, status)')
    .eq('business_id', businessId)
    .eq('receipt_id', receiptId)

  return {
    ...receipt,
    allocations: allocations || [],
  }
}

export async function getCustomerOutstandingInvoices(businessId: string, customerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('invoices')
    .select('id, invoice_number, invoice_date, due_date, grand_total, paid_amount, balance_due, status')
    .eq('business_id', businessId)
    .eq('customer_id', customerId)
    .gt('balance_due', 0)
    .neq('status', 'CANCELLED')
    .order('invoice_date', { ascending: true }) // Oldest first per FRD

  if (error) {
    throw new Error(`Failed to fetch outstanding invoices: ${error.message}`)
  }

  return data || []
}

export async function createReceipt(businessId: string, input: Omit<ReceiptInput, 'business_id'>, userId?: string) {
  const validation = receiptSchema.safeParse({ ...input, business_id: businessId })

  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, data: null }
  }

  const data = validation.data
  const supabase = await createClient()

  // If customer & allocations provided, fetch targeted invoices for verification
  const invoiceMap = new Map<string, { balance_due: number; invoice_number: string; paid_amount: number; grand_total: number }>()

  if (data.allocations && data.allocations.length > 0) {
    const invoiceIds = data.allocations.map((a) => a.invoice_id)
    const { data: invList } = await supabase
      .from('invoices')
      .select('id, invoice_number, balance_due, paid_amount, grand_total')
      .eq('business_id', businessId)
      .in('id', invoiceIds)

    if (invList) {
      for (const inv of invList) {
        invoiceMap.set(inv.id, {
          balance_due: Number(inv.balance_due),
          paid_amount: Number(inv.paid_amount),
          grand_total: Number(inv.grand_total),
          invoice_number: inv.invoice_number,
        })
      }
    }
  }

  // Validate allocations
  const allocResult = validateReceiptAllocation(data.amount, data.allocations, invoiceMap as any)

  if (!allocResult.is_valid) {
    return { success: false, errors: { _form: allocResult.errors }, data: null }
  }

  // Generate Receipt Number
  const dateCompact = data.receipt_date.replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const receiptNum = `REC-${dateCompact}-${randomSuffix}`

  // Insert Receipt
  const { data: receipt, error: recInsertErr } = await supabase
    .from('receipts')
    .insert({
      business_id: businessId,
      receipt_number: receiptNum,
      customer_id: data.customer_id || null,
      category: data.category,
      description: data.description || null,
      receipt_date: data.receipt_date,
      amount: allocResult.payment_amount,
      payment_mode: data.payment_mode,
      reference_number: data.reference_number || null,
      notes: data.notes || null,
      created_by: userId || null,
    })
    .select()
    .single()

  if (recInsertErr || !receipt) {
    return { success: false, errors: { _form: [recInsertErr?.message || 'Receipt creation failed'] }, data: null }
  }

  // Insert Receipt Allocations & Update Invoices
  if (data.allocations && data.allocations.length > 0) {
    const validAllocations = data.allocations.filter((a) => a.allocated_amount > 0)

    for (const alloc of validAllocations) {
      const invInfo = invoiceMap.get(alloc.invoice_id)
      if (!invInfo) continue

      // Insert Allocation
      await supabase.from('receipt_allocations').insert({
        receipt_id: receipt.id,
        invoice_id: alloc.invoice_id,
        business_id: businessId,
        allocated_amount: roundCurrency(alloc.allocated_amount),
      })

      // Recalculate invoice status & balance due
      const newPaid = roundCurrency(invInfo.paid_amount + alloc.allocated_amount)
      const newBalance = roundCurrency(Math.max(0, invInfo.grand_total - newPaid))
      const newStatus = newBalance === 0 ? 'PAID' : newPaid > 0 ? 'PARTIALLY_PAID' : 'UNPAID'

      await supabase
        .from('invoices')
        .update({
          paid_amount: newPaid,
          balance_due: newBalance,
          status: newStatus,
          updated_by: userId || null,
        })
        .eq('business_id', businessId)
        .eq('id', alloc.invoice_id)
    }
  }

  return { success: true, errors: null, data: receipt }
}

export async function getAllOutstandingReceivables(
  businessId: string,
  options?: {
    search?: string
    statusFilter?: 'ALL' | 'OVERDUE' | 'DUE_SOON' | 'PENDING'
  }
) {
  const supabase = await createClient()

  const todayStr = new Date().toISOString().split('T')[0]

  let query = supabase
    .from('invoices')
    .select('*, customer:customers(id, name, mobile, email)')
    .eq('business_id', businessId)
    .gt('balance_due', 0)
    .neq('status', 'CANCELLED')
    .order('due_date', { ascending: true })

  if (options?.search && options.search.trim() !== '') {
    const term = `%${options.search.trim()}%`
    query = query.or(`invoice_number.ilike.${term},customer_name.ilike.${term},customer_mobile.ilike.${term}`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch receivables: ${error.message}`)
  }

  const receivables = (data || []).map((inv) => {
    let calculatedStatus: 'OVERDUE' | 'DUE_SOON' | 'PENDING' = 'PENDING'

    if (inv.due_date) {
      if (inv.due_date < todayStr) {
        calculatedStatus = 'OVERDUE'
      } else {
        const dueDateObj = new Date(inv.due_date)
        const todayObj = new Date(todayStr)
        const diffDays = Math.ceil((dueDateObj.getTime() - todayObj.getTime()) / (1000 * 3600 * 24))
        if (diffDays >= 0 && diffDays <= 7) {
          calculatedStatus = 'DUE_SOON'
        }
      }
    }

    return {
      ...inv,
      calculatedStatus,
    }
  })

  if (options?.statusFilter && options.statusFilter !== 'ALL') {
    return receivables.filter((r) => r.calculatedStatus === options.statusFilter)
  }

  return receivables
}

export async function getCustomerLedger(businessId: string, customerId: string) {
  const supabase = await createClient()

  // Fetch all invoices for customer
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, invoice_date, grand_total, paid_amount, balance_due, status')
    .eq('business_id', businessId)
    .eq('customer_id', customerId)
    .order('invoice_date', { ascending: true })

  // Fetch all receipts for customer
  const { data: receipts } = await supabase
    .from('receipts')
    .select('id, receipt_number, receipt_date, amount, payment_mode, notes')
    .eq('business_id', businessId)
    .eq('customer_id', customerId)
    .order('receipt_date', { ascending: true })

  // Combine into single ledger timeline
  const ledgerEntries: Array<{
    date: string
    type: 'INVOICE' | 'RECEIPT'
    refNumber: string
    debit: number // Invoice increases customer balance
    credit: number // Receipt decreases customer balance
    description: string
  }> = []

  if (invoices) {
    for (const inv of invoices) {
      if (inv.status !== 'CANCELLED') {
        ledgerEntries.push({
          date: inv.invoice_date,
          type: 'INVOICE',
          refNumber: inv.invoice_number,
          debit: Number(inv.grand_total),
          credit: 0,
          description: `Invoice ${inv.invoice_number}`,
        })
      }
    }
  }

  if (receipts) {
    for (const rec of receipts) {
      ledgerEntries.push({
        date: rec.receipt_date,
        type: 'RECEIPT',
        refNumber: rec.receipt_number,
        debit: 0,
        credit: Number(rec.amount),
        description: `Receipt ${rec.receipt_number} (${rec.payment_mode}) ${rec.notes ? '- ' + rec.notes : ''}`,
      })
    }
  }

  // Sort by date ascending
  ledgerEntries.sort((a, b) => (a.date > b.date ? 1 : -1))

  let runningBalance = 0
  const statement = ledgerEntries.map((entry) => {
    runningBalance = roundCurrency(runningBalance + entry.debit - entry.credit)
    return {
      ...entry,
      balance: runningBalance,
    }
  })

  return {
    statement,
    totalBilled: roundCurrency(statement.reduce((acc, curr) => acc + curr.debit, 0)),
    totalPaid: roundCurrency(statement.reduce((acc, curr) => acc + curr.credit, 0)),
    netBalance: runningBalance,
  }
}

export async function getDashboardCollectionMetrics(businessId: string) {
  const supabase = await createClient()
  const todayStr = new Date().toISOString().split('T')[0]

  // 1. Today's collections
  const { data: todayReceipts } = await supabase
    .from('receipts')
    .select('amount')
    .eq('business_id', businessId)
    .eq('receipt_date', todayStr)

  const todaysCollection = (todayReceipts || []).reduce((acc, r) => acc + Number(r.amount), 0)

  // 2. All uncancelled invoices for outstanding calculations
  const { data: activeInvoices } = await supabase
    .from('invoices')
    .select('balance_due, due_date')
    .eq('business_id', businessId)
    .gt('balance_due', 0)
    .neq('status', 'CANCELLED')

  let totalOutstanding = 0
  let overdueAmount = 0
  let dueTodayAmount = 0

  if (activeInvoices) {
    for (const inv of activeInvoices) {
      const bal = Number(inv.balance_due)
      totalOutstanding += bal

      if (inv.due_date) {
        if (inv.due_date < todayStr) {
          overdueAmount += bal
        } else if (inv.due_date === todayStr) {
          dueTodayAmount += bal
        }
      }
    }
  }

  return {
    todaysCollection: roundCurrency(todaysCollection),
    totalOutstanding: roundCurrency(totalOutstanding),
    overdueAmount: roundCurrency(overdueAmount),
    dueTodayAmount: roundCurrency(dueTodayAmount),
  }
}
