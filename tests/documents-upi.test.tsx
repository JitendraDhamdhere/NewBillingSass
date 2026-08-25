import { describe, it, expect } from 'vitest'
import { buildUpiPaymentUri, generateUpiQrDataUrl } from '../lib/validations/upi'
import { renderWhatsAppTemplate, buildWhatsAppShareUrl, DEFAULT_WHATSAPP_TEMPLATES } from '../lib/validations/whatsapp'

describe('Phase 6 — Dynamic UPI QR & WhatsApp Templating Tests', () => {
  it('generates valid NPCI spec UPI payment URI scheme with exact balance due', () => {
    const uri = buildUpiPaymentUri({
      vpa: 'store@upi',
      payeeName: 'Super Store',
      amount: 1550.5,
      refNumber: 'INV-2026-001',
      note: 'Invoice INV-2026-001',
    })

    expect(uri).toContain('upi://pay?')
    expect(uri).toContain('pa=store@upi')
    expect(uri).toContain('pn=Super%20Store')
    expect(uri).toContain('am=1550.50')
    expect(uri).toContain('cu=INR')
    expect(uri).toContain('tr=INV-2026-001')
  })

  it('updates UPI payment URI dynamically when partial payment is recorded', () => {
    const totalAmount = 5000
    let paidAmount = 0
    let balanceDue = totalAmount - paidAmount

    // Initial Full Bill
    const uri1 = buildUpiPaymentUri({
      vpa: 'biz@upi',
      payeeName: 'Biz Name',
      amount: balanceDue,
    })
    expect(uri1).toContain('am=5000.00')

    // Partial payment of ₹2000 recorded
    paidAmount = 2000
    balanceDue = totalAmount - paidAmount
    const uri2 = buildUpiPaymentUri({
      vpa: 'biz@upi',
      payeeName: 'Biz Name',
      amount: balanceDue,
    })
    expect(uri2).toContain('am=3000.00') // QR dynamically encodes updated lower balance due!
  })

  it('generates Data URL for QR code SVG/PNG', async () => {
    const uri = buildUpiPaymentUri({
      vpa: 'test@upi',
      payeeName: 'Test Biz',
      amount: 500,
    })
    const dataUrl = await generateUpiQrDataUrl(uri)
    expect(dataUrl).toContain('data:image/png;base64,')
  })

  it('replaces WhatsApp template placeholders accurately', () => {
    const rendered = renderWhatsAppTemplate(DEFAULT_WHATSAPP_TEMPLATES.invoice, {
      customer_name: 'Rahul Sharma',
      invoice_number: 'INV-042',
      amount: 12000,
      due_amount: 4000,
      due_date: '2026-09-01',
      business_name: 'Apex Traders',
      upi_id: 'apex@upi',
    })

    expect(rendered).toContain('Rahul Sharma')
    expect(rendered).toContain('INV-042')
    expect(rendered).toContain('Apex Traders')
    expect(rendered).toContain('₹12000.00')
    expect(rendered).toContain('₹4000.00')
    expect(rendered).toContain('apex@upi')
  })

  it('builds valid WhatsApp share URL with mobile phone formatting', () => {
    const shareUrl = buildWhatsAppShareUrl('9876543210', 'Hello Customer')
    expect(shareUrl).toBe('https://wa.me/919876543210?text=Hello%20Customer')

    const emptyPhoneUrl = buildWhatsAppShareUrl('', 'General Share')
    expect(emptyPhoneUrl).toBe('https://wa.me/?text=General%20Share')
  })
})
