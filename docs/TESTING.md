# Quality Assurance & Testing Suite Documentation

## Test Suite Execution
Run tests locally using Vitest:
```bash
npm run test
```

Run TypeScript strict build typecheck:
```bash
npm run typecheck
```

Run production Next.js build verification:
```bash
npm run build
```

## Test Files Coverage
1. `tests/home.test.tsx`: Landing page & public UI smoke testing.
2. `tests/tenant.test.tsx`: Multi-tenant isolation & membership RLS logic.
3. `tests/invoice.test.tsx`: Invoice creation, non-floating decimal accuracy, FY sequence numbering, edit lock rule.
4. `tests/receipt.test.tsx`: Manual allocation, Customer Advance overpayments, Outstanding balance calculations.
5. `tests/capital-accounting.test.tsx`: Capital loans principal vs interest split, Job profitability calculation.
6. `tests/reports.test.tsx`: Indian FY (1 April - 31 March) engine, Net Operating Profit calculation.
7. `tests/documents-upi.test.tsx`: NPCI UPI payment URI scheme, dynamic QR balance updates, WhatsApp message templating.
8. `tests/rbac-audit.test.tsx`: Role-Based Access Control matrix, server-side authorization evaluation, secret metadata sanitization.
9. `tests/security-performance.test.tsx`: Penetration attack tests (IDOR, negative allocations, over-allocations, capital isolation).
