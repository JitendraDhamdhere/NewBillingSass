# BillingSaaS — System Architecture & Technical Specifications

## 1. Overview
BillingSaaS is a modern, high-performance, multi-tenant billing, invoicing, and financial management system engineered for SMBs and enterprise businesses.

## 2. Core Architecture Stack
* **Framework**: Next.js 16 (App Router, Turbopack, Server Actions, SSR Client)
* **Language**: TypeScript 5 (Strict Mode enabled)
* **Database & Auth**: Supabase PostgreSQL with tenant Row Level Security (RLS)
* **Styling & UI**: Vanilla CSS + Tailwind CSS, Lucide React icons
* **QR Engine**: NPCI standard UPI URI generator + SVG/PNG Data URL renderer (`qrcode`)
* **Messaging**: WhatsApp deep-link templated sharing API
* **Testing Suite**: Vitest (Unit, Integration, Financial Accounting, Security Penetration)

## 3. Key Subsystems
1. **Multi-Tenancy Isolation**: Every table is scoped by `business_id` with Supabase RLS policies enforcing strict tenant boundaries.
2. **Double-Entry Financial Accounting**:
   - Invoices & Item line consistency.
   - Receipts manual allocation & Customer Advance credit tracking.
   - Job Profitability (Bill Amount - Vendor Payments).
   - Profit & Loss Engine (Operating Income vs Operating Costs; non-operating capital loans strictly excluded from P&L).
3. **Role-Based Access Control (RBAC)**:
   - Configurable Owner, Accountant, and Staff matrix.
   - Server-side authorization check before executing business actions.
4. **Audit Log System**:
   - Immutable audit records for all mutation actions.
   - Secret credential redaction.
