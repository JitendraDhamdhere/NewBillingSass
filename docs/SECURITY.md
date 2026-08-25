# Security Architecture & Production Hardening Policy

## 1. Multi-Tenant Row Level Security (RLS)
All database tables (`businesses`, `business_members`, `customers`, `services`, `invoices`, `receipts`, `vendor_payments`, `expenses`, `capital_loans`, `business_permissions`, `audit_logs`) enforce PostgreSQL Row Level Security (RLS).
* Security helper function `get_user_businesses()` verifies membership in SQL triggers & policies.
* Direct cross-tenant data access (IDOR attacks) fails at the database engine level.

## 2. Server-Side Role-Based Access Control (RBAC)
* Evaluates permissions on the server using `isActionAuthorized(role, resource, action)`.
* Does not rely on hiding UI elements or buttons.
* Owner maintains 100% full access. Accountant and Staff permissions are configurable by the Owner.

## 3. Secret Metadata Sanitization
* `sanitizeAuditMetadata` automatically scans audit log payloads for sensitive keys (`password`, `secret`, `token`, `upi_pin`, `cvv`).
* Redacts secret values to `[REDACTED]` prior to insertion in `audit_logs`.

## 4. Input Validation & Injection Prevention
* Next.js App Router API parameters validated using strict TypeScript schemas.
* Prepared parameter binding used across all database queries to eliminate SQL injection risks.
