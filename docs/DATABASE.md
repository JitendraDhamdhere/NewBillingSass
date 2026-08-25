# Database Schema & Performance Index Documentation

## Schema Migrations Breakdown
1. `0001_initial_schema.sql`: Businesses, Members, Customers, Services, Invoices, Items, Receipts, Allocations, Expenses, Payments, Outstanding views.
2. `0002_fix_numbering_mode.sql`: Serial & FY invoice numbering sequence logic.
3. `0003_add_cancellation_reason.sql`: Invoice cancellation audit tracking.
4. `0004_create_credit_notes.sql`: Credit note returns & credit ledger.
5. `0005_create_capital_ledger.sql`: Capital loans & principal/interest split repayments.
6. `0006_add_vpa_and_settings_to_businesses.sql`: Business VPA (UPI ID) & WhatsApp message templates.
7. `0007_create_permissions_and_audit_logs.sql`: Configurable RBAC permission matrix & immutable `audit_logs`.
8. `0008_performance_indexes.sql`: High-frequency query indexes on foreign keys, dates, and filter columns.

## Indexes Created
* `idx_invoices_business_date` (business_id, invoice_date DESC)
* `idx_invoices_customer_id` (customer_id)
* `idx_invoices_status` (business_id, status)
* `idx_receipts_business_date` (business_id, receipt_date DESC)
* `idx_vendor_payments_business_date` (business_id, payment_date DESC)
* `idx_expenses_business_date` (business_id, expense_date DESC)
* `idx_audit_logs_business_created` (business_id, created_at DESC)
