import { describe, it, expect } from 'vitest'
import { calculateInvoiceTotals, roundCurrency } from '../lib/validations/invoice'
import { validateCustomer } from '../lib/validations/customer'
import { serviceSchema } from '../lib/validations/service'

describe('Phase 2 — Billing & Invoicing Logic Tests', () => {
  const dummyBusinessId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

  it('calculates unpaid bill totals correctly', () => {
    const res = calculateInvoiceTotals({
      items: [
        { quantity: 2, unit_price: 500, discount_amount: 0 },
        { quantity: 1, unit_price: 250, discount_amount: 50 },
      ],
      discount_percentage: 0,
      discount_amount: 0,
      tax_amount: 0,
      paid_amount_now: 0,
    })

    expect(res.subtotal).toBe(1200) // (2*500) + (1*250 - 50) = 1000 + 200 = 1200
    expect(res.grand_total).toBe(1200)
    expect(res.paid_amount).toBe(0)
    expect(res.balance_due).toBe(1200)
    expect(res.status).toBe('UNPAID')
  })

  it('calculates full payment bill correctly', () => {
    const res = calculateInvoiceTotals({
      items: [{ quantity: 1, unit_price: 1500, discount_amount: 0 }],
      discount_percentage: 10, // 10% discount = 150
      discount_amount: 0,
      tax_amount: 50,
      paid_amount_now: 1400,
    })

    expect(res.subtotal).toBe(1500)
    expect(res.discount_amount).toBe(150)
    expect(res.grand_total).toBe(1400) // 1500 - 150 + 50 = 1400
    expect(res.paid_amount).toBe(1400)
    expect(res.balance_due).toBe(0)
    expect(res.status).toBe('PAID')
  })

  it('calculates partial payment bill correctly', () => {
    const res = calculateInvoiceTotals({
      items: [{ quantity: 3, unit_price: 1000, discount_amount: 0 }],
      paid_amount_now: 1000,
    })

    expect(res.subtotal).toBe(3000)
    expect(res.grand_total).toBe(3000)
    expect(res.paid_amount).toBe(1000)
    expect(res.balance_due).toBe(2000)
    expect(res.status).toBe('PARTIALLY_PAID')
  })

  it('enforces Walk-in customer validation rules per FRD', () => {
    // Walk-in with 0 balance due: name & mobile optional
    const zeroBalanceWalkIn = validateCustomer(
      {
        business_id: dummyBusinessId,
        customer_type: 'WAL_IN',
        name: null,
        mobile: null,
      },
      0
    )
    expect(zeroBalanceWalkIn.success).toBe(true)

    // Walk-in with balance due > 0: name & mobile required
    const unpaidWalkIn = validateCustomer(
      {
        business_id: dummyBusinessId,
        customer_type: 'WAL_IN',
        name: null,
        mobile: null,
      },
      500
    )
    expect(unpaidWalkIn.success).toBe(false)
    expect(unpaidWalkIn.errors?.name).toBeDefined()
    expect(unpaidWalkIn.errors?.mobile).toBeDefined()
  })

  it('validates regular customer requirements', () => {
    const regularWithoutMobile = validateCustomer(
      {
        business_id: dummyBusinessId,
        customer_type: 'REGULAR',
        name: 'Ramesh Patel',
        mobile: '',
      },
      0
    )
    expect(regularWithoutMobile.success).toBe(false)
    expect(regularWithoutMobile.errors?.mobile).toBeDefined()
  })

  it('validates service catalog schema', () => {
    const validService = serviceSchema.safeParse({
      business_id: dummyBusinessId,
      name: 'AC Servicing',
      default_rate: 750,
      pricing_mode: 'FIXED',
      is_active: true,
    })
    expect(validService.success).toBe(true)
  })

  it('prevents negative totals using clean currency rounding', () => {
    const res = calculateInvoiceTotals({
      items: [{ quantity: 1, unit_price: 100 }],
      discount_amount: 200, // discount exceeds total
    })
    expect(res.grand_total).toBe(0)
    expect(res.status).toBe('PAID')
  })
})
