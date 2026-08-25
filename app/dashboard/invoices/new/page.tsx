import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateInvoiceClient from './create-invoice-client'

export default async function NewInvoicePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id')
    .limit(1)
    .maybeSingle()

  if (!membership) {
    redirect('/onboarding')
  }

  const { data: customers } = await supabase
    .from('customers')
    .select('id, name, mobile, customer_type')
    .eq('business_id', membership.business_id)
    .order('name', { ascending: true })

  const { data: services } = await supabase
    .from('services')
    .select('id, name, default_rate, pricing_mode, category')
    .eq('business_id', membership.business_id)
    .eq('is_active', true)
    .order('name', { ascending: true })

  return (
    <CreateInvoiceClient
      businessId={membership.business_id}
      initialCustomers={customers || []}
      initialServices={services || []}
    />
  )
}
