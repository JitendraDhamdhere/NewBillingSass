import QRCode from 'qrcode'

export interface UpiPaymentParams {
  vpa: string // Business UPI ID (e.g. shop@upi)
  payeeName: string // Business Name
  amount: number // Current Balance Due Amount
  refNumber?: string // Invoice Number or Ref
  note?: string // Payment note (e.g., "Payment for Invoice INV-001")
}

/**
 * Builds standard NPCI UPI URI scheme string:
 * upi://pay?pa=VPA&pn=NAME&am=AMOUNT&tr=REF&tn=NOTE&cu=INR
 */
export function buildUpiPaymentUri(params: UpiPaymentParams): string {
  const { vpa, payeeName, amount, refNumber = '', note = '' } = params

  if (!vpa || vpa.trim() === '') {
    return ''
  }

  const cleanAmount = Math.max(0, amount).toFixed(2)
  const encodedPn = encodeURIComponent(payeeName.trim())
  const encodedNote = encodeURIComponent(note.trim())
  const encodedRef = encodeURIComponent(refNumber.trim())

  let uri = `upi://pay?pa=${vpa.trim()}&pn=${encodedPn}&am=${cleanAmount}&cu=INR`

  if (encodedRef) {
    uri += `&tr=${encodedRef}`
  }

  if (encodedNote) {
    uri += `&tn=${encodedNote}`
  }

  return uri
}

/**
 * Generates QR Code Data URL from UPI URI string
 */
export async function generateUpiQrDataUrl(upiUri: string): Promise<string> {
  if (!upiUri) return ''

  try {
    return await QRCode.toDataURL(upiUri, {
      margin: 1,
      width: 250,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
  } catch (err) {
    console.error('Failed to generate UPI QR Data URL:', err)
    return ''
  }
}
