'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentFinancialYear, calculateProfitAndLoss } from '@/lib/validations/report'

export async function getExecutiveDashboardMetrics(businessId: string) {
  const supabase = await createClient()
  const todayStr = new Date().toISOString().split('T')[0]

  // Month Date Range (1st of current month to today)
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]

  // 1. TODAY'S METRICS
  // Invoices Today
  const { data: invToday } = await supabase
    .from('invoices')
    .select('grand_total, paid_amount, balance_due')
    .eq('business_id', businessId)
    .eq('invoice_date', todayStr)
    .neq('status', 'CANCELLED')

  const todayBillsCount = invToday?.length || 0
  const todayBillsAmount = (invToday || []).reduce((acc, i) => acc + Number(i.grand_total), 0)

  // Receipts Today
  const { data: recToday } = await supabase
    .from('receipts')
    .select('amount')
    .eq('business_id', businessId)
    .eq('receipt_date', todayStr)

  const todayCollectionAmount = (recToday || []).reduce((acc, r) => acc + Number(r.amount), 0)

  // Vendor Payments Today
  const { data: payToday } = await supabase
    .from('payments')
    .select('amount')
    .eq('business_id', businessId)
    .eq('payment_date', todayStr)

  const todayPaymentsAmount = (payToday || []).reduce((acc, p) => acc + Number(p.amount), 0)

  // Expenses Today
  const { data: expToday } = await supabase
    .from('expenses')
    .select('amount')
    .eq('business_id', businessId)
    .eq('expense_date', todayStr)

  const todayExpensesAmount = (expToday || []).reduce((acc, e) => acc + Number(e.amount), 0)

  // 2. THIS MONTH'S FINANCIAL SUMMARY
  // Month Receipts
  const { data: recMonth } = await supabase
    .from('receipts')
    .select('amount')
    .eq('business_id', businessId)
    .gte('receipt_date', firstDayOfMonth)

  const monthIncome = (recMonth || []).reduce((acc, r) => acc + Number(r.amount), 0)

  // Month Vendor Payments
  const { data: payMonth } = await supabase
    .from('payments')
    .select('amount')
    .eq('business_id', businessId)
    .gte('payment_date', firstDayOfMonth)

  const monthPayments = (payMonth || []).reduce((acc, p) => acc + Number(p.amount), 0)

  // Month Overhead Expenses
  const { data: expMonth } = await supabase
    .from('expenses')
    .select('amount')
    .eq('business_id', businessId)
    .gte('expense_date', firstDayOfMonth)

  const monthExpenses = (expMonth || []).reduce((acc, e) => acc + Number(e.amount), 0)

  // Month Interest Paid
  const { data: repMonth } = await supabase
    .from('loan_repayments')
    .select('interest_paid')
    .eq('business_id', businessId)
    .gte('repayment_date', firstDayOfMonth)

  const monthInterest = (repMonth || []).reduce((acc, r) => acc + Number(r.interest_paid), 0)

  const monthCosts = monthPayments + monthExpenses + monthInterest
  const monthNetProfit = monthIncome - monthCosts

  // 3. OUTSTANDING RECEIVABLES & CAPITAL LOANS
  const { data: invUnpaid } = await supabase
    .from('invoices')
    .select('balance_due, due_date, status, customer_name, invoice_number')
    .eq('business_id', businessId)
    .gt('balance_due', 0)
    .neq('status', 'CANCELLED')

  const totalOutstanding = (invUnpaid || []).reduce((acc, i) => acc + Number(i.balance_due), 0)

  const overdueInvoices = (invUnpaid || []).filter((i) => i.due_date && i.due_date < todayStr)
  const dueTodayInvoices = (invUnpaid || []).filter((i) => i.due_date === todayStr)

  // Capital Loans
  const { data: loansActive } = await supabase
    .from('loans')
    .select('loan_type, outstanding_principal')
    .eq('business_id', businessId)
    .eq('status', 'ACTIVE')

  const loanTakenOutstanding = (loansActive || [])
    .filter((l) => l.loan_type === 'TAKEN')
    .reduce((acc, l) => acc + Number(l.outstanding_principal), 0)

  const loanGivenOutstanding = (loansActive || [])
    .filter((l) => l.loan_type === 'GIVEN')
    .reduce((acc, l) => acc + Number(l.outstanding_principal), 0)

  // 4. NOTIFICATIONS & RECENT RECEIPTS
  const { data: recentReceipts } = await supabase
    .from('receipts')
    .select('id, receipt_number, amount, receipt_date, customer_name, category')
    .eq('business_id', businessId)
    .order('receipt_date', { ascending: false })
    .limit(5)

  return {
    today: {
      billsCount: todayBillsCount,
      billsAmount: todayBillsAmount,
      collectionAmount: todayCollectionAmount,
      paymentsAmount: todayPaymentsAmount,
      expensesAmount: todayExpensesAmount,
    },
    month: {
      income: monthIncome,
      costs: monthCosts,
      netProfit: monthNetProfit,
      totalOutstanding,
      loanTakenOutstanding,
      loanGivenOutstanding,
    },
    notifications: {
      overdueCount: overdueInvoices.length,
      overdueAmount: overdueInvoices.reduce((acc, i) => acc + Number(i.balance_due), 0),
      dueTodayCount: dueTodayInvoices.length,
      dueTodayAmount: dueTodayInvoices.reduce((acc, i) => acc + Number(i.balance_due), 0),
      receivedTodayAmount: todayCollectionAmount,
    },
    recentReceipts: recentReceipts || [],
  }
}

export async function getProfitAndLossReport(businessId: string, fromDate: string, toDate: string) {
  const supabase = await createClient()

  // Operating Revenue (Receipts)
  const { data: receipts } = await supabase
    .from('receipts')
    .select('amount, category')
    .eq('business_id', businessId)
    .gte('receipt_date', fromDate)
    .lte('receipt_date', toDate)

  const receiptsTotal = (receipts || []).reduce((acc, r) => acc + Number(r.amount), 0)

  // Vendor Payments
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('business_id', businessId)
    .gte('payment_date', fromDate)
    .lte('payment_date', toDate)

  const vendorPaymentsTotal = (payments || []).reduce((acc, p) => acc + Number(p.amount), 0)

  // Overhead Expenses
  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')
    .eq('business_id', businessId)
    .gte('expense_date', fromDate)
    .lte('expense_date', toDate)

  const overheadExpensesTotal = (expenses || []).reduce((acc, e) => acc + Number(e.amount), 0)

  // Loan Repayments (Split Principal vs Interest)
  const { data: repayments } = await supabase
    .from('loan_repayments')
    .select('principal_paid, interest_paid')
    .eq('business_id', businessId)
    .gte('repayment_date', fromDate)
    .lte('repayment_date', toDate)

  const loanInterestPaidTotal = (repayments || []).reduce((acc, r) => acc + Number(r.interest_paid), 0)
  const loanPrincipalRepaidTotal = (repayments || []).reduce((acc, r) => acc + Number(r.principal_paid), 0)

  // Capital Loans Received in Period
  const { data: loansReceived } = await supabase
    .from('loans')
    .select('principal_amount')
    .eq('business_id', businessId)
    .gte('start_date', fromDate)
    .lte('start_date', toDate)

  const loanPrincipalReceivedTotal = (loansReceived || []).reduce((acc, l) => acc + Number(l.principal_amount), 0)

  const pnl = calculateProfitAndLoss({
    receiptsTotal,
    vendorPaymentsTotal,
    overheadExpensesTotal,
    loanInterestPaidTotal,
    loanPrincipalReceivedTotal,
    loanPrincipalRepaidTotal,
  })

  return {
    period: { fromDate, toDate },
    ...pnl,
  }
}

export async function globalSearch(businessId: string, queryTerm: string) {
  if (!queryTerm || queryTerm.trim().length < 2) {
    return { customers: [], invoices: [], receipts: [], expenses: [], payments: [] }
  }

  const supabase = await createClient()
  const term = `%${queryTerm.trim()}%`

  const [custRes, invRes, recRes, expRes, payRes] = await Promise.all([
    supabase
      .from('customers')
      .select('id, name, mobile, email')
      .eq('business_id', businessId)
      .or(`name.ilike.${term},mobile.ilike.${term}`)
      .limit(5),
    supabase
      .from('invoices')
      .select('id, invoice_number, customer_name, grand_total, status, invoice_date')
      .eq('business_id', businessId)
      .or(`invoice_number.ilike.${term},customer_name.ilike.${term}`)
      .limit(5),
    supabase
      .from('receipts')
      .select('id, receipt_number, customer_name, amount, receipt_date')
      .eq('business_id', businessId)
      .or(`receipt_number.ilike.${term},customer_name.ilike.${term}`)
      .limit(5),
    supabase
      .from('expenses')
      .select('id, expense_number, category, description, amount, expense_date')
      .eq('business_id', businessId)
      .or(`expense_number.ilike.${term},description.ilike.${term}`)
      .limit(5),
    supabase
      .from('payments')
      .select('id, payment_number, paid_to, work_purpose, amount, payment_date')
      .eq('business_id', businessId)
      .or(`payment_number.ilike.${term},paid_to.ilike.${term},work_purpose.ilike.${term}`)
      .limit(5),
  ])

  return {
    customers: custRes.data || [],
    invoices: invRes.data || [],
    receipts: recRes.data || [],
    expenses: expRes.data || [],
    payments: payRes.data || [],
  }
}
