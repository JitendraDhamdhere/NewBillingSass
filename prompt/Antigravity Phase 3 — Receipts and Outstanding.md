# PHASE 3 — RECEIPTS + OUTSTANDING / DUES

Implement the MONEY IN workflow.

Important:

Receipt = MONEY IN.

Do not rename or merge this with Payments.

## Receipt database

Create:

receipts
receipt_allocations

A receipt can be:

1. Against one bill
2. Against multiple bills
3. Standalone/other income

## Receipt allocation

Implement the FRD's fully manual allocation model.

When customer is selected:

Show outstanding invoices.

Sort oldest first.

Do NOT automatically allocate FIFO.

User manually selects bills.

User manually enters allocation amount.

Show:

Payment Amount
Allocated Amount
Remaining Unallocated Amount

Do not allow save while allocation is invalid.

## Overpayment

If payment exceeds outstanding invoices:

Store excess as:

Customer Advance / Credit Balance

Make this reusable later.

## Standalone Receipt

Support:

category
description
amount
date
payment mode
customer optional
notes

## Outstanding

Create customer receivable view.

Show:

Customer
Invoice
Due amount
Due date
Status

Statuses:

OVERDUE
DUE_SOON
PENDING

Implement filtering.

## Dashboard metrics

Prepare services for:

Today's collection
Total outstanding
Overdue amount
Due today

## Receipt output

After receipt creation:

Print Receipt
WhatsApp Receipt

Prepare PDF/print abstraction.

## Tests

Test:

one receipt → one bill
one receipt → multiple bills
partial allocation
full allocation
overpayment
standalone income
tenant isolation
invalid allocation
duplicate submission

## STOP

Do not implement WhatsApp Business API.

Use only the MVP sharing architecture.

Provide phase report and STOP.