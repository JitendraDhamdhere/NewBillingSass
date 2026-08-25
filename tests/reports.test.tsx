import { describe, it, expect } from 'vitest'
import {
  getCurrentFinancialYear,
  getFYDateRange,
  calculateProfitAndLoss,
} from '../lib/validations/report'

describe('Phase 5 — Dashboard & Reports Engine Tests', () => {
  it('correctly calculates Indian Financial Year date boundaries (1 April to 31 March)', () => {
    // Test date in August 2026 -> FY 2026-27
    const augDate = new Date('2026-08-25')
    const fyAug = getCurrentFinancialYear(augDate)
    expect(fyAug.fyCode).toBe('2026-27')
    expect(fyAug.startDate).toBe('2026-04-01')
    expect(fyAug.endDate).toBe('2027-03-31')

    // Test date in February 2027 -> FY 2026-27
    const febDate = new Date('2027-02-15')
    const fyFeb = getCurrentFinancialYear(febDate)
    expect(fyFeb.fyCode).toBe('2026-27')
    expect(fyFeb.startDate).toBe('2026-04-01')
    expect(fyFeb.endDate).toBe('2027-03-31')

    // Test date in March 2026 -> FY 2025-26
    const marDate = new Date('2026-03-30')
    const fyMar = getCurrentFinancialYear(marDate)
    expect(fyMar.fyCode).toBe('2025-26')
    expect(fyMar.startDate).toBe('2025-04-01')
    expect(fyMar.endDate).toBe('2026-03-31')
  })

  it('correctly returns date range from FY code', () => {
    const range = getFYDateRange('2025-26')
    expect(range.startDate).toBe('2025-04-01')
    expect(range.endDate).toBe('2026-03-31')
  })

  it('calculates Net Operating Profit correctly obeying FRD rules', () => {
    const pnl = calculateProfitAndLoss({
      receiptsTotal: 250000, // Receipts income
      vendorPaymentsTotal: 80000, // Payments for work
      overheadExpensesTotal: 40000, // Overhead expenses (Rent, Salary)
      loanInterestPaidTotal: 5000, // Loan interest
      loanPrincipalReceivedTotal: 100000, // Loan borrowed (EXCLUDED!)
      loanPrincipalRepaidTotal: 20000, // Loan principal paid (EXCLUDED!)
    })

    // Total Operating Income = 250,000
    expect(pnl.total_operating_income).toBe(250000)

    // Total Operating Expenses = 80,000 + 40,000 + 5,000 = 125,000
    expect(pnl.total_operating_expenses).toBe(125000)

    // Net Operating Profit = 250,000 - 125,000 = 125,000
    expect(pnl.net_operating_profit).toBe(125000)

    // Capital Ledger exclusions verification
    expect(pnl.capital_ledger_excluded.loan_principal_received).toBe(100000)
    expect(pnl.capital_ledger_excluded.loan_principal_repaid).toBe(20000)
  })

  it('strictly excludes loan principal received from income and loan principal repaid from expenses', () => {
    const pnl = calculateProfitAndLoss({
      receiptsTotal: 0, // No receipts
      vendorPaymentsTotal: 0,
      overheadExpensesTotal: 0,
      loanInterestPaidTotal: 0,
      loanPrincipalReceivedTotal: 500000, // Received 5 Lakhs loan
      loanPrincipalRepaidTotal: 100000, // Repaid 1 Lakh principal
    })

    expect(pnl.total_operating_income).toBe(0) // NEVER revenue!
    expect(pnl.total_operating_expenses).toBe(0) // NEVER expense!
    expect(pnl.net_operating_profit).toBe(0) // Profit remains 0!
  })
})
