-- Create invoice sequences table for concurrency-safe invoice numbering
CREATE TABLE public.invoice_sequences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    numbering_mode TEXT NOT NULL CHECK (numbering_mode IN ('CONTINUOUS', 'FY_WISE')),
    fy_year TEXT NOT NULL DEFAULT 'GLOBAL',
    current_val INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (business_id, numbering_mode, fy_year)
);

-- Enable RLS on invoice_sequences
ALTER TABLE public.invoice_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sequence of their business"
    ON public.invoice_sequences FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can manage sequence of their business"
    ON public.invoice_sequences FOR ALL TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

-- Create invoices table
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    invoice_prefix TEXT NOT NULL DEFAULT 'INV',
    sequence_number INT NOT NULL,
    fy_year TEXT NOT NULL,
    numbering_mode TEXT NOT NULL CHECK (numbering_mode IN ('CONTINUOUS', 'FY_WISE')) DEFAULT 'FY_WISE',
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_mobile TEXT,
    is_walk_in BOOLEAN NOT NULL DEFAULT FALSE,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (subtotal >= 0),
    discount_percentage NUMERIC(5, 2) DEFAULT 0.00 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
    discount_amount NUMERIC(15, 2) DEFAULT 0.00 CHECK (discount_amount >= 0),
    tax_amount NUMERIC(15, 2) DEFAULT 0.00 CHECK (tax_amount >= 0),
    grand_total NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (grand_total >= 0),
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (paid_amount >= 0),
    balance_due NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance_due >= 0),
    status TEXT NOT NULL CHECK (status IN ('PAID', 'PARTIALLY_PAID', 'UNPAID', 'OVERDUE', 'CANCELLED')) DEFAULT 'UNPAID',
    notes TEXT,
    terms TEXT,
    cancellation_reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (business_id, invoice_number)
);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select invoices from their business"
    ON public.invoices FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can insert invoices into their business"
    ON public.invoices FOR INSERT TO authenticated
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can update invoices in their business"
    ON public.invoices FOR UPDATE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can delete invoices from their business"
    ON public.invoices FOR DELETE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

-- Create invoice_items table
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(15, 3) NOT NULL DEFAULT 1.000 CHECK (quantity > 0),
    unit_price NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (unit_price >= 0),
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    discount_amount NUMERIC(15, 2) DEFAULT 0.00 CHECK (discount_amount >= 0),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on invoice_items
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select invoice items from their business"
    ON public.invoice_items FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can insert invoice items into their business"
    ON public.invoice_items FOR INSERT TO authenticated
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can update invoice items in their business"
    ON public.invoice_items FOR UPDATE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can delete invoice items from their business"
    ON public.invoice_items FOR DELETE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

-- Create receipts table (Money In)
CREATE TABLE public.receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    receipt_number TEXT NOT NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    receipt_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    payment_mode TEXT NOT NULL CHECK (payment_mode IN ('CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER')) DEFAULT 'CASH',
    reference_number TEXT,
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on receipts
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select receipts from their business"
    ON public.receipts FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can insert receipts into their business"
    ON public.receipts FOR INSERT TO authenticated
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can update receipts in their business"
    ON public.receipts FOR UPDATE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can delete receipts from their business"
    ON public.receipts FOR DELETE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

-- Create receipt_allocations table
CREATE TABLE public.receipt_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    allocated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (allocated_amount >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on receipt_allocations
ALTER TABLE public.receipt_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select receipt allocations from their business"
    ON public.receipt_allocations FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can insert receipt allocations into their business"
    ON public.receipt_allocations FOR INSERT TO authenticated
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can update receipt allocations in their business"
    ON public.receipt_allocations FOR UPDATE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can delete receipt allocations from their business"
    ON public.receipt_allocations FOR DELETE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

-- Create credit_notes table
CREATE TABLE public.credit_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    credit_note_number TEXT NOT NULL,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    credit_note_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (amount >= 0),
    reason TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'APPLIED', 'REFUNDED', 'VOID')) DEFAULT 'OPEN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on credit_notes
ALTER TABLE public.credit_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select credit notes from their business"
    ON public.credit_notes FOR SELECT TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can insert credit notes into their business"
    ON public.credit_notes FOR INSERT TO authenticated
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can update credit notes in their business"
    ON public.credit_notes FOR UPDATE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can delete credit notes from their business"
    ON public.credit_notes FOR DELETE TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

-- Apply updated_at triggers
CREATE TRIGGER trg_update_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_receipts_updated_at
    BEFORE UPDATE ON public.receipts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_credit_notes_updated_at
    BEFORE UPDATE ON public.credit_notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate Indian Financial Year (FY) string: April 1 - March 31
CREATE OR REPLACE FUNCTION public.get_indian_fy_year(p_date DATE)
RETURNS TEXT AS $$
DECLARE
    v_year INT;
    v_month INT;
    v_start_year INT;
    v_end_year INT;
BEGIN
    v_year := EXTRACT(YEAR FROM p_date);
    v_month := EXTRACT(MONTH FROM p_date);

    IF v_month >= 4 THEN
        v_start_year := v_year;
        v_end_year := v_year + 1;
    ELSE
        v_start_year := v_year - 1;
        v_end_year := v_year;
    END IF;

    RETURN v_start_year::TEXT || '-' || SUBSTRING(v_end_year::TEXT FROM 3 FOR 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Concurrency-safe Next Invoice Number Generator Function
CREATE OR REPLACE FUNCTION public.generate_next_invoice_number(
    p_business_id UUID,
    p_numbering_mode TEXT DEFAULT 'FY_WISE',
    p_invoice_date DATE DEFAULT CURRENT_DATE,
    p_prefix TEXT DEFAULT 'INV'
)
RETURNS TABLE (
    out_invoice_number TEXT,
    out_sequence_number INT,
    out_fy_year TEXT
) AS $$
DECLARE
    v_fy TEXT;
    v_key_fy TEXT;
    v_next_val INT;
    v_formatted_num TEXT;
BEGIN
    IF p_numbering_mode = 'FY_WISE' THEN
        v_fy := public.get_indian_fy_year(p_invoice_date);
        v_key_fy := v_fy;
    ELSE
        v_fy := public.get_indian_fy_year(p_invoice_date);
        v_key_fy := 'GLOBAL';
    END IF;

    -- Upsert sequence record atomically with row locking
    INSERT INTO public.invoice_sequences (business_id, numbering_mode, fy_year, current_val)
    VALUES (p_business_id, p_numbering_mode, v_key_fy, 1)
    ON CONFLICT (business_id, numbering_mode, fy_year)
    DO UPDATE SET current_val = public.invoice_sequences.current_val + 1, updated_at = now()
    RETURNING current_val INTO v_next_val;

    IF p_numbering_mode = 'FY_WISE' THEN
        v_formatted_num := p_prefix || '-' || v_fy || '-' || LPAD(v_next_val::TEXT, 4, '0');
    ELSE
        v_formatted_num := p_prefix || '-' || LPAD(v_next_val::TEXT, 6, '0');
    END IF;

    RETURN QUERY SELECT v_formatted_num, v_next_val, v_fy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Performance Indexes
CREATE INDEX idx_invoices_business_id ON public.invoices(business_id);
CREATE INDEX idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_invoice_date ON public.invoices(invoice_date);
CREATE INDEX idx_invoices_created_at ON public.invoices(created_at);

CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_business_id ON public.invoice_items(business_id);

CREATE INDEX idx_receipts_business_id ON public.receipts(business_id);
CREATE INDEX idx_receipts_customer_id ON public.receipts(customer_id);
CREATE INDEX idx_receipts_receipt_date ON public.receipts(receipt_date);

CREATE INDEX idx_receipt_allocations_receipt_id ON public.receipt_allocations(receipt_id);
CREATE INDEX idx_receipt_allocations_invoice_id ON public.receipt_allocations(invoice_id);
CREATE INDEX idx_receipt_allocations_business_id ON public.receipt_allocations(business_id);

CREATE INDEX idx_credit_notes_business_id ON public.credit_notes(business_id);
CREATE INDEX idx_credit_notes_invoice_id ON public.credit_notes(invoice_id);
