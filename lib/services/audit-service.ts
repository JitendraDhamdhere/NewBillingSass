'use server'

import { createClient } from '@/lib/supabase/server'

export interface LogAuditInput {
  businessId: string
  userId?: string | null
  userEmail?: string | null
  action:
    | 'CREATE'
    | 'EDIT'
    | 'DELETE'
    | 'CANCEL'
    | 'CREDIT_NOTE'
    | 'PAYMENT'
    | 'RECEIPT'
    | 'EXPENSE'
    | 'LOAN'
    | 'PERMISSION_CHANGE'
    | 'MEMBER_INVITE'
    | 'MEMBER_REMOVE'
  entityType: 'INVOICE' | 'RECEIPT' | 'PAYMENT' | 'EXPENSE' | 'LOAN' | 'CUSTOMER' | 'PERMISSION' | 'TEAM'
  entityId?: string | null
  metadata?: Record<string, any>
}

/**
 * Sanitizes metadata to NEVER store secret credentials or tokens
 */
export async function sanitizeAuditMetadata(metadata: Record<string, any> = {}): Promise<Record<string, any>> {
  const clean: Record<string, any> = {}
  const secretKeys = ['password', 'secret', 'token', 'upi_pin', 'cvv', 'key', 'auth']

  Object.entries(metadata).forEach(([k, v]) => {
    const isSecret = secretKeys.some((s) => k.toLowerCase().includes(s))
    if (!isSecret) {
      clean[k] = v
    } else {
      clean[k] = '[REDACTED]'
    }
  })

  return clean
}

export async function logAuditEvent(input: LogAuditInput) {
  try {
    const supabase = await createClient()

    const cleanMeta = await sanitizeAuditMetadata(input.metadata || {})

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        business_id: input.businessId,
        user_id: input.userId || null,
        user_email: input.userEmail || null,
        action: input.action,
        entity_type: input.entityType,
        entity_id: input.entityId || null,
        metadata: cleanMeta,
        created_at: new Date().toISOString(),
      })
      .select('*')
      .single()

    if (error) {
      console.error('Audit log insertion failed:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, data }
  } catch (err: any) {
    console.error('Audit log exception:', err)
    return { success: false, error: err?.message || 'Failed to log audit event' }
  }
}

export async function getAuditLogs(businessId: string, limit: number = 50) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch audit logs:', error.message)
    return []
  }

  return data || []
}
