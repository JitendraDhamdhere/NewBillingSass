import { describe, it, expect } from 'vitest'
import { validateReceiptAllocation, receiptSchema } from '../lib/validations/receipt'

describe('Phase 3 — Receipts & Outstanding Allocation Tests', () => {
  const dummyBusinessId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  const dummyCustomerId = 'b1ffbc99-9c0b-4ef8-bb6d-6bb9bd380a22'
  const inv1 = 'c2ffbc99-9c0b-4ef8-bb6d-6bb9bd380a33'
  const inv2 = 'd3ffbc99-9c0b-4ef8-bb6d-6bb9bd380a44'

  const mockInvoiceMap = new Map([
    [inv1, { balance_due: 1000, invoice_number: 'INV-001' }],
    [inv2, { balance_due: 500, invoice_number: 'INV-002' }],
  ])

  it('handles one receipt -> one bill full allocation', () => {
    const res = validateReceiptAllocation(
      1000,
      [{ invoice_id: inv1, allocated_amount: 1000 }],
      mockInvoiceMap
    )

    expect(res.is_valid).toBe(true)
    expect(res.payment_amount).toBe(1000)
    expect(res.allocated_total).toBe(1000)
    expect(res.unallocated_amount).toBe(0)
    expect(res.errors.length).toBe(0)
  })

  it('handles one receipt -> multiple bills allocation', () => {
    const res = validateReceiptAllocation(
      1500,
      [
        { invoice_id: inv1, allocated_amount: 1000 },
        { invoice_id: inv2, allocated_amount: 500 },
      ],
      mockInvoiceMap
    )

    expect(res.is_valid).toBe(true)
    expect(res.payment_amount).toBe(1500)
    expect(res.allocated_total).toBe(1500)
    expect(res.unallocated_amount).toBe(0)
  })

  it('handles partial allocation correctly', () => {
    const res = validateReceiptAllocation(
      1000,
      [{ invoice_id: inv1, allocated_amount: 400 }],
      mockInvoiceMap
    )

    expect(res.is_valid).toBe(true)
    expect(res.payment_amount).toBe(1000)
    expect(res.allocated_total).toBe(400)
    expect(res.unallocated_amount).toBe(600) // Customer advance
  })

  it('calculates overpayment as unallocated customer advance', () => {
    const res = validateReceiptAllocation(
      2000,
      [
        { invoice_id: inv1, allocated_amount: 1000 },
        { invoice_id: inv2, allocated_amount: 500 },
      ],
      mockInvoiceMap
    )

    expect(res.is_valid).toBe(true)
    expect(res.payment_amount).toBe(2000)
    expect(res.allocated_total).toBe(1500)
    expect(res.unallocated_amount).toBe(500) // Excess payment stored as credit balance
  })

  it('rejects allocation exceeding invoice balance due', () => {
    const res = validateReceiptAllocation(
      1500,
      [{ invoice_id: inv1, allocated_amount: 1200 }], // Balance due is 1000
      mockInvoiceMap
    )

    expect(res.is_valid).toBe(false)
    expect(res.errors[0]).toContain('exceeds balance due')
  })

  it('rejects total allocation exceeding payment amount', () => {
    const res = validateReceiptAllocation(
      500, // Payment is only 500
      [{ invoice_id: inv1, allocated_amount: 1000 }],
      mockInvoiceMap
    )

    expect(res.is_valid).toBe(false)
    expect(res.errors[0]).toContain('cannot exceed payment amount')
  })

  it('validates standalone income receipt schema', () => {
    const standalone = receiptSchema.safeParse({
      business_id: dummyBusinessId,
      category: 'STANDALONE_INCOME',
      description: 'Scrap sales',
      receipt_date: '2026-08-25',
      amount: 450,
      payment_mode: 'CASH',
    })

    expect(standalone.success).toBe(true)
  })

  it('validates customer payment receipt schema with allocations', () => {
    const customerPayment = receiptSchema.safeParse({
      business_id: dummyBusinessId,
      customer_id: dummyCustomerId,
      category: 'CUSTOMER_PAYMENT',
      receipt_date: '2026-08-25',
      amount: 1000,
      payment_mode: 'UPI',
      allocations: [{ invoice_id: inv1, allocated_amount: 1000 }],
    })

    expect(customerPayment.success).toBe(true)
  })
})
