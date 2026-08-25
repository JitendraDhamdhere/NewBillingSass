'use server'

import { createClient } from '@/lib/supabase/server'
import { serviceSchema, ServiceInput } from '@/lib/validations/service'

export async function getServices(businessId: string, search?: string, activeOnly: boolean = true) {
  const supabase = await createClient()

  let query = supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .order('name', { ascending: true })

  if (activeOnly) {
    query = query.eq('is_active', true)
  }

  if (search && search.trim() !== '') {
    query = query.ilike('name', `%${search.trim()}%`)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch services: ${error.message}`)
  }

  return data
}

export async function createService(businessId: string, input: Omit<ServiceInput, 'business_id'>) {
  const validation = serviceSchema.safeParse({ ...input, business_id: businessId })

  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, data: null }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('services')
    .insert({
      business_id: businessId,
      name: validation.data.name,
      default_rate: validation.data.default_rate,
      category: validation.data.category || null,
      pricing_mode: validation.data.pricing_mode,
      is_active: validation.data.is_active,
    })
    .select()
    .single()

  if (error) {
    return { success: false, errors: { _form: [error.message] }, data: null }
  }

  return { success: true, errors: null, data }
}

export async function updateService(businessId: string, serviceId: string, input: Partial<ServiceInput>) {
  const supabase = await createClient()

  const { data: existing, error: fetchErr } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', businessId)
    .eq('id', serviceId)
    .single()

  if (fetchErr || !existing) {
    return { success: false, errors: { _form: ['Service not found'] }, data: null }
  }

  const updated = {
    ...existing,
    ...input,
    business_id: businessId,
  }

  const validation = serviceSchema.safeParse(updated)
  if (!validation.success) {
    return { success: false, errors: validation.error.flatten().fieldErrors, data: null }
  }

  const { data, error } = await supabase
    .from('services')
    .update({
      name: validation.data.name,
      default_rate: validation.data.default_rate,
      category: validation.data.category || null,
      pricing_mode: validation.data.pricing_mode,
      is_active: validation.data.is_active,
    })
    .eq('business_id', businessId)
    .eq('id', serviceId)
    .select()
    .single()

  if (error) {
    return { success: false, errors: { _form: [error.message] }, data: null }
  }

  return { success: true, errors: null, data }
}

export async function toggleServiceActive(businessId: string, serviceId: string, isActive: boolean) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('services')
    .update({ is_active: isActive })
    .eq('business_id', businessId)
    .eq('id', serviceId)

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
