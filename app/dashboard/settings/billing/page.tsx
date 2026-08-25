import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getBusinessSubscription } from '@/lib/services/subscription-service'
import { PLAN_LIMITS } from '@/lib/validations/subscription'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, AlertTriangle, CreditCard } from 'lucide-react'

export default async function BillingSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: membership } = await supabase
    .from('business_members')
    .select('business_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!membership || membership.role !== 'OWNER') {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded border border-red-200 flex items-center gap-2 font-bold">
          <AlertTriangle className="h-5 w-5" /> Only the Business Owner can manage billing and subscriptions.
        </div>
      </div>
    )
  }

  const subscription = await getBusinessSubscription(membership.business_id)
  const currentPlan = subscription?.plan || 'FREE'
  const currentLimits = PLAN_LIMITS[currentPlan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS['FREE']

  // Ensure robust dates
  const trialEnd = subscription?.trial_end ? new Date(subscription.trial_end) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  const isTrial = subscription?.status === 'TRIALING' && trialEnd > new Date()
  const trialDaysLeft = isTrial ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Billing & Subscriptions</h2>
        <p className="text-sm text-muted-foreground">Manage your SaaS plan, upgrade limits, and view billing history.</p>
      </div>

      <Card className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="text-lg font-bold">Current Plan: <span className="text-primary">{currentPlan}</span></h3>
            
            {isTrial ? (
              <p className="text-sm text-amber-600 font-semibold mt-1">
                You are on a Free Trial. {trialDaysLeft} days left.
              </p>
            ) : subscription?.status === 'ACTIVE' ? (
              <p className="text-sm text-emerald-600 font-semibold mt-1">
                Your subscription is active.
              </p>
            ) : subscription?.status === 'PAST_DUE' ? (
              <p className="text-sm text-rose-600 font-semibold mt-1">
                Your payment is past due. Please update your payment method.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                You are currently on the Free plan limits.
              </p>
            )}
          </div>
          
          <Button asChild className="font-bold gap-2">
            <a href="mailto:sales@billingsaas.com">
              <CreditCard className="h-4 w-4" /> Manage Payment Method
            </a>
          </Button>
        </div>

        <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2 border rounded p-4 bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Monthly Invoices</div>
            <div className="text-2xl font-bold font-mono">
              {currentLimits.monthly_invoices === -1 ? 'Unlimited' : currentLimits.monthly_invoices}
            </div>
            <div className="text-xs text-muted-foreground">invoices per month</div>
          </div>
          
          <div className="space-y-2 border rounded p-4 bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Team Members</div>
            <div className="text-2xl font-bold font-mono">
              {currentLimits.team_members === -1 ? 'Unlimited' : currentLimits.team_members}
            </div>
            <div className="text-xs text-muted-foreground">max users in RBAC</div>
          </div>

          <div className="space-y-2 border rounded p-4 bg-muted/20">
            <div className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Advanced Reports</div>
            <div className="text-2xl font-bold font-sans">
              {currentLimits.advanced_reports ? 'Enabled' : 'Disabled'}
            </div>
            <div className="text-xs text-muted-foreground">P&L & Capital Ledger</div>
          </div>
        </div>
      </Card>

      <div>
        <h3 className="font-bold text-lg mb-4">Upgrade Your Plan</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {/* STARTER */}
          <Card className={`p-6 flex flex-col ${currentPlan === 'STARTER' ? 'border-primary ring-2 ring-primary/20' : ''}`}>
            <h4 className="font-bold text-lg">Starter</h4>
            <div className="text-2xl font-bold my-4">₹499<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
            <ul className="space-y-3 flex-1 text-sm mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> 100 Invoices/mo</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> 2 Team Members</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Advanced Reports</li>
            </ul>
            {currentPlan === 'STARTER' ? (
              <Button disabled variant="outline">Current Plan</Button>
            ) : (
              <Button>Upgrade to Starter</Button>
            )}
          </Card>

          {/* BUSINESS */}
          <Card className={`p-6 flex flex-col border-primary bg-primary/5 ${currentPlan === 'BUSINESS' ? 'ring-2 ring-primary' : ''}`}>
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded-bl-lg font-bold uppercase tracking-wider">Most Popular</div>
            <h4 className="font-bold text-lg text-primary">Business</h4>
            <div className="text-2xl font-bold my-4">₹1,299<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
            <ul className="space-y-3 flex-1 text-sm mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> 1,000 Invoices/mo</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> 5 Team Members</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Advanced Reports</li>
            </ul>
            {currentPlan === 'BUSINESS' ? (
              <Button disabled variant="outline">Current Plan</Button>
            ) : (
              <Button className="font-bold bg-primary">Upgrade to Business</Button>
            )}
          </Card>

          {/* PRO */}
          <Card className={`p-6 flex flex-col ${currentPlan === 'PRO' ? 'border-primary ring-2 ring-primary/20' : ''}`}>
            <h4 className="font-bold text-lg">Pro</h4>
            <div className="text-2xl font-bold my-4">₹2,499<span className="text-sm text-muted-foreground font-normal">/mo</span></div>
            <ul className="space-y-3 flex-1 text-sm mb-6">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Unlimited Invoices</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Unlimited Team</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-primary" /> Priority Support</li>
            </ul>
            {currentPlan === 'PRO' ? (
              <Button disabled variant="outline">Current Plan</Button>
            ) : (
              <Button variant="outline" className="border-primary text-primary">Contact Sales</Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
