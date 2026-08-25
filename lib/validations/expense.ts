import { z } from 'zod'

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Rent',
  'Electricity',
  'Internet',
  'Salary',
  'Travel',
  'Marketing',
  'Software/Subscriptions',
  'Maintenance',
  'Office Supplies',
  'Other',
] as const

export const expenseSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().positive('Expense amount must be greater than zero'),
  expense_date: z.string().min(1, 'Expense date is required'),
  payment_mode: z.enum(['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE', 'CARD', 'OTHER']),
  payee_vendor: z.string().nullable().optional(),
  attachment_url: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type ExpenseInput = z.infer<typeof expenseSchema>
