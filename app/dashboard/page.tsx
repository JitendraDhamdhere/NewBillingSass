import * as React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Building, Shield, Sparkles, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-primary/10 border border-primary/20 p-6 flex items-start gap-4">
        <Sparkles className="h-6 w-6 text-primary shrink-0 mt-1" />
        <div>
          <h2 className="text-lg font-semibold text-primary">Your Workspace is Ready!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            You have successfully established the foundational multi-tenant architecture. 
            This tenant container is isolated at the database level using Row Level Security (RLS).
          </p>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tenancy Isolation
            </CardTitle>
            <Shield className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">Active</div>
            <p className="text-xs text-muted-foreground mt-1">
              RLS policies actively restrict queries to business_id context.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Billing Modules
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Planned</div>
            <p className="text-xs text-muted-foreground mt-1">
              Invoices, receipts, payments, and ledger setup in Phase 1 & 2.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Workspace Scope
            </CardTitle>
            <Building className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Single-Tenant</div>
            <p className="text-xs text-muted-foreground mt-1">
              User session is securely linked to the active business member profile.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Welcome to Fast Business Billing</CardTitle>
          <CardDescription>
            Scaffolded application modules will appear below as you progress through development phases.
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
          <span className="text-muted-foreground text-sm font-medium">
            Next: Implement the database migrations and data sync models.
          </span>
        </CardContent>
      </Card>
    </div>
  )
}
