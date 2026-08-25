'use server'

import { createClient } from '@/lib/supabase/server'
import { customerBaseSchema, validateCustomer, CustomerInput } from '@/lib/validations/customer'

export async function getCustomers(businessId: string, search?: string, type?: 'REGULAR' | 'WAL_IN') {
  const supabase = await createClient()

  let query = supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('customer_type', type)
  }

  if (search && search.trim() !== '') {
    const term = `%${search.trim()}%`
    query = query.or(`name.ilike.${term},mobile.ilike.${term},email.ilike.${term}`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch customers: ${error.message}`)
  }

  return data
}

export async function getCustomerById(businessId: string, customerId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', customerId)
    .single()

  if (error) {
    return null
  }

  return data
}

export async function createCustomer(businessId: string, input: Omit<CustomerInput, 'business_id'>, balanceDue: number = 0) {
  const validation = validateCustomer({ ...input, business_id: businessId }, balanceDue)

  if (!validation.success) {
    return { success: false, errors: validation.errors, data: null }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .insert({
      business_id: businessId,
      name: validation.data.name || null,
      mobile: validation.data.mobile || null,
      email: validation.data.email || null,
      address: validation.data.address || null,
      customer_type: validation.data.customer_type,
    })
    .select()
    .single()

  if (error) {
    return { success: false, errors: { _form: error.message }, data: null }
  }

  return { success: true, errors: null, data }
}

export async function updateCustomer(businessId: string, customerId: string, input: Partial<CustomerInput>) {
  const supabase = await createClient()

  const existing = await getCustomerById(businessId, customerId)
  if (!existing) {
    return { success: false, errors: { _form: 'Customer not found' }, data: null }
  }

  const updatedInput: CustomerInput = {
    ...existing,
    ...input,
    business_id: businessId,
  }

  const validation = validateCustomer(updatedInput, 0)
  if (!validation.success) {
    return { success: false, errors: validation.errors, data: null }
  }

  const { data, error } = await supabase
    .from('customers')
    .update({
      name: validation.data.name || null,
      mobile: validation.data.mobile || null,
      email: validation.data.email || null,
      address: validation.data.address || null,
      customer_type: validation.data.customer_type,
    })
    .eq('business_id', businessId)
    .eq('id', customerId)
    .select()
    .single()

  if (error) {
    return { success: false, errors: { _form: error.message }, data: null }
  }

  return { success: true, errors: null, data }
}

export async function deleteCustomer(businessId: string, customerId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('business_id', businessId)
    .eq('id', customerId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
