'use server'

import { createClient } from '@/lib/supabase/server'
import { logAuditEvent } from './audit-service'

export async function getTeamMembers(businessId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('business_members')
    .select('id, business_id, user_id, role, created_at')
    .eq('business_id', businessId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch team members:', error.message)
    return []
  }

  return data || []
}

export async function inviteTeamMember(
  businessId: string,
  inviterUserId: string,
  inviterEmail: string,
  targetEmail: string,
  role: 'OWNER' | 'ACCOUNTANT' | 'STAFF'
) {
  const supabase = await createClient()

  // For architectural invitation: Create a placeholder member entry
  // In production, an invite token email is dispatched via Supabase Auth / SMTP
  const dummyUserId = '00000000-0000-0000-0000-' + Math.floor(100000000000 + Math.random() * 900000000000)

  const { data, error } = await supabase
    .from('business_members')
    .insert({
      business_id: businessId,
      user_id: dummyUserId,
      role: role,
    })
    .select('*')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  // Audit log entry
  await logAuditEvent({
    businessId,
    userId: inviterUserId,
    userEmail: inviterEmail,
    action: 'MEMBER_INVITE',
    entityType: 'TEAM',
    entityId: data.id,
    metadata: { target_email: targetEmail, role },
  })

  return { success: true, data }
}

export async function updateMemberRole(
  businessId: string,
  updaterUserId: string,
  updaterEmail: string,
  memberId: string,
  newRole: 'OWNER' | 'ACCOUNTANT' | 'STAFF'
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('business_members')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', memberId)
    .eq('business_id', businessId)
    .select('*')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  await logAuditEvent({
    businessId,
    userId: updaterUserId,
    userEmail: updaterEmail,
    action: 'PERMISSION_CHANGE',
    entityType: 'TEAM',
    entityId: memberId,
    metadata: { new_role: newRole },
  })

  return { success: true, data }
}

export async function removeTeamMember(
  businessId: string,
  removerUserId: string,
  removerEmail: string,
  memberId: string
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('business_members')
    .delete()
    .eq('id', memberId)
    .eq('business_id', businessId)

  if (error) {
    return { success: false, error: error.message }
  }

  await logAuditEvent({
    businessId,
    userId: removerUserId,
    userEmail: removerEmail,
    action: 'MEMBER_REMOVE',
    entityType: 'TEAM',
    entityId: memberId,
  })

  return { success: true }
}

export async function getBusinessPermissions(businessId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('business_permissions')
    .select('*')
    .eq('business_id', businessId)

  if (error) {
    console.error('Failed to fetch business permissions:', error.message)
    return []
  }

  return data || []
}

export async function updatePermissionMatrix(
  businessId: string,
  updaterUserId: string,
  updaterEmail: string,
  role: 'ACCOUNTANT' | 'STAFF',
  resource: string,
  permissions: {
    can_view?: boolean
    can_create?: boolean
    can_edit?: boolean
    can_delete?: boolean
    can_print?: boolean
    can_export?: boolean
    can_whatsapp?: boolean
  }
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('business_permissions')
    .upsert(
      {
        business_id: businessId,
        role: role,
        resource: resource,
        ...permissions,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'business_id,role,resource' }
    )
    .select('*')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  await logAuditEvent({
    businessId,
    userId: updaterUserId,
    userEmail: updaterEmail,
    action: 'PERMISSION_CHANGE',
    entityType: 'PERMISSION',
    entityId: data.id,
    metadata: { role, resource, permissions },
  })

  return { success: true, data }
}
