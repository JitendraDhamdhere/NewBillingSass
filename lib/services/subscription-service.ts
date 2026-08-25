'use server'

import { createClient } from '@/lib/supabase/server'
import { PlanType, PLAN_LIMITS } from '@/lib/validations/subscription'

export async function getBusinessSubscription(businessId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('business_id', businessId)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch subscription:', error.message)
    return null
  }

  // Graceful fallback if no subscription record exists yet (e.g. legacy data)
  if (!data) {
    return {
      plan: 'FREE' as PlanType,
      status: 'TRIALING',
      trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  return data
}

export async function checkEntitlement(
  businessId: string,
  feature: 'monthly_invoices' | 'team_members' | 'advanced_reports'
): Promise<{ allowed: boolean; limit: number; current: number; error?: string }> {
  const sub = await getBusinessSubscription(businessId)
  const plan = (sub?.plan as PlanType) || 'FREE'
  const limits = PLAN_LIMITS[plan]

  // If subscription is expired or cancelled, fall back to FREE limits (graceful degradation)
  const activeLimits =
    sub?.status === 'EXPIRED' || sub?.status === 'CANCELLED' ? PLAN_LIMITS['FREE'] : limits

  const supabase = await createClient()

  if (feature === 'advanced_reports') {
    return {
      allowed: activeLimits.advanced_reports,
      limit: activeLimits.advanced_reports ? 1 : 0,
      current: 0,
      error: activeLimits.advanced_reports ? undefined : 'Advanced reports require a paid plan.',
    }
  }

  if (feature === 'team_members') {
    if (activeLimits.team_members === -1) return { allowed: true, limit: -1, current: 0 }

    const { count, error } = await supabase
      .from('business_members')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)

    if (error) return { allowed: false, limit: 0, current: 0, error: 'Database error' }

    const currentCount = count || 0
    return {
      allowed: currentCount < activeLimits.team_members,
      limit: activeLimits.team_members,
      current: currentCount,
      error:
        currentCount >= activeLimits.team_members
          ? `Plan limit reached: Max ${activeLimits.team_members} team members.`
          : undefined,
    }
  }

  if (feature === 'monthly_invoices') {
    if (activeLimits.monthly_invoices === -1) return { allowed: true, limit: -1, current: 0 }

    // Count invoices generated in the current month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count, error } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('created_at', startOfMonth.toISOString())

    if (error) return { allowed: false, limit: 0, current: 0, error: 'Database error' }

    const currentCount = count || 0
    return {
      allowed: currentCount < activeLimits.monthly_invoices,
      limit: activeLimits.monthly_invoices,
      current: currentCount,
      error:
        currentCount >= activeLimits.monthly_invoices
          ? `Plan limit reached: Max ${activeLimits.monthly_invoices} invoices per month.`
          : undefined,
    }
  }

  return { allowed: false, limit: 0, current: 0, error: 'Unknown feature' }
}
