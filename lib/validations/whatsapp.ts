export interface WhatsAppTemplateVars {
  customer_name?: string
  invoice_number?: string
  receipt_number?: string
  amount?: string | number
  due_amount?: string | number
  due_date?: string
  business_name?: string
  upi_id?: string
  total_billed?: string | number
  total_paid?: string | number
  net_balance?: string | number
  receipt_date?: string
}

export const DEFAULT_WHATSAPP_TEMPLATES = {
  invoice:
    'Hello {customer_name},\n\nHere is your invoice *{invoice_number}* from *{business_name}* for *₹{amount}*.\nBalance Due: *₹{due_amount}* (Due Date: {due_date}).\n\nPay via UPI to: {upi_id}\nThank you for your business!',
  receipt:
    'Hello {customer_name},\n\nPayment received! Receipt *{receipt_number}* from *{business_name}* for *₹{amount}* recorded on {receipt_date}.\nThank you!',
  reminder:
    'Dear {customer_name},\n\nThis is a friendly payment reminder from *{business_name}*.\nYou have an outstanding payment of *₹{due_amount}* for Invoice *{invoice_number}*.\n\nPlease pay via UPI to: {upi_id}\nThank you!',
  statement:
    'Hello {customer_name},\n\nHere is your account statement from *{business_name}*.\nTotal Billed: ₹{total_billed}\nTotal Paid: ₹{total_paid}\nNet Balance Due: *₹{net_balance}*\n\nThank you!',
}

/**
 * Replaces placeholders like {customer_name} in template string with actual values.
 */
export function renderWhatsAppTemplate(template: string, vars: WhatsAppTemplateVars): string {
  let result = template

  const map: Record<string, string> = {
    customer_name: vars.customer_name || 'Valued Customer',
    invoice_number: vars.invoice_number || '',
    receipt_number: vars.receipt_number || '',
    amount: vars.amount !== undefined ? Number(vars.amount).toFixed(2) : '0.00',
    due_amount: vars.due_amount !== undefined ? Number(vars.due_amount).toFixed(2) : '0.00',
    due_date: vars.due_date || 'On Receipt',
    business_name: vars.business_name || 'Business',
    upi_id: vars.upi_id || 'Contact Business',
    total_billed: vars.total_billed !== undefined ? Number(vars.total_billed).toFixed(2) : '0.00',
    total_paid: vars.total_paid !== undefined ? Number(vars.total_paid).toFixed(2) : '0.00',
    net_balance: vars.net_balance !== undefined ? Number(vars.net_balance).toFixed(2) : '0.00',
    receipt_date: vars.receipt_date || new Date().toISOString().split('T')[0],
  }

  Object.entries(map).forEach(([key, val]) => {
    const regex = new RegExp(`\\{${key}\\}`, 'g')
    result = result.replace(regex, val)
  })

  return result
}

/**
 * Generates WhatsApp web / deep link
 */
export function buildWhatsAppShareUrl(mobile: string | null | undefined, message: string): string {
  const cleanMessage = encodeURIComponent(message)

  if (mobile && mobile.trim() !== '') {
    const digitsOnly = mobile.replace(/[^0-9]/g, '')
    // Add 91 if 10 digits
    const phone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly
    return `https://wa.me/${phone}?text=${cleanMessage}`
  }

  return `https://wa.me/?text=${cleanMessage}`
}
