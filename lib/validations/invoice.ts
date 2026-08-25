import { z } from 'zod'

export const invoiceItemSchema = z.object({
  id: z.string().uuid().optional(),
  service_id: z.string().uuid().nullable().optional(),
  description: z.string().min(1, 'Item description is required').trim(),
  quantity: z.number().positive('Quantity must be greater than 0'),
  unit_price: z.number().min(0, 'Unit price must be non-negative'),
  discount_amount: z.number().min(0).default(0),
})

export type InvoiceItemInput = z.infer<typeof invoiceItemSchema>

export const invoiceSchema = z.object({
  business_id: z.string().uuid(),
  customer_id: z.string().uuid().nullable().optional(),
  customer_name: z.string().trim().nullable().optional(),
  customer_mobile: z.string().trim().nullable().optional(),
  is_walk_in: z.boolean().default(false),
  invoice_date: z.string().min(1, 'Invoice date is required'),
  due_date: z.string().nullable().optional(),
  numbering_mode: z.enum(['CONTINUOUS', 'FY_WISE']).default('FY_WISE'),
  items: z.array(invoiceItemSchema).min(1, 'At least one line item is required'),
  discount_percentage: z.number().min(0).max(100).default(0),
  discount_amount: z.number().min(0).default(0),
  tax_amount: z.number().min(0).default(0),
  paid_amount_now: z.number().min(0).default(0),
  payment_mode: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER']).default('CASH'),
  notes: z.string().trim().nullable().optional(),
  terms: z.string().trim().nullable().optional(),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>

/**
 * Clean financial rounding to 2 decimal places to prevent JS floating-point inaccuracies
 */
export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

/**
 * Calculates item totals, subtotal, discount, grand total, balance due and status deterministically.
 */
export function calculateInvoiceTotals<T extends { quantity: number; unit_price: number; discount_amount?: number }>(params: {
  items: T[]
  discount_percentage?: number
  discount_amount?: number
  tax_amount?: number
  paid_amount_now?: number
  due_date?: string | null
}) {
  let subtotal = 0
  const processedItems = params.items.map((item) => {
    const qty = Number(item.quantity) || 0
    const price = Number(item.unit_price) || 0
    const disc = Number(item.discount_amount) || 0
    const lineAmount = Math.max(0, roundCurrency(qty * price - disc))
    subtotal += lineAmount
    return {
      ...item,
      amount: lineAmount,
    }
  })

  subtotal = roundCurrency(subtotal)

  let discountAmt = Number(params.discount_amount) || 0
  const discountPct = Number(params.discount_percentage) || 0

  if (discountPct > 0) {
    discountAmt = roundCurrency((subtotal * discountPct) / 100)
  }

  discountAmt = Math.min(subtotal, roundCurrency(discountAmt))
  const taxAmt = roundCurrency(Number(params.tax_amount) || 0)
  const grandTotal = Math.max(0, roundCurrency(subtotal - discountAmt + taxAmt))
  const paidNow = Math.min(grandTotal, Math.max(0, roundCurrency(Number(params.paid_amount_now) || 0)))
  const balanceDue = Math.max(0, roundCurrency(grandTotal - paidNow))

  let status: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' | 'OVERDUE' = 'UNPAID'
  if (grandTotal === 0 || paidNow >= grandTotal) {
    status = 'PAID'
  } else if (paidNow > 0) {
    status = 'PARTIALLY_PAID'
  } else {
    status = 'UNPAID'
    if (params.due_date && new Date(params.due_date) < new Date(new Date().setHours(0, 0, 0, 0))) {
      status = 'OVERDUE'
    }
  }

  return {
    items: processedItems,
    subtotal,
    discount_percentage: discountPct,
    discount_amount: discountAmt,
    tax_amount: taxAmt,
    grand_total: grandTotal,
    paid_amount: paidNow,
    balance_due: balanceDue,
    status,
  }
}
