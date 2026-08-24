# PHASE 10 — COMMERCIAL SAAS

Now convert the application into a commercially sellable SaaS.

Do not break existing financial functionality.

## Subscription architecture

Create:

subscriptions
plans
subscription_events

Design for:

FREE
STARTER
BUSINESS
PRO

Do not hard-code plan limits throughout the UI.

Create a centralized entitlement system.

## Subscription provider

Prepare Razorpay subscription integration.

Use server-side secret handling.

Webhook verification is mandatory.

Never trust client-side subscription status.

## Feature limits

Prepare limits such as:

monthly invoices
users
businesses
exports
attachments
advanced reports

Make limits configurable.

## Billing pages

Create:

Pricing
Subscription
Billing History
Upgrade
Downgrade
Cancel

## SaaS states

Support:

trial
active
past_due
cancelled
expired

Do not immediately delete customer business data when a subscription expires.

Use graceful restrictions.

## Onboarding

Improve first-time onboarding.

Flow:

Register
→ Create Business
→ Business Details
→ Invoice Settings
→ UPI Settings
→ First Customer
→ First Bill

Keep onboarding skippable where the FRD allows it.

## Landing page

Create a polished SaaS landing page.

Hero:

Bill customers.
Track payments.
Know your profit.

Include:

features
screenshots/placeholders
pricing
FAQ
CTA
contact

Target Indian small businesses.

## Trust

Add:

Privacy Policy
Terms
Refund/Cancellation Policy
Contact
Data export information
Security information

## Product analytics

Track non-sensitive product events:

business_created
first_bill_created
invoice_created
receipt_created
expense_created
subscription_started
subscription_upgraded

Do not track unnecessary sensitive financial details.

## Support

Create:

Help
Contact Support
FAQ

## Commercial readiness

Check:

pricing flow
trial
subscription
payment
webhook
failed payment
cancellation
renewal
entitlements

## Final QA

Run complete end-to-end flow:

Visitor
→ Signup
→ Business
→ Customer
→ Bill
→ Payment
→ Receipt
→ Outstanding
→ Reminder
→ Report
→ Subscription

## STOP

Provide a commercial readiness report.