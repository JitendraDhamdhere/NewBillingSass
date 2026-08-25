-- Add category and description to receipts for standalone receipts / other income
ALTER TABLE public.receipts
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'CUSTOMER_PAYMENT',
ADD COLUMN IF NOT EXISTS description TEXT;

CREATE INDEX IF NOT EXISTS idx_receipts_category ON public.receipts(category);
