import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAllOutstandingReceivables, getDashboardCollectionMetrics } from '@/lib/services/receipt-service'
import OutstandingClient from './outstanding-client'

export default async function OutstandingPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id, businesses(name)')
    .limit(1)
    .maybeSingle()

  if (!membership) {
    redirect('/onboarding')
  }

  const receivables = await getAllOutstandingReceivables(membership.business_id)
  const metrics = await getDashboardCollectionMetrics(membership.business_id)

  return (
    <OutstandingClient
      receivables={receivables as any}
      metrics={metrics}
      businessName={(membership.businesses as any)?.name || 'Business'}
    />
  )
}
