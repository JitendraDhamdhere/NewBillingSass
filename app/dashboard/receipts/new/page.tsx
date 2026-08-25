import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreateReceiptClient from './create-receipt-client'

export default async function NewReceiptPage() {
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

  return <CreateReceiptClient businessId={membership.business_id} initialCustomers={customers || []} />
}
