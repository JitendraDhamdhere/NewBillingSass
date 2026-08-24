# SaaS Project — Overall Flow & Progress Manager

This dashboard tracks the completion status of each development phase and prompt in the project.

---

## 📊 Summary Progress
* **Total Phases**: 10
* **Completed Phases**: 1
* **Remaining Phases**: 9
* **Current Active Phase**: **Phase 1 — Supabase Database and Multi-Tenancy**

```
[▓░░░░░░░░░] 10% Complete
```

---

## 🗺️ Phase-by-Phase Roadmap

### 🟢 Phase 0: Production Foundation
* **Status**: Completed  
* **Goal**: Establish Next.js 16 (Turbopack), TypeScript, Tailwind CSS, Supabase SSR client, UI Shell, auth views, Vitest suite, and build checks.
* **Sub-Tasks**:
  - [x] Version Matrix & Stack Setup
  - [x] Project Scaffolding
  - [x] Foundational UI Custom Components (Button, Input, Label, Card)
  - [x] Supabase Auth Actions & Redirect Interceptor Proxy
  - [x] Onboarding & Login Views
  - [x] Responsive Sidebar Shell Layout
  - [x] Landing Page (Pricing, Features, Hero)
  - [x] Linting, Typecheck, Unit Test, and Production Build verification

---

### 🟡 Phase 1: Supabase Database and Multi-Tenancy
* **Status**: **Pending / Next Up**  
* **Goal**: Define full database schema with foreign key constraints, enable strict tenant Row Level Security (RLS) on all tables, and setup seed scripts.
* **Sub-Tasks**:
  - [ ] Initialize SQL migration for full schema (Customers, Services, Invoices, Receipts, Expenses, Payments, Outstanding, etc.)
  - [ ] Implement robust multi-tenant check policies (`business_id` scoping)
  - [ ] Build database seeding script for quick staging
  - [ ] Verify RLS protection using direct query test cases

---

### ⚪ Phase 2: Customers, Services and Billing
* **Status**: Pending  
* **Goal**: Core invoicing capability, customers CRM lookup, product/services list, and billing state transaction consistency.
* **Sub-Tasks**:
  - [ ] Implement Customer profiles and list views
  - [ ] Implement Services/Items records catalog
  - [ ] Build invoice creation form (calculations with non-floating decimals)
  - [ ] Enforce database transaction atomicity for Invoice + Invoice Items creation

---

### ⚪ Phase 3: Receipts and Outstanding
* **Status**: Pending  
* **Goal**: Money-In accounting ledger, allocating payments to outstanding invoices, and balance calculations.
* **Sub-Tasks**:
  - [ ] Build Receipt form (with allocation logic per unpaid invoice)
  - [ ] Auto-calculate customer outstanding statements
  - [ ] Customer ledger history view

---

### ⚪ Phase 4: Payments, Expenses and Capital Ledger
* **Status**: Pending  
* **Goal**: Money-Out tracking (vendor payments, business expenses) and non-operating/capital loans ledger.
* **Sub-Tasks**:
  - [ ] Implement Vendor payments tracking (work/materials)
  - [ ] Implement Overhead Business Expenses logging
  - [ ] Implement Capital Ledger records (non-operating loan/udhar)

---

### ⚪ Phase 5: Dashboard and Reports
* **Status**: Pending  
* **Goal**: Executive summary dashboard, visual metric trendlines, profit & loss statement, and GST-ready export data.
* **Sub-Tasks**:
  - [ ] Implement Dashboard analytical graphs
  - [ ] Generate Profit & Loss statements
  - [ ] Build GST summaries export (Excel/CSV format)

---

### ⚪ Phase 6: PDF Printing, WhatsApp and UPI QR
* **Status**: Pending  
* **Goal**: Dynamic PDF generation, WhatsApp sharing API integration, and dynamic UPI QR code generator for payments.
* **Sub-Tasks**:
  - [ ] Design PDF print invoice layout
  - [ ] Implement UPI QR generator (with active billing amount and business UPI ID)
  - [ ] Integrate WhatsApp sharing API

---

### ⚪ Phase 8: Production Security, QA and Performance
* **Status**: Pending  
* **Goal**: Penetration testing of RLS, load query pagination, indexing, and vulnerability assessments.
* **Sub-Tasks**:
  - [ ] Conduct multi-tenant security boundary validation
  - [ ] Add database indexes for core fields
  - [ ] Setup cursor pagination on lists

---

### ⚪ Phase 9: Production Deployment
* **Status**: Pending  
* **Goal**: CI/CD integration, environment configurations on Vercel and Supabase production, and live system verify.
* **Sub-Tasks**:
  - [ ] Setup Vercel deployment pipeline
  - [ ] Setup production Supabase db and migrate schemas
  - [ ] Conduct end-to-end live testing

---

### ⚪ Phase 10: SaaS Monetization and Commercial Readiness
* **Status**: Pending  
* **Goal**: Subscription plan gates, Stripe/Razorpay payment page integrations, onboarding trial limits.
* **Sub-Tasks**:
  - [ ] Integrate Razorpay / payment gateway for subscriptions
  - [ ] Enforce trial constraints and role-based feature gating
