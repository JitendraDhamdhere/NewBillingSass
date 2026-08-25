import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getExpenses } from '@/lib/services/expense-service'
import ExpensesClient from './expenses-client'

export default async function ExpensesPage() {
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

  const expenses = await getExpenses(membership.business_id)

  return <ExpensesClient initialExpenses={expenses as any} businessId={membership.business_id} />
}
