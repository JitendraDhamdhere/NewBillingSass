import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentFinancialYear } from '@/lib/validations/report'
import { getProfitAndLossReport } from '@/lib/services/report-service'
import ReportsClient from './reports-client'

export default async function ReportsPage() {
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

  const currentFY = getCurrentFinancialYear()
  const initialPnL = await getProfitAndLossReport(
    membership.business_id,
    currentFY.startDate,
    currentFY.endDate
  )

  return (
    <ReportsClient
      initialPnL={initialPnL}
      currentFY={currentFY}
      businessId={membership.business_id}
      businessName={(membership.businesses as any)?.name || 'Business'}
    />
  )
}
