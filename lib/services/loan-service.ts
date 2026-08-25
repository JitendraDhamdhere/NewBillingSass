'use server'

import { createClient } from '@/lib/supabase/server'
import {
  loanSchema,
  loanRepaymentSchema,
  LoanInput,
  LoanRepaymentInput,
  calculateCapitalLedgerAccounting,
} from '@/lib/validations/loan'
import { roundCurrency } from '@/lib/validations/invoice'

export async function getLoans(businessId: string, status?: 'ACTIVE' | 'CLOSED' | 'ALL') {
  const supabase = await createClient()

  let query = supabase
    .from('loans')
    .select('*')
    .eq('business_id', businessId)
    .order('start_date', { ascending: false })

  if (status && status !== 'ALL') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch capital loans: ${error.message}`)
  }

  return data
}

export async function getLoanById(businessId: string, loanId: string) {
  const supabase = await createClient()

  const { data: loan } = await supabase
    .from('loans')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', loanId)
    .single()

  if (!loan) return null

  const { data: repayments } = await supabase
    .from('loan_repayments')
    .select('*')
    .eq('business_id', businessId)
    .eq('loan_id', loanId)
    .order('repayment_date', { ascending: false })

  return {
    ...loan,
    repayments: repayments || [],
  }
}

export async function createLoan(businessId: string, input: Omit<LoanInput, 'business_id'>) {
  const validation = loanSchema.safeParse({ ...input, business_id: businessId })

  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, data: null }
  }

  const data = validation.data
  const supabase = await createClient()

  // Calculate capital ledger accounting impact
  const impact = calculateCapitalLedgerAccounting('LOAN_RECEIVED', data.loan_type, {
    principal: data.principal_amount,
  })

  const { data: loan, error } = await supabase
    .from('loans')
    .insert({
      business_id: businessId,
      lender_borrower_name: data.lender_borrower_name,
      loan_type: data.loan_type,
      principal_amount: data.principal_amount,
      outstanding_principal: data.principal_amount,
      interest_rate_annual: data.interest_rate_annual || 0,
      start_date: data.start_date,
      due_date: data.due_date || null,
      status: 'ACTIVE',
      notes: data.notes || null,
    })
    .select()
    .single()

  if (error || !loan) {
    return { success: false, errors: { _form: [error?.message || 'Loan record creation failed'] }, data: null }
  }

  return {
    success: true,
    errors: null,
    data: loan,
    accounting_impact: impact,
  }
}

export async function recordLoanRepayment(businessId: string, input: Omit<LoanRepaymentInput, 'business_id'>) {
  const validation = loanRepaymentSchema.safeParse({ ...input, business_id: businessId })

  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, data: null }
  }

  const data = validation.data
  const supabase = await createClient()

  // Fetch current loan
  const { data: loan } = await supabase
    .from('loans')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', data.loan_id)
    .single()

  if (!loan) {
    return { success: false, errors: { _form: ['Loan record not found'] }, data: null }
  }

  const totalAmount = roundCurrency(data.principal_paid + data.interest_paid)

  if (totalAmount <= 0) {
    return { success: false, errors: { _form: ['Total repayment amount must be greater than zero'] }, data: null }
  }

  // Calculate new outstanding principal
  const currentOutstanding = Number(loan.outstanding_principal)
  const newOutstanding = roundCurrency(Math.max(0, currentOutstanding - data.principal_paid))
  const newStatus = newOutstanding === 0 ? 'CLOSED' : 'ACTIVE'

  // Insert Repayment
  const { data: repayment, error: repErr } = await supabase
    .from('loan_repayments')
    .insert({
      loan_id: data.loan_id,
      business_id: businessId,
      repayment_date: data.repayment_date,
      principal_paid: roundCurrency(data.principal_paid),
      interest_paid: roundCurrency(data.interest_paid),
      total_amount: totalAmount,
      payment_mode: data.payment_mode,
      reference_number: data.reference_number || null,
      notes: data.notes || null,
    })
    .select()
    .single()

  if (repErr || !repayment) {
    return { success: false, errors: { _form: [repErr?.message || 'Repayment recording failed'] }, data: null }
  }

  // Update Loan Outstanding Principal
  await supabase
    .from('loans')
    .update({
      outstanding_principal: newOutstanding,
      status: newStatus,
    })
    .eq('business_id', businessId)
    .eq('id', data.loan_id)

  const accountingImpact = calculateCapitalLedgerAccounting('REPAYMENT', loan.loan_type as any, {
    principal: data.principal_paid,
    interest: data.interest_paid,
  })

  return {
    success: true,
    errors: null,
    data: repayment,
    accounting_impact: accountingImpact,
  }
}
