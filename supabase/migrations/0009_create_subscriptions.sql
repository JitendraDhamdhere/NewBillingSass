-- Phase 10 SaaS Subscriptions Schema

CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    plan TEXT NOT NULL DEFAULT 'FREE', -- FREE, STARTER, BUSINESS, PRO
    status TEXT NOT NULL DEFAULT 'TRIALING', -- TRIALING, ACTIVE, PAST_DUE, CANCELLED, EXPIRED
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    razorpay_customer_id TEXT,
    razorpay_subscription_id TEXT,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT subscriptions_business_id_key UNIQUE (business_id)
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own business subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (business_id IN (SELECT get_user_businesses()));

-- Service role is required for webhook updates (bypasses RLS)
CREATE POLICY "Users cannot manually update subscriptions"
    ON public.subscriptions
    FOR UPDATE
    USING (false);

CREATE POLICY "Users cannot manually insert subscriptions"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (false);

-- Function to automatically create a FREE trial subscription when a business is created
CREATE OR REPLACE FUNCTION public.handle_new_business_subscription() 
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (
        business_id, 
        plan, 
        status, 
        trial_start, 
        trial_end
    ) VALUES (
        NEW.id,
        'FREE',
        'TRIALING',
        NOW(),
        NOW() + INTERVAL '14 days'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create subscription on business creation
DROP TRIGGER IF EXISTS on_business_created_subscription ON public.businesses;
CREATE TRIGGER on_business_created_subscription
    AFTER INSERT ON public.businesses
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_business_subscription();
