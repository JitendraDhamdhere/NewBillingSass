import { z } from 'zod'

export const loanSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  lender_borrower_name: z.string().min(1, 'Lender / Borrower name is required'),
  loan_type: z.enum(['TAKEN', 'GIVEN']).default('TAKEN'),
  principal_amount: z.number().positive('Principal amount must be greater than zero'),
  interest_rate_annual: z.number().min(0, 'Interest rate cannot be negative').default(0),
  start_date: z.string().min(1, 'Start date is required'),
  due_date: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export const loanRepaymentSchema = z.object({
  loan_id: z.string().uuid('Invalid loan ID'),
  business_id: z.string().uuid('Invalid business ID'),
  repayment_date: z.string().min(1, 'Repayment date is required'),
  principal_paid: z.number().min(0, 'Principal paid cannot be negative'),
  interest_paid: z.number().min(0, 'Interest paid cannot be negative'),
  payment_mode: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER']),
  reference_number: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type LoanInput = z.infer<typeof loanSchema>
export type LoanRepaymentInput = z.infer<typeof loanRepaymentSchema>

export interface CapitalAccountingImpact {
  cash_change: number // + (loan taken) or - (repayment)
  liability_change: number // + (loan taken) or - (principal repayment)
  operating_income_impact: number // ALWAYS 0 for loan principal
  operating_expense_impact: number // Interest paid ONLY
  net_profit_impact: number // - interest paid ONLY
}

/**
 * Validates Capital Ledger accounting rules according to FRD & prompt:
 * 1. Loan Received: increases cash position, but DOES NOT affect operating income/profit.
 * 2. Principal Repayment: decreases liability/cash, but DOES NOT affect operating expenses/profit.
 * 3. Interest Payment: treated as operating expense affecting profit.
 */
export function calculateCapitalLedgerAccounting(
  event: 'LOAN_RECEIVED' | 'REPAYMENT',
  loanType: 'TAKEN' | 'GIVEN',
  amount: { principal: number; interest?: number }
): CapitalAccountingImpact {
  const principal = Math.max(0, amount.principal)
  const interest = Math.max(0, amount.interest || 0)

  if (event === 'LOAN_RECEIVED') {
    if (loanType === 'TAKEN') {
      return {
        cash_change: principal, // Cash increases
        liability_change: principal, // Liability increases
        operating_income_impact: 0, // NEVER operating income!
        operating_expense_impact: 0,
        net_profit_impact: 0,
      }
    } else {
      // Loan GIVEN
      return {
        cash_change: -principal, // Cash decreases
        liability_change: -principal, // Asset increases
        operating_income_impact: 0,
        operating_expense_impact: 0,
        net_profit_impact: 0,
      }
    }
  } else {
    // REPAYMENT
    if (loanType === 'TAKEN') {
      const totalCashOut = principal + interest
      return {
        cash_change: -totalCashOut, // Cash decreases
        liability_change: -principal, // Liability decreases
        operating_income_impact: 0,
        operating_expense_impact: interest, // ONLY interest is expense!
        net_profit_impact: interest === 0 ? 0 : -interest, // ONLY interest reduces profit!
      }
    } else {
      // Repayment received for loan GIVEN
      const totalCashIn = principal + interest
      return {
        cash_change: totalCashIn,
        liability_change: -principal,
        operating_income_impact: interest, // Interest earned is income
        operating_expense_impact: 0,
        net_profit_impact: interest,
      }
    }
  }
}
