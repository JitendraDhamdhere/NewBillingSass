import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getLoans } from '@/lib/services/loan-service'
import CapitalLedgerClient from './capital-ledger-client'

export default async function CapitalLedgerPage() {
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

  const loans = await getLoans(membership.business_id)

  return <CapitalLedgerClient initialLoans={loans as any} businessId={membership.business_id} />
}
