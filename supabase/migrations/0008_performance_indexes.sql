-- Phase 8 Performance & Query Optimization Indexes

-- Index on invoices
CREATE INDEX IF NOT EXISTS idx_invoices_business_date ON public.invoices(business_id, invoice_date DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(business_id, status);

-- Index on invoice_items
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- Index on receipts
CREATE INDEX IF NOT EXISTS idx_receipts_business_date ON public.receipts(business_id, receipt_date DESC);
CREATE INDEX IF NOT EXISTS idx_receipts_customer_id ON public.receipts(customer_id);

-- Index on receipt_allocations
CREATE INDEX IF NOT EXISTS idx_receipt_allocations_receipt_id ON public.receipt_allocations(receipt_id);
CREATE INDEX IF NOT EXISTS idx_receipt_allocations_invoice_id ON public.receipt_allocations(invoice_id);

-- Index on vendor_payments
CREATE INDEX IF NOT EXISTS idx_vendor_payments_business_date ON public.vendor_payments(business_id, payment_date DESC);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_invoice_id ON public.vendor_payments(invoice_id);

-- Index on expenses
CREATE INDEX IF NOT EXISTS idx_expenses_business_date ON public.expenses(business_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(business_id, category);

-- Index on capital_loans & repayments
CREATE INDEX IF NOT EXISTS idx_capital_loans_business ON public.capital_loans(business_id);
CREATE INDEX IF NOT EXISTS idx_capital_repayments_loan ON public.capital_repayments(loan_id);

-- Index on customers & services
CREATE INDEX IF NOT EXISTS idx_customers_business ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_services_business ON public.services(business_id);

-- Index on audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_business_created ON public.audit_logs(business_id, created_at DESC);
