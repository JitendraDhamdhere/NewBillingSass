# PHASE 5 — DASHBOARD + REPORTS

Implement production-quality dashboard and reporting.

## Dashboard

Today:

Today's Bills
Today's Collection
Today's Payments
Today's Expenses

Month:

Total Income
Total Payments + Expenses
Net Profit
Total Outstanding
Loan Outstanding

Quick actions:

Create Bill
Receipt
Payment
Expense
Customer

Notifications:

Overdue
Due Today
Received Today

## Profit calculation

Profit must follow the FRD.

Operating income:

Receipts / business income

Operating costs:

Payments + Expenses

Exclude loan principal.

Interest counts as expense.

Do not count capital loan proceeds as income.

## Reports

Implement:

Billing
Receipt
Payments
Expenses
Outstanding
Loan/Udhar
Profit & Loss

Support:

Today
Week
Month
Year
Custom date range

## Financial Year

Implement India FY:

1 April → 31 March

Every relevant financial record must have a reliable FY representation.

Support:

current FY default
FY selector
previous FY

Implement opening balance carry-forward architecture.

## Search

Global search:

Customer name
Mobile
Invoice number
Receipt number
Description

Use debounced server-side search.

## Export

Prepare:

CSV
Excel
PDF

architecture.

Avoid generating massive exports directly in the browser.

## Performance

Reports must be database-driven.

Do not fetch thousands of records and calculate everything in React.

Use PostgreSQL queries/aggregations.

## Tests

Test:

daily totals
monthly totals
FY totals
profit
outstanding
loan exclusion
interest inclusion
tenant isolation

## STOP

Provide phase report and STOP.