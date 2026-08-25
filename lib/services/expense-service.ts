'use server'

import { createClient } from '@/lib/supabase/server'
import { expenseSchema, ExpenseInput } from '@/lib/validations/expense'

export async function getExpenses(
  businessId: string,
  options?: {
    search?: string
    category?: string
    fromDate?: string
    toDate?: string
  }
) {
  const supabase = await createClient()

  let query = supabase
    .from('expenses')
    .select('*')
    .eq('business_id', businessId)
    .order('expense_date', { ascending: false })

  if (options?.category && options.category !== 'ALL') {
    query = query.eq('category', options.category)
  }

  if (options?.fromDate) {
    query = query.gte('expense_date', options.fromDate)
  }

  if (options?.toDate) {
    query = query.lte('expense_date', options.toDate)
  }

  if (options?.search && options.search.trim() !== '') {
    const term = `%${options.search.trim()}%`
    query = query.or(`expense_number.ilike.${term},description.ilike.${term},payee_vendor.ilike.${term}`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch expenses: ${error.message}`)
  }

  return data
}

export async function createExpense(businessId: string, input: Omit<ExpenseInput, 'business_id'>, userId?: string) {
  const validation = expenseSchema.safeParse({ ...input, business_id: businessId })

  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, data: null }
  }

  const data = validation.data
  const supabase = await createClient()

  const dateCompact = data.expense_date.replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const expenseNum = `EXP-${dateCompact}-${randomSuffix}`

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      business_id: businessId,
      expense_number: expenseNum,
      category: data.category,
      description: data.description,
      amount: data.amount,
      expense_date: data.expense_date,
      payment_mode: data.payment_mode,
      payee_vendor: data.payee_vendor || null,
      attachment_url: data.attachment_url || null,
      notes: data.notes || null,
      created_by: userId || null,
    })
    .select()
    .single()

  if (error || !expense) {
    return { success: false, errors: { _form: [error?.message || 'Expense creation failed'] }, data: null }
  }

  return { success: true, errors: null, data: expense }
}
