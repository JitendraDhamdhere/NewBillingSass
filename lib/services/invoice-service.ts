'use server'

import { createClient } from '@/lib/supabase/server'
import { invoiceSchema, calculateInvoiceTotals, InvoiceInput } from '@/lib/validations/invoice'

export async function getInvoices(
  businessId: string,
  options?: {
    search?: string
    status?: string
    customerId?: string
    fromDate?: string
    toDate?: string
  }
) {
  const supabase = await createClient()

  let query = supabase
    .from('invoices')
    .select('*, customer:customers(id, name, mobile)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (options?.status && options.status !== 'ALL') {
    query = query.eq('status', options.status as any)
  }

  if (options?.customerId) {
    query = query.eq('customer_id', options.customerId)
  }

  if (options?.fromDate) {
    query = query.gte('invoice_date', options.fromDate)
  }

  if (options?.toDate) {
    query = query.lte('invoice_date', options.toDate)
  }

  if (options?.search && options.search.trim() !== '') {
    const term = `%${options.search.trim()}%`
    query = query.or(`invoice_number.ilike.${term},customer_name.ilike.${term},customer_mobile.ilike.${term}`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch invoices: ${error.message}`)
  }

  return data
}

export async function getInvoiceById(businessId: string, invoiceId: string) {
  const supabase = await createClient()

  const { data: invoice, error: invErr } = await supabase
    .from('invoices')
    .select('*, customer:customers(*), items:invoice_items(*)')
    .eq('business_id', businessId)
    .eq('id', invoiceId)
    .single()

  if (invErr || !invoice) {
    return null
  }

  // Fetch receipts / allocations linked to this invoice
  const { data: allocations } = await supabase
    .from('receipt_allocations')
    .select('*, receipt:receipts(*)')
    .eq('business_id', businessId)
    .eq('invoice_id', invoiceId)

  // Fetch credit notes
  const { data: creditNotes } = await supabase
    .from('credit_notes')
    .select('*')
    .eq('business_id', businessId)
    .eq('invoice_id', invoiceId)

  return {
    ...invoice,
    allocations: allocations || [],
    creditNotes: creditNotes || [],
  }
}

export async function createInvoice(businessId: string, input: Omit<InvoiceInput, 'business_id'>, userId?: string) {
  const validation = invoiceSchema.safeParse({ ...input, business_id: businessId })

  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, data: null }
  }

  const data = validation.data
  const totals = calculateInvoiceTotals({
    items: data.items,
    discount_percentage: data.discount_percentage,
    discount_amount: data.discount_amount,
    tax_amount: data.tax_amount,
    paid_amount_now: data.paid_amount_now,
    due_date: data.due_date,
  })

  // Validate walk-in customer rule: If balance due > 0, customer name & mobile are required
  if (data.is_walk_in && totals.balance_due > 0) {
    if (!data.customer_name || data.customer_name.trim() === '') {
      return {
        success: false,
        errors: { customer_name: ['Customer name is required for Walk-in when there is a balance due'] },
        data: null,
      }
    }
    if (!data.customer_mobile || data.customer_mobile.trim() === '') {
      return {
        success: false,
        errors: { customer_mobile: ['Customer mobile is required for Walk-in when there is a balance due'] },
        data: null,
      }
    }
  }

  const supabase = await createClient()

  // Generate concurrency-safe invoice number using RPC function
  const { data: seqResult, error: seqErr } = await supabase.rpc('generate_next_invoice_number', {
    p_business_id: businessId,
    p_numbering_mode: data.numbering_mode,
    p_invoice_date: data.invoice_date,
    p_prefix: 'INV',
  })

  if (seqErr || !seqResult || seqResult.length === 0) {
    return { success: false, errors: { _form: [`Failed to generate invoice number: ${seqErr?.message || 'Unknown error'}`] }, data: null }
  }

  const { out_invoice_number, out_sequence_number, out_fy_year } = seqResult[0]

  // If customer is walk-in with details or regular customer without ID, optional customer auto-creation
  let finalCustomerId = data.customer_id || null
  let finalCustomerName = data.customer_name || null
  let finalCustomerMobile = data.customer_mobile || null

  if (finalCustomerId) {
    const { data: cust } = await supabase.from('customers').select('name, mobile').eq('id', finalCustomerId).single()
    if (cust) {
      finalCustomerName = cust.name
      finalCustomerMobile = cust.mobile
    }
  }

  // Insert Invoice Record
  const { data: invoice, error: invInsertErr } = await supabase
    .from('invoices')
    .insert({
      business_id: businessId,
      invoice_number: out_invoice_number,
      invoice_prefix: 'INV',
      sequence_number: out_sequence_number,
      fy_year: out_fy_year,
      numbering_mode: data.numbering_mode,
      customer_id: finalCustomerId,
      customer_name: finalCustomerName,
      customer_mobile: finalCustomerMobile,
      is_walk_in: data.is_walk_in,
      invoice_date: data.invoice_date,
      due_date: data.due_date || null,
      subtotal: totals.subtotal,
      discount_percentage: totals.discount_percentage,
      discount_amount: totals.discount_amount,
      tax_amount: totals.tax_amount,
      grand_total: totals.grand_total,
      paid_amount: totals.paid_amount,
      balance_due: totals.balance_due,
      status: totals.status,
      notes: data.notes || null,
      terms: data.terms || null,
      created_by: userId || null,
      updated_by: userId || null,
    })
    .select()
    .single()

  if (invInsertErr || !invoice) {
    return { success: false, errors: { _form: [invInsertErr?.message || 'Invoice insert failed'] }, data: null }
  }

  // Insert Invoice Line Items
  const itemsToInsert = totals.items.map((item: any, idx: number) => ({
    invoice_id: invoice.id,
    business_id: businessId,
    service_id: item.service_id || null,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    amount: item.amount,
    discount_amount: item.discount_amount || 0,
    sort_order: idx + 1,
  }))

  const { error: itemsErr } = await supabase.from('invoice_items').insert(itemsToInsert)

  if (itemsErr) {
    // Cleanup invoice on failure
    await supabase.from('invoices').delete().eq('id', invoice.id)
    return { success: false, errors: { _form: [`Failed to insert items: ${itemsErr.message}`] }, data: null }
  }

  // If payment received upfront during billing (>0), atomically create Receipt & Receipt Allocation
  if (totals.paid_amount > 0) {
    const receiptNumber = `REC-${out_invoice_number.replace('INV-', '')}`
    const { data: receipt, error: recErr } = await supabase
      .from('receipts')
      .insert({
        business_id: businessId,
        receipt_number: receiptNumber,
        customer_id: finalCustomerId,
        receipt_date: data.invoice_date,
        amount: totals.paid_amount,
        payment_mode: data.payment_mode,
        notes: `Initial payment during billing for ${out_invoice_number}`,
        created_by: userId || null,
      })
      .select()
      .single()

    if (!recErr && receipt) {
      await supabase.from('receipt_allocations').insert({
        receipt_id: receipt.id,
        invoice_id: invoice.id,
        business_id: businessId,
        allocated_amount: totals.paid_amount,
      })
    }
  }

  return { success: true, errors: null, data: invoice }
}

export async function updateInvoice(
  businessId: string,
  invoiceId: string,
  input: Partial<Omit<InvoiceInput, 'business_id'>>,
  userId?: string
) {
  const existing = await getInvoiceById(businessId, invoiceId)
  if (!existing) {
    return { success: false, errors: { _form: ['Invoice not found'] }, data: null }
  }

  // Check edit lock rule: If paid_amount > 0, item-level editing is locked!
  if (existing.paid_amount > 0 && input.items) {
    return {
      success: false,
      errors: { _form: ['Item-level editing is locked because this invoice has received payments. Use cancellation or credit note instead.'] },
      data: null,
    }
  }

  const supabase = await createClient()

  if (existing.paid_amount === 0 && input.items) {
    // Recalculate totals
    const totals = calculateInvoiceTotals({
      items: input.items as any,
      discount_percentage: input.discount_percentage ?? existing.discount_percentage,
      discount_amount: input.discount_amount ?? existing.discount_amount,
      tax_amount: input.tax_amount ?? existing.tax_amount,
      paid_amount_now: 0,
      due_date: input.due_date ?? existing.due_date,
    })

    // Delete existing line items
    await supabase.from('invoice_items').delete().eq('invoice_id', invoiceId)

    // Insert new line items
    const itemsToInsert = totals.items.map((item: any, idx: number) => ({
      invoice_id: invoiceId,
      business_id: businessId,
      service_id: item.service_id || null,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unit_price,
      amount: item.amount,
      discount_amount: item.discount_amount || 0,
      sort_order: idx + 1,
    }))

    await supabase.from('invoice_items').insert(itemsToInsert)

    // Update invoice header
    const { data: updated, error } = await supabase
      .from('invoices')
      .update({
        subtotal: totals.subtotal,
        discount_percentage: totals.discount_percentage,
        discount_amount: totals.discount_amount,
        tax_amount: totals.tax_amount,
        grand_total: totals.grand_total,
        balance_due: totals.grand_total,
        status: totals.status,
        notes: input.notes !== undefined ? input.notes : existing.notes,
        terms: input.terms !== undefined ? input.terms : existing.terms,
        due_date: input.due_date !== undefined ? input.due_date : existing.due_date,
        updated_by: userId || null,
      })
      .eq('business_id', businessId)
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) {
      return { success: false, errors: { _form: [error.message] }, data: null }
    }

    return { success: true, errors: null, data: updated }
  } else {
    // Only metadata update (notes, terms, due date)
    const { data: updated, error } = await supabase
      .from('invoices')
      .update({
        notes: input.notes !== undefined ? input.notes : existing.notes,
        terms: input.terms !== undefined ? input.terms : existing.terms,
        due_date: input.due_date !== undefined ? input.due_date : existing.due_date,
        updated_by: userId || null,
      })
      .eq('business_id', businessId)
      .eq('id', invoiceId)
      .select()
      .single()

    if (error) {
      return { success: false, errors: { _form: [error.message] }, data: null }
    }

    return { success: true, errors: null, data: updated }
  }
}

export async function cancelInvoice(businessId: string, invoiceId: string, reason: string, userId?: string) {
  if (!reason || reason.trim() === '') {
    return { success: false, error: 'A valid cancellation reason is mandatory' }
  }

  const supabase = await createClient()

  const existing = await getInvoiceById(businessId, invoiceId)
  if (!existing) {
    return { success: false, error: 'Invoice not found' }
  }

  if (existing.status === 'CANCELLED') {
    return { success: false, error: 'Invoice is already cancelled' }
  }

  const { error } = await supabase
    .from('invoices')
    .update({
      status: 'CANCELLED',
      cancellation_reason: reason.trim(),
      balance_due: 0,
      updated_by: userId || null,
    })
    .eq('business_id', businessId)
    .eq('id', invoiceId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}

export async function createCreditNote(
  businessId: string,
  params: {
    invoice_id?: string | null
    customer_id?: string | null
    amount: number
    reason: string
  }
) {
  if (!params.amount || params.amount <= 0) {
    return { success: false, error: 'Credit note amount must be greater than 0' }
  }
  if (!params.reason || params.reason.trim() === '') {
    return { success: false, error: 'Credit note reason is mandatory' }
  }

  const supabase = await createClient()
  const creditNoteNum = `CN-${Date.now().toString().slice(-6)}`

  const { data, error } = await supabase
    .from('credit_notes')
    .insert({
      business_id: businessId,
      credit_note_number: creditNoteNum,
      invoice_id: params.invoice_id || null,
      customer_id: params.customer_id || null,
      amount: params.amount,
      reason: params.reason.trim(),
      status: 'OPEN',
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message, data: null }
  }

  return { success: true, error: null, data }
}
