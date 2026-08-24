# PHASE 6 — DOCUMENTS + WHATSAPP + UPI

Implement customer-facing document and sharing functionality.

## PDF

Create professional:

Invoice PDF
Receipt PDF
Customer Statement PDF

PDF must include business branding.

Support:

business logo
business name
address
mobile
WhatsApp
invoice number
date
items
amount
payment status
balance
payment instructions
footer

## Print

Support:

A4
Thermal-friendly layout

MVP:

Browser print dialog.

Do not build a desktop print bridge yet.

## WhatsApp MVP

Use WhatsApp deep-link/share approach.

Support:

Send Bill
Send Receipt
Send Due Reminder
Send Customer Statement

Messages must be templated and configurable from settings.

Use variables:

Customer Name
Invoice Number
Amount
Due Amount
Due Date
Business Name
Payment Details

Do not implement automatic bulk WhatsApp API sending in this phase.

## UPI QR

Generate dynamic UPI QR based on:

Business VPA
Current Balance Due

QR must update when balance changes.

Support:

Invoice PDF
A4 print
Thermal layout

MVP only initiates payment.

Do not falsely mark payment as received.

Manual receipt confirmation remains required.

## Security

Never put secret payment gateway credentials into QR generation.

Do not store unnecessary payment credentials.

## Tests

Test:

correct invoice amount
correct outstanding amount
partial payment → updated QR
WhatsApp variable replacement
PDF generation
print layout

## STOP

Provide phase report and STOP.