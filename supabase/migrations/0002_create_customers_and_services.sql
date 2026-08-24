-- Alter public.businesses to add onboarding fields
ALTER TABLE public.businesses
ADD COLUMN owner_info TEXT,
ADD COLUMN mobile TEXT,
ADD COLUMN whatsapp TEXT,
ADD COLUMN email TEXT,
ADD COLUMN address TEXT,
ADD COLUMN logo TEXT,
ADD COLUMN business_type TEXT;

-- Create customers table
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT,
    mobile TEXT,
    email TEXT,
    address TEXT,
    customer_type TEXT NOT NULL CHECK (customer_type IN ('REGULAR', 'WAL_IN')) DEFAULT 'REGULAR',
    possible_duplicate BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    default_rate NUMERIC(15, 2) NOT NULL DEFAULT 0.00 CHECK (default_rate >= 0),
    category TEXT,
    pricing_mode TEXT NOT NULL CHECK (pricing_mode IN ('FIXED', 'CUSTOM', 'HOURLY', 'QUANTITY_BASED')) DEFAULT 'FIXED',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on customers and services
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has access to a business (already defined in 0001 migration, but keeping RLS policies clean)
-- RLS Policies for customers
CREATE POLICY "Users can select customers from their business"
    ON public.customers
    FOR SELECT
    TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can insert customers into their business"
    ON public.customers
    FOR INSERT
    TO authenticated
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can update customers in their business"
    ON public.customers
    FOR UPDATE
    TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can delete customers from their business"
    ON public.customers
    FOR DELETE
    TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

-- RLS Policies for services
CREATE POLICY "Users can select services from their business"
    ON public.services
    FOR SELECT
    TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can insert services into their business"
    ON public.services
    FOR INSERT
    TO authenticated
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can update services in their business"
    ON public.services
    FOR UPDATE
    TO authenticated
    USING (business_id IN (SELECT get_user_businesses()))
    WITH CHECK (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can delete services from their business"
    ON public.services
    FOR DELETE
    TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

-- Reusable update updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to businesses, business_members, customers, services
CREATE TRIGGER trg_update_businesses_updated_at
    BEFORE UPDATE ON public.businesses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_business_members_updated_at
    BEFORE UPDATE ON public.business_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_customers_updated_at
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger function to check duplicate mobile numbers within same business
CREATE OR REPLACE FUNCTION public.sync_customer_possible_duplicate()
RETURNS TRIGGER AS $$
DECLARE
    current_business_id UUID;
    old_mobile TEXT;
    new_mobile TEXT;
BEGIN
    -- Prevent recursion by checking trigger depth
    IF pg_trigger_depth() > 1 THEN
        RETURN NULL;
    END IF;

    IF TG_OP = 'DELETE' THEN
        current_business_id := OLD.business_id;
        old_mobile := OLD.mobile;
    ELSIF TG_OP = 'INSERT' THEN
        current_business_id := NEW.business_id;
        new_mobile := NEW.mobile;
    ELSIF TG_OP = 'UPDATE' THEN
        current_business_id := NEW.business_id;
        old_mobile := OLD.mobile;
        new_mobile := NEW.mobile;
    END IF;

    -- Update old mobile group if it was changed or deleted
    IF old_mobile IS NOT NULL AND old_mobile <> '' THEN
        UPDATE public.customers c
        SET possible_duplicate = (
            SELECT COUNT(*) > 1 
            FROM public.customers 
            WHERE business_id = current_business_id AND mobile = old_mobile
        )
        WHERE c.business_id = current_business_id AND c.mobile = old_mobile
          AND c.possible_duplicate <> (
            SELECT COUNT(*) > 1 
            FROM public.customers 
            WHERE business_id = current_business_id AND mobile = old_mobile
          );
    END IF;

    -- Update new mobile group if it was changed or inserted
    IF new_mobile IS NOT NULL AND new_mobile <> '' THEN
        UPDATE public.customers c
        SET possible_duplicate = (
            SELECT COUNT(*) > 1 
            FROM public.customers 
            WHERE business_id = current_business_id AND mobile = new_mobile
        )
        WHERE c.business_id = current_business_id AND c.mobile = new_mobile
          AND c.possible_duplicate <> (
            SELECT COUNT(*) > 1 
            FROM public.customers 
            WHERE business_id = current_business_id AND mobile = new_mobile
          );
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply duplicate sync trigger to customers
CREATE TRIGGER trg_sync_customer_possible_duplicate
    AFTER INSERT OR UPDATE OR DELETE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.sync_customer_possible_duplicate();

-- Indexes for performance tuning
CREATE INDEX idx_customers_business_id ON public.customers(business_id);
CREATE INDEX idx_customers_mobile ON public.customers(mobile);
CREATE INDEX idx_customers_name ON public.customers(name);
CREATE INDEX idx_customers_created_at ON public.customers(created_at);

CREATE INDEX idx_services_business_id ON public.services(business_id);
CREATE INDEX idx_services_name ON public.services(name);
CREATE INDEX idx_services_created_at ON public.services(created_at);

CREATE INDEX idx_businesses_created_at ON public.businesses(created_at);
CREATE INDEX idx_business_members_user_id ON public.business_members(user_id);
