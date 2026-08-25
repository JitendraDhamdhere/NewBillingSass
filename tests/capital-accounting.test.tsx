import { describe, it, expect } from 'vitest'
import { calculateCapitalLedgerAccounting, loanSchema, loanRepaymentSchema } from '../lib/validations/loan'
import { calculateJobProfitability, paymentSchema } from '../lib/validations/payment'
import { expenseSchema } from '../lib/validations/expense'

describe('Phase 4 — Payments, Expenses & Capital Ledger Accounting Tests', () => {
  const dummyBusinessId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  const dummyLoanId = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22'

  it('Loan received increases cash and liability BUT has ZERO impact on operating income or profit', () => {
    const impact = calculateCapitalLedgerAccounting('LOAN_RECEIVED', 'TAKEN', {
      principal: 100000,
    })

    expect(impact.cash_change).toBe(100000)
    expect(impact.liability_change).toBe(100000)
    expect(impact.operating_income_impact).toBe(0) // NEVER revenue!
    expect(impact.operating_expense_impact).toBe(0)
    expect(impact.net_profit_impact).toBe(0) // Profit remains unchanged!
  })

  it('Loan principal repayment decreases cash and liability BUT has ZERO impact on operating expenses or profit', () => {
    const impact = calculateCapitalLedgerAccounting('REPAYMENT', 'TAKEN', {
      principal: 20000,
      interest: 0,
    })

    expect(impact.cash_change).toBe(-20000)
    expect(impact.liability_change).toBe(-20000)
    expect(impact.operating_expense_impact).toBe(0) // NEVER an expense!
    expect(impact.net_profit_impact).toBe(0)
  })

  it('Loan interest payment IS treated as an operating expense reducing net profit', () => {
    const impact = calculateCapitalLedgerAccounting('REPAYMENT', 'TAKEN', {
      principal: 10000,
      interest: 1200,
    })

    expect(impact.cash_change).toBe(-11200) // Total cash paid out
    expect(impact.liability_change).toBe(-10000) // Only principal reduces liability
    expect(impact.operating_expense_impact).toBe(1200) // Interest IS operating expense
    expect(impact.net_profit_impact).toBe(-1200) // Interest reduces profit by 1200
  })

  it('calculates job profitability contribution correctly (Bill - Linked Vendor Payments)', () => {
    const res = calculateJobProfitability(15000, 6000) // Customer bill ₹15,000, vendor labor/materials ₹6,000

    expect(res.bill_total).toBe(15000)
    expect(res.vendor_payments_total).toBe(6000)
    expect(res.job_profit).toBe(9000)
    expect(res.margin_percentage).toBe(60) // 9000 / 15000 * 100 = 60%
  })

  it('validates vendor payment schema', () => {
    const validPayment = paymentSchema.safeParse({
      business_id: dummyBusinessId,
      paid_to: 'Ramesh Carpenter',
      work_purpose: 'Subcontractor furniture assembly',
      amount: 4500,
      payment_date: '2026-08-25',
      payment_mode: 'UPI',
    })

    expect(validPayment.success).toBe(true)
  })

  it('validates overhead expense schema with custom category', () => {
    const validExpense = expenseSchema.safeParse({
      business_id: dummyBusinessId,
      category: 'Software/Subscriptions',
      description: 'Monthly Cloud Hosting Bill',
      amount: 1200,
      expense_date: '2026-08-25',
      payment_mode: 'CARD',
    })

    expect(validExpense.success).toBe(true)
  })

  it('validates loan schema and loan repayment schema', () => {
    const validLoan = loanSchema.safeParse({
      business_id: dummyBusinessId,
      lender_borrower_name: 'HDFC Business Loan',
      loan_type: 'TAKEN',
      principal_amount: 500000,
      interest_rate_annual: 10.5,
      start_date: '2026-08-25',
    })
    expect(validLoan.success).toBe(true)

    const validRepayment = loanRepaymentSchema.safeParse({
      loan_id: dummyLoanId,
      business_id: dummyBusinessId,
      repayment_date: '2026-08-25',
      principal_paid: 15000,
      interest_paid: 2500,
      payment_mode: 'BANK_TRANSFER',
    })
    expect(validRepayment.success).toBe(true)
  })
})
