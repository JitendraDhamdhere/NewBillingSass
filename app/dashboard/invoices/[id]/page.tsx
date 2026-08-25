import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getInvoiceById } from '@/lib/services/invoice-service'
import InvoiceDetailClient from './invoice-detail-client'

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const invoice = await getInvoiceById(membership.business_id, id)

  if (!invoice) {
    redirect('/dashboard/invoices')
  }

  return (
    <InvoiceDetailClient
      invoice={invoice as any}
      business={membership.businesses as any}
      businessId={membership.business_id}
    />
  )
}
