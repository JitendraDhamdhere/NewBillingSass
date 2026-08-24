import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user's membership and active business name
  const { data: membership, error } = await supabase
    .from('business_members')
    .select('business_id, role, businesses(name)')
    .limit(1)
    .maybeSingle()

  if (error || !membership || !membership.businesses) {
    redirect('/onboarding')
  }

  const businessName = (membership.businesses as unknown as { name: string }).name
  const role = membership.role
  const email = user.email || 'user@business.com'

  return (
    <DashboardShell businessName={businessName} userEmail={email} userRole={role}>
      {children}
    </DashboardShell>
  )
}
