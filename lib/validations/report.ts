import { z } from 'zod'

/**
 * Calculates Indian Financial Year (1st April to 31st March)
 * e.g., Date 2026-08-25 -> FY "2026-27" (2026-04-01 to 2027-03-31)
 * e.g., Date 2027-02-10 -> FY "2026-27" (2026-04-01 to 2027-03-31)
 */
export function getCurrentFinancialYear(dateInput: Date = new Date()): {
  fyCode: string
  startDate: string
  endDate: string
} {
  const year = dateInput.getFullYear()
  const month = dateInput.getMonth() + 1 // 1-indexed (1 = Jan, 4 = Apr)

  let startYear: number
  let endYear: number

  if (month >= 4) {
    // April to December
    startYear = year
    endYear = year + 1
  } else {
    // January to March
    startYear = year - 1
    endYear = year
  }

  const fyCode = `${startYear}-${String(endYear).slice(-2)}`
  const startDate = `${startYear}-04-01`
  const endDate = `${endYear}-03-31`

  return { fyCode, startDate, endDate }
}

export function getFYDateRange(fyCode: string): { startDate: string; endDate: string } {
  const parts = fyCode.split('-')
  if (parts.length !== 2) {
    return getCurrentFinancialYear()
  }

  const startYear = parseInt(parts[0], 10)
  if (isNaN(startYear)) {
    return getCurrentFinancialYear()
  }

  const endYear = startYear + 1
  return {
    startDate: `${startYear}-04-01`,
    endDate: `${endYear}-03-31`,
  }
}

export const reportQuerySchema = z.object({
  business_id: z.string().uuid(),
  preset: z.enum(['TODAY', 'WEEK', 'MONTH', 'YEAR', 'FY_CURRENT', 'FY_PREVIOUS', 'CUSTOM']).default('MONTH'),
  fyCode: z.string().optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
})

export type ReportQueryInput = z.infer<typeof reportQuerySchema>

export interface ProfitAndLossSummary {
  period: { fromDate: string; toDate: string; fyCode?: string }
  income: {
    receipts_total: number
    standalone_income_total: number
    total_operating_income: number
  }
  expenses: {
    vendor_payments_total: number
    overhead_expenses_total: number
    loan_interest_paid_total: number
    total_operating_expenses: number
  }
  net_operating_profit: number
  capital_ledger_excluded: {
    loan_principal_received: number
    loan_principal_repaid: number
  }
}

/**
 * Profit & Loss Calculation conforming to FRD:
 * Revenue = Receipts (Customer + Standalone Income)
 * Operating Expenses = Vendor Payments + Overhead Expenses + Loan Interest Paid
 * Net Profit = Revenue - Operating Expenses
 * EXCLUDES Loan Principal received/repaid!
 */
export function calculateProfitAndLoss(data: {
  receiptsTotal: number
  vendorPaymentsTotal: number
  overheadExpensesTotal: number
  loanInterestPaidTotal: number
  loanPrincipalReceivedTotal: number
  loanPrincipalRepaidTotal: number
}): ProfitAndLossSummary['income'] & ProfitAndLossSummary['expenses'] & {
  net_operating_profit: number
  capital_ledger_excluded: ProfitAndLossSummary['capital_ledger_excluded']
} {
  const receipts_total = Math.max(0, data.receiptsTotal)
  const total_operating_income = receipts_total

  const vendor_payments_total = Math.max(0, data.vendorPaymentsTotal)
  const overhead_expenses_total = Math.max(0, data.overheadExpensesTotal)
  const loan_interest_paid_total = Math.max(0, data.loanInterestPaidTotal)

  const total_operating_expenses = vendor_payments_total + overhead_expenses_total + loan_interest_paid_total
  const net_operating_profit = total_operating_income - total_operating_expenses

  return {
    receipts_total,
    standalone_income_total: 0,
    total_operating_income,
    vendor_payments_total,
    overhead_expenses_total,
    loan_interest_paid_total,
    total_operating_expenses,
    net_operating_profit,
    capital_ledger_excluded: {
      loan_principal_received: Math.max(0, data.loanPrincipalReceivedTotal),
      loan_principal_repaid: Math.max(0, data.loanPrincipalRepaidTotal),
    },
  }
}
