import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReceiptsClient from './receipts-client'

export default async function ReceiptsPage() {
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

  const { data: receipts } = await supabase
    .from('receipts')
    .select('*, customer:customers(id, name, mobile)')
    .eq('business_id', membership.business_id)
    .order('created_at', { ascending: false })

  return <ReceiptsClient initialReceipts={receipts || []} businessId={membership.business_id} />
}
