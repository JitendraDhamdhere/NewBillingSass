-- Create payments table (Vendor/Worker Payments for Work)
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    payment_number TEXT NOT NULL,
    paid_to TEXT NOT NULL,
    mobile TEXT,
    work_purpose TEXT NOT NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER')) DEFAULT 'CASH',
    attachment_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select payments from their business"
    ON public.payments FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can insert payments into their business"
    ON public.payments FOR INSERT TO authenticated
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can update payments in their business"
    ON public.payments FOR UPDATE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can delete payments from their business"
    ON public.payments FOR DELETE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

-- Create expenses table (Overhead Business Expenses)
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    expense_number TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other',
    description TEXT NOT NULL,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER')) DEFAULT 'CASH',
    payee_vendor TEXT,
    attachment_url TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select expenses from their business"
    ON public.expenses FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can insert expenses into their business"
    ON public.expenses FOR INSERT TO authenticated
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can update expenses in their business"
    ON public.expenses FOR UPDATE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can delete expenses from their business"
    ON public.expenses FOR DELETE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

-- Create loans table (Capital Ledger - Non-operating loans)
CREATE TABLE public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    lender_borrower_name TEXT NOT NULL,
    loan_type TEXT NOT NULL CHECK (loan_type IN ('TAKEN', 'GIVEN')) DEFAULT 'TAKEN',
    principal_amount NUMERIC(15, 2) NOT NULL CHECK (principal_amount >= 0),
    outstanding_principal NUMERIC(15, 2) NOT NULL CHECK (outstanding_principal >= 0),
    interest_rate_annual NUMERIC(5, 2) DEFAULT 0.00 CHECK (interest_rate_annual >= 0),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'CLOSED')) DEFAULT 'ACTIVE',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on loans
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select loans from their business"
    ON public.loans FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can insert loans into their business"
    ON public.loans FOR INSERT TO authenticated
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can update loans in their business"
    ON public.loans FOR UPDATE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can delete loans from their business"
    ON public.loans FOR DELETE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

-- Create loan_repayments table (Principal + Interest split)
CREATE TABLE public.loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES public.loans(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    repayment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    principal_paid NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (principal_paid >= 0),
    interest_paid NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (interest_paid >= 0),
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (total_amount >= 0),
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER')) DEFAULT 'CASH',
    reference_number TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on loan_repayments
ALTER TABLE public.loan_repayments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select loan repayments from their business"
    ON public.loan_repayments FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can insert loan repayments into their business"
    ON public.loan_repayments FOR INSERT TO authenticated
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can update loan repayments in their business"
    ON public.loan_repayments FOR UPDATE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can delete loan repayments from their business"
    ON public.loan_repayments FOR DELETE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

-- Triggers for updated_at
CREATE TRIGGER trg_update_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_loans_updated_at
    BEFORE UPDATE ON public.loans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for fast querying
CREATE INDEX idx_payments_business_id ON public.payments(business_id);
CREATE INDEX idx_payments_invoice_id ON public.payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);

CREATE INDEX idx_expenses_business_id ON public.expenses(business_id);
CREATE INDEX idx_expenses_category ON public.expenses(category);
CREATE INDEX idx_expenses_expense_date ON public.expenses(expense_date);

CREATE INDEX idx_loans_business_id ON public.loans(business_id);
CREATE INDEX idx_loans_status ON public.loans(status);

CREATE INDEX idx_loan_repayments_loan_id ON public.loan_repayments(loan_id);
CREATE INDEX idx_loan_repayments_business_id ON public.loan_repayments(business_id);
