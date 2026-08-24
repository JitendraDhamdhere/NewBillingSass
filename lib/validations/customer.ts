import { z } from 'zod'

export const customerTypeSchema = z.enum(['REGULAR', 'WAL_IN'])

export const customerBaseSchema = z.object({
  id: z.string().uuid().optional(),
  business_id: z.string().uuid(),
  name: z.string().trim().nullable().optional(),
  mobile: z.string().trim().nullable().optional(),
  email: z.string().email().nullable().or(z.literal('')).optional(),
  address: z.string().trim().nullable().optional(),
  customer_type: customerTypeSchema.default('REGULAR'),
  possible_duplicate: z.boolean().default(false),
})

export type CustomerInput = z.input<typeof customerBaseSchema>

/**
 * Validates a customer record for creation/updating.
 * Custom business rules applied:
 * - Regular Customer: Requires name and mobile.
 * - Walk-in Customer: Name and mobile are optional if there's no outstanding balance.
 *                      If there's an outstanding balance (balanceDue > 0), name and mobile are required.
 * 
 * @param data Customer input data
 * @param balanceDue The balance due/outstanding amount for their current transaction
 */
export function validateCustomer(data: CustomerInput, balanceDue: number = 0) {
  // First, parse against base schema
  const parsed = customerBaseSchema.parse(data)
  
  const errors: Record<string, string> = {}
  
  if (parsed.customer_type === 'REGULAR') {
    if (!parsed.name || parsed.name.trim() === '') {
      errors.name = 'Name is required for regular customers'
    }
    if (!parsed.mobile || parsed.mobile.trim() === '') {
      errors.mobile = 'Mobile number is required for regular customers'
    }
  } else if (parsed.customer_type === 'WAL_IN') {
    if (balanceDue > 0) {
      if (!parsed.name || parsed.name.trim() === '') {
        errors.name = 'Name is required when there is a balance due'
      }
      if (!parsed.mobile || parsed.mobile.trim() === '') {
        errors.mobile = 'Mobile number is required when there is a balance due'
      }
    }
  }
  
  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
      data: parsed,
    }
  }
  
  return {
    success: true,
    errors: null,
    data: parsed,
  }
}
