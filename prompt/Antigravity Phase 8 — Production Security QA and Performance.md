# PHASE 8 — PRODUCTION HARDENING

The functional product now exists.

Do NOT add major new features.

Perform a production readiness audit.

## Security audit

Check:

Supabase RLS
authentication
authorization
tenant isolation
storage policies
API routes
server actions
environment variables
service-role key exposure
XSS
CSRF considerations
SQL injection
IDOR
rate limiting
input validation
file upload security

## Tenant isolation attack tests

Try:

Business A user accessing Business B invoice ID.

Business A user accessing Business B customer ID.

Business A user modifying Business B expense.

Business A user downloading Business B attachment.

Business A user accessing Business B reports.

All must fail.

## Financial integrity

Test:

duplicate bill submission
double receipt submission
concurrent invoice creation
over-allocation
negative values
invalid dates
cancelled invoice payment
credit note calculation
loan accounting
profit calculation

## Performance

Check:

database indexes
slow queries
N+1 queries
large reports
pagination
search
dashboard queries

Add indexes only where justified.

## UX audit

Check mobile:

320px
375px
390px
430px

Tablet.

Desktop.

Ensure:

no horizontal overflow
buttons usable by touch
forms easy to complete
tables responsive
loading states
empty states
error states

## Accessibility

Check:

keyboard navigation
labels
ARIA where required
focus states
contrast
screen-reader semantics

## SEO

Check public pages:

metadata
OpenGraph
sitemap
robots
canonical URLs

Authenticated application should not be unnecessarily indexed.

## Error monitoring

Integrate production error monitoring.

Do not expose sensitive information.

## Build

Run:

lint
typecheck
unit tests
integration tests
E2E tests
production build

Everything must pass.

## Documentation

Update:

README.md
docs/ARCHITECTURE.md
docs/TECH_STACK.md
docs/DATABASE.md
docs/SECURITY.md
docs/DEPLOYMENT.md
docs/TESTING.md

## STOP

Do not deploy yet.

Provide a complete production-readiness report.