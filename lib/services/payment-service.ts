'use server'

import { createClient } from '@/lib/supabase/server'
import { paymentSchema, PaymentInput, calculateJobProfitability } from '@/lib/validations/payment'

export async function getPayments(
  businessId: string,
  options?: {
    search?: string
    invoiceId?: string
    fromDate?: string
    toDate?: string
  }
) {
  const supabase = await createClient()

  let query = supabase
    .from('payments')
    .select('*, invoice:invoices(id, invoice_number, grand_total, customer_name)')
    .eq('business_id', businessId)
    .order('payment_date', { ascending: false })

  if (options?.invoiceId) {
    query = query.eq('invoice_id', options.invoiceId)
  }

  if (options?.fromDate) {
    query = query.gte('payment_date', options.fromDate)
  }

  if (options?.toDate) {
    query = query.lte('payment_date', options.toDate)
  }

  if (options?.search && options.search.trim() !== '') {
    const term = `%${options.search.trim()}%`
    query = query.or(`payment_number.ilike.${term},paid_to.ilike.${term},work_purpose.ilike.${term}`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch vendor payments: ${error.message}`)
  }

  return data
}

export async function createPayment(businessId: string, input: Omit<PaymentInput, 'business_id'>, userId?: string) {
  const validation = paymentSchema.safeParse({ ...input, business_id: businessId })

  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, data: null }
  }

  const data = validation.data
  const supabase = await createClient()

  const dateCompact = data.payment_date.replace(/-/g, '')
  const randomSuffix = Math.floor(1000 + Math.random() * 9000)
  const paymentNum = `PAY-${dateCompact}-${randomSuffix}`

  const { data: payment, error } = await supabase
    .from('payments')
    .insert({
      business_id: businessId,
      payment_number: paymentNum,
      paid_to: data.paid_to,
      mobile: data.mobile || null,
      work_purpose: data.work_purpose,
      invoice_id: data.invoice_id || null,
      amount: data.amount,
      payment_date: data.payment_date,
      payment_mode: data.payment_mode,
      attachment_url: data.attachment_url || null,
      notes: data.notes || null,
      created_by: userId || null,
    })
    .select()
    .single()

  if (error || !payment) {
    return { success: false, errors: { _form: [error?.message || 'Payment creation failed'] }, data: null }
  }

  return { success: true, errors: null, data: payment }
}

export async function getInvoiceJobProfitability(businessId: string, invoiceId: string) {
  const supabase = await createClient()

  // Fetch invoice details
  const { data: invoice } = await supabase
    .from('invoices')
    .select('id, invoice_number, grand_total, customer_name')
    .eq('business_id', businessId)
    .eq('id', invoiceId)
    .single()

  if (!invoice) return null

  // Fetch linked vendor payments for this job
  const { data: payments } = await supabase
    .from('payments')
    .select('id, payment_number, paid_to, work_purpose, amount, payment_date')
    .eq('business_id', businessId)
    .eq('invoice_id', invoiceId)

  const linkedPayments = payments || []
  const linkedTotal = linkedPayments.reduce((acc, p) => acc + Number(p.amount), 0)

  const profitability = calculateJobProfitability(Number(invoice.grand_total), linkedTotal)

  return {
    invoice,
    linkedPayments,
    profitability,
  }
}
