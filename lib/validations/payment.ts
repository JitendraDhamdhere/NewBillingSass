import { z } from 'zod'

export const paymentSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  paid_to: z.string().min(1, 'Paid to / Vendor name is required'),
  mobile: z.string().nullable().optional(),
  work_purpose: z.string().min(1, 'Work or purpose description is required'),
  invoice_id: z.string().uuid('Invalid invoice ID').nullable().optional(),
  amount: z.number().positive('Payment amount must be greater than zero'),
  payment_date: z.string().min(1, 'Payment date is required'),
  payment_mode: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER']),
  attachment_url: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type PaymentInput = z.infer<typeof paymentSchema>

/**
 * Calculates Job Profitability / Contribution for a customer invoice:
 * Bill Grand Total - Linked Vendor Payments = Job Contribution / Profit before Overhead
 */
export function calculateJobProfitability(
  invoiceGrandTotal: number,
  linkedVendorPaymentsTotal: number
) {
  const profit = Math.max(0, invoiceGrandTotal) - Math.max(0, linkedVendorPaymentsTotal)
  const marginPercentage = invoiceGrandTotal > 0 ? (profit / invoiceGrandTotal) * 100 : 0

  return {
    bill_total: invoiceGrandTotal,
    vendor_payments_total: linkedVendorPaymentsTotal,
    job_profit: Number(profit.toFixed(2)),
    margin_percentage: Number(marginPercentage.toFixed(2)),
  }
}
