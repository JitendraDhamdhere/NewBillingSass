# PHASE 9 — PRODUCTION DEPLOYMENT

Prepare the application for real production deployment.

Target:

Vercel + Supabase + GitHub.

## GitHub

Ensure:

main
develop

or an equivalent safe branching strategy.

No secrets in Git.

No generated build artifacts committed.

## Vercel

Configure:

production environment
preview environment
environment variables
custom domain preparation

Separate:

development
preview/staging
production

## Supabase

Verify:

production project
database migrations
RLS
storage policies
authentication URLs
redirect URLs
email configuration

## Environment variables

Verify every variable.

Separate public and secret variables.

Never expose:

service-role key
payment secret
email secret
webhook secret

## Deployment

Deploy preview.

Run smoke tests.

Then production.

## Production smoke tests

Test:

registration
login
logout
business creation
customer
service
bill
receipt
payment
expense
outstanding
report
PDF
print
WhatsApp
UPI QR

Test tenant isolation in production environment.

## Monitoring

Confirm:

error monitoring
logs
database monitoring
uptime monitoring where appropriate

## Backup

Verify the actual backup/recovery capability of the selected Supabase production plan.

Do NOT claim a backup retention period that is not actually configured.

## Domain

Prepare:

app.example.com

and optionally:

www.example.com

Marketing site and application routing should be clean.

## STOP

Provide:

Production URL
Preview URL
Supabase status
Environment status
Migration status
Security status
Smoke test status

Do not continue to SaaS billing yet.