# PHASE 2 — CUSTOMERS + SERVICES + BILLING

Now implement the core revenue workflow.

This is the most important part of the product.

## Modules

Implement:

Customers
Services
Billing
Invoice details
Invoice items

## Database

Create:

invoices
invoice_items

Use NUMERIC/DECIMAL for money.

Implement invoice numbering according to the FRD.

Support:

continuous numbering

and

FY-wise numbering

Do not use browser-generated invoice numbers.

Invoice number generation must be concurrency-safe.

## Billing

Create Bill screen must support:

Customer
Walk-in
Bill date
Due date
Services
Custom items
Quantity
Rate
Amount
Discount percentage
Discount amount
Grand total
Payment received now
Payment mode
Balance due

## Customer behavior

Customer selection must support:

existing customer search
new regular customer
walk-in

Implement the exact walk-in rules from the FRD.

## Payment received during billing

If payment is received during bill creation:

Create the appropriate Receipt and allocation atomically.

Do not require the user to enter the payment twice.

## Invoice statuses

Automatically calculate:

PAID
PARTIALLY_PAID
UNPAID
OVERDUE

Do not allow users to manually create contradictory statuses.

## Invoice lifecycle

Implement:

Edit
Cancel
Credit Note preparation/architecture

Respect the FRD rule:

No payment:
fully editable.

Partial/full payment:
item-level editing locked.

Cancellation:
soft-delete/cancelled status + mandatory reason.

Credit note:
separate linked record.

## Financial safety

Use transactions.

Prevent:

negative invoice totals where not allowed
over-allocation
invalid payment amounts
duplicate invoice numbers
cross-tenant access

## UI

Billing screen must be extremely fast on mobile.

Optimize:

keyboard navigation
numeric inputs
customer search
service selection
line-item entry

## Invoice detail

Provide:

View
Print
PDF
WhatsApp

buttons.

PDF generation can initially be implemented through a clean server-side abstraction.

## Tests

Test:

full payment
partial payment
unpaid bill
discount
multiple line items
custom item
walk-in
duplicate customer
invoice edit lock
cancellation
tenant isolation
concurrent invoice numbering

## STOP

Do not implement advanced reports yet.

Provide phase report and STOP.