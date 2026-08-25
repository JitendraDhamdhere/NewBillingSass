-- Add UPI VPA and WhatsApp templates settings to businesses table
ALTER TABLE public.businesses
ADD COLUMN IF NOT EXISTS upi_id TEXT,
ADD COLUMN IF NOT EXISTS upi_name TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_templates JSONB DEFAULT '{
  "invoice": "Hello {customer_name},\n\nHere is your invoice *{invoice_number}* from *{business_name}* for *₹{amount}*.\nBalance Due: *₹{due_amount}* (Due: {due_date}).\n\nPay via UPI to: {upi_id}\nThank you for your business!",
  "receipt": "Hello {customer_name},\n\nPayment received! Receipt *{receipt_number}* from *{business_name}* for *₹{amount}* recorded on {receipt_date}.\nThank you!",
  "reminder": "Dear {customer_name},\n\nThis is a friendly payment reminder from *{business_name}*.\nYou have an outstanding payment of *₹{due_amount}* for Invoice *{invoice_number}*.\n\nPlease pay via UPI to: {upi_id}\nThank you!",
  "statement": "Hello {customer_name},\n\nHere is your account statement from *{business_name}*.\nTotal Billed: ₹{total_billed}\nTotal Paid: ₹{total_paid}\nNet Balance Due: *₹{net_balance}*\n\nThank you!"
}'::jsonb;
