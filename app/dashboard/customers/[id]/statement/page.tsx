import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCustomerById } from '@/lib/services/customer-service'
import { getCustomerLedger } from '@/lib/services/receipt-service'
import CustomerStatementClient from './customer-statement-client'

export default async function CustomerStatementPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id, businesses(*)')
    .limit(1)
    .maybeSingle()

  if (!membership) {
    redirect('/onboarding')
  }

  const customer = await getCustomerById(membership.business_id, id)

  if (!customer) {
    redirect('/dashboard/customers')
  }

  const ledger = await getCustomerLedger(membership.business_id, id)

  return (
    <CustomerStatementClient
      customer={customer as any}
      ledger={ledger}
      business={membership.businesses as any}
    />
  )
}
