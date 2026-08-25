import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getTeamMembers, getBusinessPermissions } from '@/lib/services/team-service'
import { getAuditLogs } from '@/lib/services/audit-service'
import TeamClient from './team-client'

export default async function TeamPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id, role, businesses(*)')
    .limit(1)
    .maybeSingle()

  if (!membership) {
    redirect('/onboarding')
  }

  const members = await getTeamMembers(membership.business_id)
  const permissions = await getBusinessPermissions(membership.business_id)
  const auditLogs = await getAuditLogs(membership.business_id, 30)

  return (
    <TeamClient
      members={members}
      permissions={permissions}
      auditLogs={auditLogs}
      currentUserRole={membership.role as any}
      currentUserId={user.id}
      currentUserEmail={user.email || ''}
      businessId={membership.business_id}
      businessName={(membership.businesses as any)?.name || 'Business'}
    />
  )
}
