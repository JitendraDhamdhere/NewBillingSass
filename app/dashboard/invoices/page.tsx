import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InvoicesClient from './invoices-client'

export default async function InvoicesPage() {
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

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, customer:customers(id, name, mobile)')
    .eq('business_id', membership.business_id)
    .order('created_at', { ascending: false })

  return <InvoicesClient initialInvoices={invoices || []} businessId={membership.business_id} />
}
