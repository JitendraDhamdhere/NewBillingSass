import { describe, it, expect } from 'vitest'
import { isActionAuthorized, getDefaultRolePermissions } from '../lib/auth/rbac'
import { sanitizeAuditMetadata } from '../lib/services/audit-service'

describe('Phase 7 — RBAC, Configurable Permissions & Audit Log Tests', () => {
  it('OWNER role has full access to ALL resources for ALL actions', () => {
    expect(isActionAuthorized('OWNER', 'invoices', 'DELETE')).toBe(true)
    expect(isActionAuthorized('OWNER', 'settings', 'EDIT')).toBe(true)
    expect(isActionAuthorized('OWNER', 'team', 'CREATE')).toBe(true)
    expect(isActionAuthorized('OWNER', 'reports', 'EXPORT')).toBe(true)
  })

  it('ACCOUNTANT role has financial view/create/edit access BUT is restricted from deleting records or managing settings', () => {
    expect(isActionAuthorized('ACCOUNTANT', 'invoices', 'VIEW')).toBe(true)
    expect(isActionAuthorized('ACCOUNTANT', 'invoices', 'CREATE')).toBe(true)
    expect(isActionAuthorized('ACCOUNTANT', 'invoices', 'DELETE')).toBe(false) // Cannot delete history

    expect(isActionAuthorized('ACCOUNTANT', 'reports', 'VIEW')).toBe(true)
    expect(isActionAuthorized('ACCOUNTANT', 'reports', 'EXPORT')).toBe(true)

    expect(isActionAuthorized('ACCOUNTANT', 'settings', 'EDIT')).toBe(false) // Restricted from changing settings
    expect(isActionAuthorized('ACCOUNTANT', 'team', 'CREATE')).toBe(false) // Restricted from managing team
  })

  it('STAFF role has operational billing access BUT is strictly forbidden from P&L reports, capital loans, editing, or deleting', () => {
    // Staff billing access
    expect(isActionAuthorized('STAFF', 'invoices', 'VIEW')).toBe(true)
    expect(isActionAuthorized('STAFF', 'invoices', 'CREATE')).toBe(true)
    expect(isActionAuthorized('STAFF', 'invoices', 'PRINT')).toBe(true)
    expect(isActionAuthorized('STAFF', 'invoices', 'WHATSAPP')).toBe(true)

    // Staff forbidden operations
    expect(isActionAuthorized('STAFF', 'invoices', 'EDIT')).toBe(false)
    expect(isActionAuthorized('STAFF', 'invoices', 'DELETE')).toBe(false)

    // Staff strictly forbidden from financial reports & capital ledger!
    expect(isActionAuthorized('STAFF', 'reports', 'VIEW')).toBe(false)
    expect(isActionAuthorized('STAFF', 'loans', 'VIEW')).toBe(false)
    expect(isActionAuthorized('STAFF', 'settings', 'VIEW')).toBe(false)
    expect(isActionAuthorized('STAFF', 'team', 'VIEW')).toBe(false)
  })

  it('evaluates custom override permissions correctly', () => {
    // Custom grant for STAFF to view reports
    const customPerm = { can_view: true }
    const authorized = isActionAuthorized('STAFF', 'reports', 'VIEW', customPerm)
    expect(authorized).toBe(true)

    // Custom revoke for ACCOUNTANT to export reports
    const customRevoke = { can_export: false }
    const forbidden = isActionAuthorized('ACCOUNTANT', 'reports', 'EXPORT', customRevoke)
    expect(forbidden).toBe(false)
  })

  it('sanitizes audit log metadata by redacting secret credentials', async () => {
    const rawMetadata = {
      customer_name: 'Rahul Sharma',
      invoice_number: 'INV-100',
      password: 'SecretPassword123!',
      auth_token: 'Bearer xyz.abc.123',
      upi_pin: '9876',
    }

    const clean = await sanitizeAuditMetadata(rawMetadata)

    expect(clean.customer_name).toBe('Rahul Sharma')
    expect(clean.invoice_number).toBe('INV-100')
    expect(clean.password).toBe('[REDACTED]')
    expect(clean.auth_token).toBe('[REDACTED]')
    expect(clean.upi_pin).toBe('[REDACTED]')
  })
})
