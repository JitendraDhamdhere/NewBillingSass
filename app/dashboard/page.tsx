import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getExecutiveDashboardMetrics } from '@/lib/services/report-service'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
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

  const metrics = await getExecutiveDashboardMetrics(membership.business_id)

  return <DashboardClient metrics={metrics} businessName={(membership.businesses as any)?.name || 'Business'} />
}
