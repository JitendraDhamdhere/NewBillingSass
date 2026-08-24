-- Seed dummy users in auth.users for local development reference (foreign keys)
INSERT INTO auth.users (
    id, 
    email, 
    raw_user_meta_data, 
    created_at, 
    instance_id, 
    aud, 
    role, 
    encrypted_password, 
    email_confirmed_at, 
    last_sign_in_at
)
VALUES 
  ('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'owner@example.com', '{"name": "Owner User"}'::jsonb, now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '', now(), now()),
  ('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'accountant@example.com', '{"name": "Accountant User"}'::jsonb, now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '', now(), now()),
  ('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'staff@example.com', '{"name": "Staff User"}'::jsonb, now(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Seed Businesses
INSERT INTO public.businesses (
    id, 
    name, 
    owner_info, 
    mobile, 
    whatsapp, 
    email, 
    address, 
    logo, 
    business_type, 
    created_at, 
    updated_at
)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Vyaapaar Retail', 'Jitendra Dhamdhere', '9876543210', '9876543210', 'retail@example.com', 'Pune, Maharashtra, India', 'https://example.com/logo-retail.png', 'Retail', now(), now()),
  ('22222222-2222-2222-2222-222222222222', 'Crosonic Technologies', 'Crosonic Admin', '9876543211', '9876543211', 'tech@example.com', 'Mumbai, Maharashtra, India', 'https://example.com/logo-tech.png', 'Services', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Seed Business Memberships
INSERT INTO public.business_members (
    id, 
    business_id, 
    user_id, 
    role, 
    created_at, 
    updated_at
)
VALUES
  ('11111111-2222-3333-4444-555555555555', '11111111-1111-1111-1111-111111111111', 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'OWNER', now(), now()),
  ('22222222-3333-4444-5555-666666666666', '11111111-1111-1111-1111-111111111111', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'ACCOUNTANT', now(), now()),
  ('33333333-4444-5555-6666-777777777777', '11111111-1111-1111-1111-111111111111', 'c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'STAFF', now(), now()),
  ('44444444-5555-6666-7777-888888888888', '22222222-2222-2222-2222-222222222222', 'b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'OWNER', now(), now())
ON CONFLICT (id) DO NOTHING;

-- Seed Customers
INSERT INTO public.customers (
    id, 
    business_id, 
    name, 
    mobile, 
    email, 
    address, 
    customer_type, 
    possible_duplicate, 
    created_at, 
    updated_at
)
VALUES
  ('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Rahul Sharma', '9999988888', 'rahul@example.com', 'Flat 101, Park Avenue, Pune', 'REGULAR', FALSE, now(), now()),
  ('c2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Priya Patel', '9999977777', 'priya@example.com', 'Sector 15, Vashi, Navi Mumbai', 'REGULAR', FALSE, now(), now()),
  -- Walk-in customer (fully paid, no mobile/name details needed)
  ('c3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Walk-in Customer', NULL, NULL, NULL, 'WAL_IN', FALSE, now(), now()),
  -- Duplicate mobile number case for testing (Note: trigger will set this to true automatically on real db, but we also seed it)
  ('c4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Rahul Duplicate Test', '9999988888', 'rahul2@example.com', 'Pune', 'REGULAR', TRUE, now(), now()),
  -- Customer belonging to business B
  ('c5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Vikram Singh', '9888877777', 'vikram@example.com', 'Delhi', 'REGULAR', FALSE, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Seed Services
INSERT INTO public.services (
    id, 
    business_id, 
    name, 
    default_rate, 
    category, 
    pricing_mode, 
    is_active, 
    created_at, 
    updated_at
)
VALUES
  ('s1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'General Consulting', 1500.00, 'Consulting', 'HOURLY', TRUE, now(), now()),
  ('s2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Product Package A', 4999.00, 'Products', 'FIXED', TRUE, now(), now()),
  ('s3333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Hourly Labor', 250.00, 'Services', 'HOURLY', TRUE, now(), now()),
  ('s4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Custom Service Charge', 0.00, 'Services', 'CUSTOM', TRUE, now(), now()),
  -- Service belonging to business B
  ('s5555555-5555-5555-5555-555555555555', '22222222-2222-2222-2222-222222222222', 'Software Integration', 10000.00, 'Tech Services', 'FIXED', TRUE, now(), now())
ON CONFLICT (id) DO NOTHING;
