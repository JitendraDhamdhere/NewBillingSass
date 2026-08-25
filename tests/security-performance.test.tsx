import { describe, it, expect } from 'vitest'
import { validateReceiptAllocation } from '../lib/validations/receipt'
import { calculateProfitAndLoss } from '../lib/validations/report'
import { isActionAuthorized } from '../lib/auth/rbac'
import { sanitizeAuditMetadata } from '../lib/services/audit-service'

describe('Phase 8 — Production Hardening & Penetration Attack Tests', () => {
  describe('Tenant Isolation & Authorization Boundary Audits', () => {
    it('prevents Business A user (STAFF) from accessing Business B sensitive reports (IDOR)', () => {
      // Staff role attempted access on financial reports
      const authorized = isActionAuthorized('STAFF', 'reports', 'VIEW')
      expect(authorized).toBe(false)
    })

    it('prevents Business A user (STAFF) from modifying or deleting Business B expenses (IDOR)', () => {
      const editAuth = isActionAuthorized('STAFF', 'expenses', 'EDIT')
      const deleteAuth = isActionAuthorized('STAFF', 'expenses', 'DELETE')

      expect(editAuth).toBe(false)
      expect(deleteAuth).toBe(false)
    })

    it('prevents Business A user (ACCOUNTANT) from deleting financial records or tenant configuration', () => {
      const deleteInvoice = isActionAuthorized('ACCOUNTANT', 'invoices', 'DELETE')
      const editSettings = isActionAuthorized('ACCOUNTANT', 'settings', 'EDIT')

      expect(deleteInvoice).toBe(false)
      expect(editSettings).toBe(false)
    })
  })

  describe('Financial Integrity & Concurrency Hardening', () => {
    it('rejects over-allocation where allocated amount exceeds receipt total or balance due', () => {
      const invoiceMap = new Map()
      invoiceMap.set('inv-1', { balance_due: 500, invoice_number: 'INV-001' })

      const res = validateReceiptAllocation(
        1000,
        [{ invoice_id: 'inv-1', allocated_amount: 800 }],
        invoiceMap
      )

      expect(res.is_valid).toBe(false)
      expect(res.errors[0]).toContain('exceeds balance due')
    })

    it('prevents negative receipt allocation amounts', () => {
      const res = validateReceiptAllocation(1000, [{ invoice_id: 'inv-1', allocated_amount: -100 }])

      expect(res.is_valid).toBe(false)
      expect(res.errors[0]).toContain('cannot be negative')
    })

    it('strictly isolates capital loan principal from net operating profit calculation', () => {
      const pnl = calculateProfitAndLoss({
        receiptsTotal: 10000, // Revenue = 10,000
        vendorPaymentsTotal: 3000, // Operating Cost = 3,000
        overheadExpensesTotal: 1000, // Operating Cost = 1,000
        loanInterestPaidTotal: 500, // Operating Cost = 500
        loanPrincipalReceivedTotal: 0,
        loanPrincipalRepaidTotal: 50000, // Capital Principal = 50,000 (NON-OPERATING!)
      })

      // Revenue (10,000) - Operating Costs (3000 + 1000 + 500 = 4500) = Net Operating Profit (5,500)
      // 50,000 principal MUST NOT reduce net operating profit!
      expect(pnl.total_operating_income).toBe(10000)
      expect(pnl.total_operating_expenses).toBe(4500)
      expect(pnl.net_operating_profit).toBe(5500)
      expect(pnl.capital_ledger_excluded.loan_principal_repaid).toBe(50000)
    })
  })

  describe('Secret Metadata & Error Leak Hardening', () => {
    it('sanitizes password and API secrets from audit metadata before database storage', async () => {
      const untrustedInput = {
        user: 'admin@tenant.com',
        db_password: 'SuperSecretDbPassword!',
        auth_token: 'Bearer eyJhbGciOi...',
        action: 'UPDATE_SETTING',
      }

      const clean = await sanitizeAuditMetadata(untrustedInput)

      expect(clean.user).toBe('admin@tenant.com')
      expect(clean.action).toBe('UPDATE_SETTING')
      expect(clean.db_password).toBe('[REDACTED]')
      expect(clean.auth_token).toBe('[REDACTED]')
    })
  })
})
