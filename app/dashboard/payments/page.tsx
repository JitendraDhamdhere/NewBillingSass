import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getPayments } from '@/lib/services/payment-service'
import PaymentsClient from './payments-client'

export default async function PaymentsPage() {
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

  const payments = await getPayments(membership.business_id)

  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, invoice_number, grand_total, customer_name')
    .eq('business_id', membership.business_id)
    .neq('status', 'CANCELLED')
    .order('created_at', { ascending: false })

  return (
    <PaymentsClient
      initialPayments={payments as any}
      invoices={invoices || []}
      businessId={membership.business_id}
    />
  )
}
