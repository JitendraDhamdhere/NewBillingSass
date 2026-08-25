-- Create business_permissions table for configurable role matrix
CREATE TABLE IF NOT EXISTS public.business_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'ACCOUNTANT', 'STAFF')),
  resource TEXT NOT NULL, -- e.g. 'invoices', 'receipts', 'payments', 'expenses', 'loans', 'reports', 'settings'
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_create BOOLEAN NOT NULL DEFAULT false,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_delete BOOLEAN NOT NULL DEFAULT false,
  can_print BOOLEAN NOT NULL DEFAULT true,
  can_export BOOLEAN NOT NULL DEFAULT false,
  can_whatsapp BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (business_id, role, resource)
);

-- Enable RLS on business_permissions
ALTER TABLE public.business_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant view permissions"
  ON public.business_permissions FOR SELECT
  USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Tenant owner manage permissions"
  ON public.business_permissions FOR ALL
  USING (business_id IN (SELECT get_user_businesses()));

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  action TEXT NOT NULL, -- e.g. CREATE, EDIT, DELETE, CANCEL, CREDIT_NOTE, PAYMENT, RECEIPT, EXPENSE, LOAN, PERMISSION_CHANGE
  entity_type TEXT NOT NULL, -- e.g. INVOICE, RECEIPT, PAYMENT, EXPENSE, LOAN, CUSTOMER, PERMISSION, TEAM
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- SAFE metadata only (no secrets!)
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tenant select audit logs"
  ON public.audit_logs FOR SELECT
  USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Tenant insert audit logs"
  ON public.audit_logs FOR INSERT
  WITH CHECK (business_id IN (SELECT get_user_businesses()));
