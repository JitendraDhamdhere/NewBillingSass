import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ServicesClient from './services-client'

export default async function ServicesPage() {
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

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('business_id', membership.business_id)
    .order('name', { ascending: true })

  return <ServicesClient initialServices={services || []} businessId={membership.business_id} />
}
