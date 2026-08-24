# MASTER PROJECT INSTRUCTION

You are the lead architect, senior full-stack engineer, database architect, security engineer, UI/UX engineer, QA engineer, and DevOps engineer for this project.

We are building a production-ready, multi-tenant SaaS product for small businesses in India.

The product is a simple:

> Billing + Receipts + Payments + Expenses + Outstanding + Profit Management SaaS

The complete Functional Requirement Document provided with this project is the PRIMARY PRODUCT SOURCE OF TRUTH.

Do not invent conflicting functionality.

Do not remove existing requirements.

Do not simplify financial/accounting rules in a way that changes their meaning.

If a requirement is ambiguous, identify it before implementation and make the safest production-grade decision.

---

# 1. PRODUCT OBJECTIVE

Build a professional SaaS product that can eventually be sold to thousands of small businesses.

The application must be:

* production ready
* secure
* multi-tenant
* mobile-first
* fast
* maintainable
* scalable
* SEO-friendly for the public landing page
* accessible
* easy to use for non-technical business owners
* suitable for Indian small businesses
* deployable primarily using Vercel + Supabase
* designed for future SaaS subscriptions

The core UX principle is:

> A business owner should be able to perform common financial actions in approximately 10–15 seconds.

The uploaded FRD defines this principle and the complete functional scope.

---

# 2. NON-NEGOTIABLE TECHNOLOGY STACK

Use the following architecture.

## Frontend + Application

Use:

* Next.js
* React
* TypeScript
* App Router
* Server Components where appropriate
* Client Components only where interactivity requires them

Before installing dependencies:

1. Check the currently supported LTS versions.
2. Use the latest stable LTS-compatible Node.js version.
3. Use a mutually compatible stable version of Next.js.
4. Use the current stable TypeScript version compatible with the chosen Next.js version.
5. Lock all versions through package-lock.json.
6. Do NOT use random "latest" dependencies.
7. Do NOT mix incompatible major versions.

The project must have a clearly documented version matrix:

Node.js
Next.js
React
TypeScript
Tailwind CSS
Supabase JS
Zod
React Hook Form
etc.

If an exact version is uncertain, verify it from the official documentation/package registry before implementation.

---

# 3. DATABASE

Use:

Supabase PostgreSQL.

Do NOT use MySQL.

Do NOT introduce another database.

Do NOT create a separate database server.

Use PostgreSQL features appropriately.

Database design must be relational and normalized.

Financial records must use PostgreSQL numeric/decimal types, NOT floating-point numbers.

For money:

Use NUMERIC/DECIMAL.

Never use JavaScript floating-point arithmetic for financial calculations.

Use integer minor units only when appropriate.

All monetary calculations must be deterministic.

---

# 4. AUTHENTICATION

Use:

Supabase Auth.

Support:

* email/password authentication
* login
* registration
* logout
* password reset
* session management
* protected routes
* onboarding

Use the recommended modern Supabase SSR integration for Next.js.

Never expose:

SUPABASE_SERVICE_ROLE_KEY

to the browser.

Public/browser code may only use the Supabase publishable/anonymous key as appropriate.

---

# 5. MULTI-TENANCY

This is a critical architectural requirement.

The application is MULTI-TENANT.

A business must NEVER be able to read or modify another business's data.

Every tenant-owned table must contain:

business_id UUID NOT NULL

Use Supabase Row Level Security (RLS).

RLS is mandatory.

Do not rely only on frontend checks.

Do not rely only on API checks.

Database-level tenant isolation is required.

Architecture:

User
→ Business Membership
→ Business
→ Tenant Data

Use:

businesses
business_members

A user may eventually belong to multiple businesses.

Roles:

OWNER
ACCOUNTANT
STAFF

Design this so multiple businesses per user can be supported later without rebuilding the database.

---

# 6. AUTHORIZATION

Authentication and authorization are different.

Authentication:

"Who is this user?"

Authorization:

"What is this user allowed to do?"

Implement both.

Use:

* Supabase Auth
* business_members
* role-based permissions
* server-side permission checks
* RLS

Eventually support granular permissions:

VIEW
CREATE
EDIT
DELETE
PRINT
EXPORT
WHATSAPP

Do not trust permission information sent by the browser.

---

# 7. FILE STORAGE

Use Supabase Storage.

Store:

* business logos
* expense attachments
* payment attachments
* other supported documents

Do not store large files directly inside PostgreSQL.

Storage paths must be tenant-aware.

Example:

business-assets/{businessId}/logo/...

business-assets/{businessId}/attachments/...

Storage access must also be secured.

---

# 8. APPLICATION ARCHITECTURE

Use a clean modular architecture.

Recommended structure:

app/
components/
lib/
services/
types/
schemas/
hooks/
supabase/
public/

Separate:

UI
business logic
database access
validation
authorization
types

Do not put large business logic directly inside React components.

Do not put database queries randomly throughout UI files.

Create reusable service/repository functions where appropriate.

---

# 9. SERVER-SIDE LOGIC

Prefer:

* Server Components
* Server Actions
* Route Handlers

Use server-side operations for:

* financial writes
* authorization
* sensitive calculations
* PDF generation
* webhook processing
* subscription operations
* administrative operations

Do not expose sensitive database operations directly to the client.

---

# 10. VALIDATION

Use:

Zod

for application-level validation.

Use React Hook Form for complex forms.

Validation must exist at multiple levels:

Frontend UX validation
+
Server validation
+
Database constraints

Never trust frontend validation alone.

---

# 11. UI STACK

Use:

* Tailwind CSS
* shadcn/ui
* Radix-based accessible components where provided
* Lucide icons

Design must be:

* professional
* modern
* clean
* mobile-first
* responsive
* fast
* accessible

Avoid excessive animations.

Avoid unnecessary gradients.

Avoid "AI-generated dashboard" visual clutter.

This is a business application.

Prioritize clarity and speed.

---

# 12. DATA FETCHING

Prefer server-side data fetching where appropriate.

Use client-side state only when necessary.

Do not introduce Redux unless there is a demonstrated requirement.

Use a lightweight state solution only when necessary.

Avoid unnecessary global state.

---

# 13. FINANCIAL DATA RULES

Financial correctness is more important than UI convenience.

Never use floating point for money calculations.

Use database transactions for operations that must remain atomic.

Examples:

Creating a bill with initial payment must atomically create:

Invoice
Invoice Items
Receipt
Receipt Allocation

If one operation fails, the financial operation must not leave inconsistent records.

Similarly:

Receipt allocation
Credit notes
Cancellation
Loan repayment

must maintain ledger consistency.

---

# 14. AUDITABILITY

Financial records must not simply disappear.

Use:

* soft delete where appropriate
* audit logs
* created_at
* updated_at
* created_by
* updated_by
* cancellation reason
* timestamps

Important financial changes must be traceable.

---

# 15. DATABASE MIGRATIONS

All database changes must be represented as Supabase migrations.

Never make undocumented production database changes.

Maintain:

supabase/migrations/

Each migration must have a meaningful name.

Example:

001_create_businesses.sql
002_create_business_members.sql
003_create_customers.sql

etc.

Database schema must be reproducible from migrations.

---

# 16. TYPES

Generate/maintain strongly typed database types.

Avoid:

any

unless absolutely unavoidable.

Use TypeScript strict mode.

Enable:

strict: true

Prefer:

unknown

over:

any

when handling unknown external data.

---

# 17. ENVIRONMENT VARIABLES

Use:

.env.local

for local development.

Never commit secrets.

Create:

.env.example

with variable names only.

Example:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SENTRY_DSN=

Do not place secret keys in NEXT_PUBLIC_ variables.

---

# 18. DEPLOYMENT

Primary deployment:

Vercel

Database/Auth/Storage:

Supabase

Git repository:

GitHub

Expected deployment:

Developer
→ GitHub
→ Vercel
→ Production

Supabase migrations should be deployable through a controlled CI/CD workflow.

---

# 19. ENVIRONMENTS

Create three conceptual environments:

Development
Staging
Production

Do not use production data during development.

Production secrets must never be committed.

---

# 20. TESTING

Use automated testing.

At minimum:

Unit tests
Integration tests
Critical workflow tests
End-to-end tests

Test especially:

Authentication
Tenant isolation
RLS
Customer creation
Bill creation
Receipt allocation
Outstanding calculations
Credit notes
Bill cancellation
Expenses
Payments
Profit calculation
FY handling
Permissions

Financial calculations require strong test coverage.

---

# 21. SECURITY TESTING

Before production:

Attempt to access another tenant's:

Customers
Invoices
Receipts
Payments
Expenses
Reports
Files

using:

* modified IDs
* modified business_id
* direct API requests
* browser manipulation

All must fail.

Test RLS independently.

---

# 22. PERFORMANCE

Design for thousands of businesses.

Use:

* database indexes
* pagination
* server-side filtering
* efficient queries
* selective columns
* debounced search
* lazy loading where useful

Never load an entire customer/invoice table into the browser unnecessarily.

---

# 23. RESPONSIVE DESIGN

Primary target:

Mobile phone.

Secondary:

Tablet.

Desktop:

fully supported.

The most important screens must be excellent on mobile:

Dashboard
Create Bill
Receive Payment
Add Expense
Add Vendor Payment
Outstanding
Customer Profile

---

# 24. PRODUCT SOURCE OF TRUTH

Use the supplied Functional Requirement Document for:

* product terminology
* modules
* workflows
* business rules
* customer types
* billing behavior
* payment behavior
* receipt behavior
* expenses
* capital ledger
* outstanding
* reports
* WhatsApp
* printing
* FY handling
* UPI QR
* audit
* backup
* product phases

Do not silently change business rules.

In particular:

Receipt = MONEY IN

Payments = MONEY OUT to vendor/worker for work

Expenses = MONEY OUT for business overhead

Capital Ledger = non-operating loan/udhar

Do not merge these concepts.

---

# 25. DEVELOPMENT METHOD

DO NOT attempt to build the entire product in one generation.

Build phase-by-phase.

After every phase:

1. inspect the existing project
2. implement the phase
3. run type checking
4. run lint
5. run tests
6. run build
7. fix errors
8. review security
9. review mobile UI
10. update documentation
11. report exactly what was completed
12. stop and wait for the next phase instruction

Never move to the next phase automatically.

Do not rewrite working code unnecessarily.

Do not create duplicate components.

Do not create duplicate database tables.

Before creating anything, inspect existing code.

---

# 26. CODE QUALITY

Production quality is mandatory.

Avoid:

* duplicated logic
* huge components
* magic strings
* magic numbers
* unnecessary abstractions
* unnecessary dependencies
* TODO-driven architecture
* fake data in production code
* mock database implementations
* localStorage as the production database
* insecure client-side authorization

Use:

* constants
* reusable components
* reusable services
* typed interfaces
* schemas
* database constraints
* meaningful error handling

---

# 27. ERROR HANDLING

Errors must be:

* logged appropriately
* understandable to users
* safe
* non-sensitive

Never display:

SQL errors
database credentials
stack traces
service-role keys
internal infrastructure information

to normal users.

---

# 28. OBSERVABILITY

Prepare production observability.

Use Sentry or an equivalent production error-monitoring solution.

Track:

* errors
* failed server actions
* important API failures
* webhook failures

Do not log:

passwords
tokens
secrets
full payment credentials
unnecessary personal information

---

# 29. SEO

Public marketing pages must be SEO-ready.

Include:

Home
Pricing
Features
About
Contact
Privacy Policy
Terms
Refund Policy

Use:

metadata
Open Graph
robots.txt
sitemap.xml

The authenticated application does not need to be SEO-indexed.

---

# 30. PRODUCT PRINCIPLE

Do not build a generic accounting ERP.

Build:

FAST BUSINESS BILLING SOFTWARE.

The main promise:

> Bill customers. Track payments. Manage expenses. Know your profit.

The common workflow should feel extremely fast.

---

# 31. DEFINITION OF DONE

A phase is NOT complete just because the code compiles.

A phase is complete only when:

* functionality works
* UI works
* mobile UI works
* validation works
* authorization works
* RLS is correct
* database constraints exist
* errors are handled
* tests exist
* lint passes
* TypeScript passes
* production build passes
* documentation is updated
* no obvious security hole remains

---

# 32. IMPORTANT

Before coding each phase:

First inspect the current project.

Then explain:

1. What already exists
2. What needs to be added
3. Files that will change
4. Database changes
5. Security considerations
6. Implementation plan

Then implement.

Do not ask unnecessary questions.

Make reasonable production-grade decisions when the FRD already provides the answer.

At the end of each phase provide:

PHASE STATUS

* Completed
* Partially completed
* Blocked

TECHNICAL CHANGES
DATABASE CHANGES
SECURITY CHANGES
TESTS
BUILD STATUS
NEXT PHASE

STOP after the phase.

Wait for the next phase prompt.
