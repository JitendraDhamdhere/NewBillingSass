import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getReceiptById } from '@/lib/services/receipt-service'
import ReceiptDetailClient from './receipt-detail-client'

export default async function ReceiptDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const receipt = await getReceiptById(membership.business_id, id)

  if (!receipt) {
    redirect('/dashboard/receipts')
  }

  return (
    <ReceiptDetailClient
      receipt={receipt as any}
      business={membership.businesses as any}
      businessId={membership.business_id}
    />
  )
}
