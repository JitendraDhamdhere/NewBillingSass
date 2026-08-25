# Production Smoke Test Plan

## 1. Authentication & Onboarding
- [ ] User can successfully register a new account.
- [ ] User is forced to complete the business onboarding form.
- [ ] User can log out and log back in successfully.

## 2. Core CRM & Catalog
- [ ] Add a new Customer. Verify it appears in the list.
- [ ] Add a new Service (Item). Verify it appears in the list and can be toggled Active/Inactive.

## 3. Financial Transactions
- [ ] **Invoice Creation**: Create a new invoice. Verify total calculation (Qty * Rate - Discount + Tax).
- [ ] **Invoice Printing**: Click Print and verify the standard A4 PDF layout renders properly.
- [ ] **UPI Integration**: Verify the dynamic UPI QR code on the invoice scans to the exact balance due.
- [ ] **Receipt Allocation**: Record a receipt and allocate it to the generated invoice. Verify the invoice status changes to PAID or PARTIAL.
- [ ] **Overhead Expenses**: Log a business expense and verify it appears in the Capital/Expense ledger.
- [ ] **Vendor Payments**: Log a vendor payment linked to a bill and verify Job Profitability.

## 4. Security & Tenant Isolation
- [ ] **Role Validation**: Create a Staff member. Verify the Staff member CANNOT access the Settings or Financial Reports.
- [ ] **Tenant Isolation (IDOR)**: Create a second test business account. Attempt to manually access the URL of an invoice from the first business (e.g., `/dashboard/invoices/<uuid>`). Verify it returns a 404 or access denied error.

## 5. System Health
- [ ] **Audit Trail**: Check the `/dashboard/team` -> Audit Logs tab. Verify all the above actions were recorded safely without leaking raw passwords or tokens.
- [ ] **Performance**: Verify lists (Invoices, Customers) load within acceptable latency (< 500ms).
