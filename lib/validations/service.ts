import { z } from 'zod'

export const pricingModeSchema = z.enum(['FIXED', 'CUSTOM', 'HOURLY', 'QUANTITY_BASED'])

export const serviceSchema = z.object({
  id: z.string().uuid().optional(),
  business_id: z.string().uuid(),
  name: z.string().min(1, 'Service/item name is required').trim(),
  default_rate: z.number().min(0, 'Default rate must be non-negative'),
  category: z.string().trim().nullable().optional(),
  pricing_mode: pricingModeSchema.default('FIXED'),
  is_active: z.boolean().default(true),
})

export type ServiceInput = z.infer<typeof serviceSchema>
