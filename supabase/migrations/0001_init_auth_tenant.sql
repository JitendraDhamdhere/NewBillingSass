-- Create businesses table
CREATE TABLE public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Create membership table representing user-business relations
CREATE TABLE public.business_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'ACCOUNTANT', 'STAFF')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (business_id, user_id)
);

-- Enable RLS on business_members
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has access to business
CREATE OR REPLACE FUNCTION public.get_user_businesses()
RETURNS TABLE (business_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT bm.business_id
    FROM public.business_members bm
    WHERE bm.user_id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies for businesses
CREATE POLICY "Users can view their own businesses"
    ON public.businesses
    FOR SELECT
    TO authenticated
    USING (id IN (SELECT get_user_businesses()));

CREATE POLICY "Authenticated users can create businesses"
    ON public.businesses
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Owners can update their businesses"
    ON public.businesses
    FOR UPDATE
    TO authenticated
    USING (id IN (
        SELECT bm.business_id 
        FROM public.business_members bm 
        WHERE bm.user_id = auth.uid() AND bm.role = 'OWNER'
    ));

-- RLS Policies for business_members
CREATE POLICY "Users can view members of their businesses"
    ON public.business_members
    FOR SELECT
    TO authenticated
    USING (business_id IN (SELECT get_user_businesses()));

CREATE POLICY "Users can join a business or add themselves during onboarding"
    ON public.business_members
    FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can update member roles"
    ON public.business_members
    FOR UPDATE
    TO authenticated
    USING (business_id IN (
        SELECT bm.business_id 
        FROM public.business_members bm 
        WHERE bm.user_id = auth.uid() AND bm.role = 'OWNER'
    ));

CREATE POLICY "Owners can remove members"
    ON public.business_members
    FOR DELETE
    TO authenticated
    USING (business_id IN (
        SELECT bm.business_id 
        FROM public.business_members bm 
        WHERE bm.user_id = auth.uid() AND bm.role = 'OWNER'
    ));
