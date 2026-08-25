import { z } from 'zod'
import { roundCurrency } from './invoice'

export const receiptAllocationSchema = z.object({
  invoice_id: z.string().uuid('Invalid invoice ID'),
  allocated_amount: z.number().min(0, 'Allocation amount cannot be negative'),
})

export const receiptSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  customer_id: z.string().uuid('Invalid customer ID').nullable().optional(),
  category: z.string().default('CUSTOMER_PAYMENT'),
  description: z.string().nullable().optional(),
  receipt_date: z.string().min(1, 'Receipt date is required'),
  amount: z.number().positive('Receipt amount must be greater than zero'),
  payment_mode: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER']),
  reference_number: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  allocations: z.array(receiptAllocationSchema).optional().default([]),
})

export type ReceiptInput = z.infer<typeof receiptSchema>
export type ReceiptAllocationInput = z.infer<typeof receiptAllocationSchema>

export interface ReceiptCalculationResult {
  payment_amount: number
  allocated_total: number
  unallocated_amount: number // Excess payment stored as Customer Advance / Credit Balance
  is_valid: boolean
  errors: string[]
}

/**
 * Validates receipt allocation rules according to FRD:
 * 1. Total allocated <= payment amount.
 * 2. Each allocation amount <= invoice balance due.
 * 3. Remaining unallocated amount calculated.
 */
export function validateReceiptAllocation(
  paymentAmount: number,
  allocations: Array<{ invoice_id: string; allocated_amount: number }>,
  invoiceMap?: Map<string, { balance_due: number; invoice_number: string }>
): ReceiptCalculationResult {
  const roundedPayment = roundCurrency(paymentAmount)
  const errors: string[] = []

  if (roundedPayment <= 0) {
    errors.push('Payment amount must be greater than zero')
  }

  let allocatedTotal = 0

  for (const alloc of allocations) {
    const roundedAlloc = roundCurrency(alloc.allocated_amount)
    if (roundedAlloc < 0) {
      errors.push(`Allocation amount for invoice cannot be negative`)
      continue
    }

    if (invoiceMap && invoiceMap.has(alloc.invoice_id)) {
      const inv = invoiceMap.get(alloc.invoice_id)!
      if (roundedAlloc > roundCurrency(inv.balance_due)) {
        errors.push(
          `Allocation ₹${roundedAlloc.toFixed(2)} exceeds balance due ₹${inv.balance_due.toFixed(
            2
          )} for invoice ${inv.invoice_number}`
        )
      }
    }

    allocatedTotal = roundCurrency(allocatedTotal + roundedAlloc)
  }

  if (allocatedTotal > roundedPayment) {
    errors.push(
      `Total allocated amount (₹${allocatedTotal.toFixed(2)}) cannot exceed payment amount (₹${roundedPayment.toFixed(
        2
      )})`
    )
  }

  const unallocatedAmount = roundCurrency(roundedPayment - allocatedTotal)

  return {
    payment_amount: roundedPayment,
    allocated_total: allocatedTotal,
    unallocated_amount: Math.max(0, unallocatedAmount),
    is_valid: errors.length === 0,
    errors,
  }
}
