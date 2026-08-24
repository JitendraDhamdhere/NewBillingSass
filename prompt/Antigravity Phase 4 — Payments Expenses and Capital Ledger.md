# PHASE 4 — PAYMENTS + EXPENSES + CAPITAL LEDGER

Implement all MONEY OUT and non-operating capital workflows.

IMPORTANT TERMINOLOGY:

Receipt = MONEY IN

Payments = MONEY OUT to vendor/worker for work

Expenses = MONEY OUT for business overhead

Capital Ledger = Loan/Udhar/Capital and is NOT operating income or expense

Do not merge these.

## Payments

Create:

payments

Support:

Paid To
Mobile
Work/Purpose
Linked Bill optional
Amount
Date
Payment Mode
Attachment
Notes

Optional vendor ledger architecture should be created cleanly.

## Linked vendor payment

If linked to a customer bill/job:

calculate job profitability:

Bill
-
linked vendor payments
=
job contribution/profit before overhead

## Expenses

Create:

expenses

Support:

category
description
amount
date
payment mode
vendor/payee
attachment
notes

Default categories from FRD:

Rent
Electricity
Internet
Salary
Travel
Marketing
Software/Subscriptions
Maintenance
Office Supplies
Other

Allow custom categories.

## Capital Ledger

Create:

loans
loan_repayments

Loan received:

must increase cash position but NOT income/profit.

Loan principal repayment:

must decrease liability but NOT expense.

Interest:

must be treated as actual expense.

Implement principal/interest split.

## Financial rules

Never include:

loan principal received

in business income.

Never include:

loan principal repayment

in expenses/profit.

Only interest should affect expense/profit.

## Tests

Test all accounting behavior.

Especially:

Loan received → cash increases, profit unchanged.

Principal repayment → liability decreases, profit unchanged.

Interest payment → expense increases.

## Attachments

Use Supabase Storage.

Ensure storage access is tenant-safe.

## STOP

Do not implement subscription billing.

Provide phase report and STOP.