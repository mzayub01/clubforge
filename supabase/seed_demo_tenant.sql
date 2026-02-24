-- =============================================
-- ClubForge - Demo Tenant Re-Seed Script
-- Run this in Supabase SQL Editor AFTER creating
-- the two demo users via Dashboard
-- =============================================

-- Real UIDs from Supabase Dashboard:
--   Admin:  eea18619-870b-4251-8f29-3e97008de989
--   Member: ed58bf2a-c361-4d1a-903d-46b5d57c1f29

-- =============================================
-- 1. CREATE FICTIONAL MEMBER AUTH USERS
--    (copies instance_id from real admin user)
-- =============================================

DO $$
DECLARE
  v_instance_id UUID;
  member_ids UUID[] := ARRAY[
    'a0000000-de00-fa01-0000-000000000003'::UUID,
    'a0000000-de00-fa02-0000-000000000004'::UUID,
    'a0000000-de00-fa03-0000-000000000005'::UUID,
    'a0000000-de00-fa04-0000-000000000006'::UUID,
    'a0000000-de00-fa05-0000-000000000007'::UUID
  ];
  member_emails TEXT[] := ARRAY[
    'tom.wilson@example.com',
    'emma.taylor@example.com',
    'liam.patel@example.com',
    'olivia.jones@example.com',
    'noah.smith@example.com'
  ];
  member_first TEXT[] := ARRAY['Tom', 'Emma', 'Liam', 'Olivia', 'Noah'];
  member_last TEXT[] := ARRAY['Wilson', 'Taylor', 'Patel', 'Jones', 'Smith'];
  i INT;
BEGIN
  -- Get the real instance_id from the admin user
  SELECT instance_id INTO v_instance_id
  FROM auth.users WHERE id = 'eea18619-870b-4251-8f29-3e97008de989';

  FOR i IN 1..5 LOOP
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, aud, role,
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      member_ids[i],
      v_instance_id,
      member_emails[i],
      crypt('DemoMember2026!', gen_salt('bf')),
      now() - interval '30 days' + (i * interval '3 days'),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object('first_name', member_first[i], 'last_name', member_last[i]),
      'authenticated', 'authenticated',
      now() - interval '30 days' + (i * interval '3 days'),
      now(), '', ''
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO auth.identities (
      id, user_id, identity_data, provider, provider_id,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      member_ids[i], member_ids[i],
      jsonb_build_object('sub', member_ids[i]::text, 'email', member_emails[i]),
      'email', member_ids[i]::text,
      now(), now() - interval '30 days' + (i * interval '3 days'), now()
    ) ON CONFLICT DO NOTHING;
  END LOOP;
END;
$$;

-- =============================================
-- 2. CREATE DEMO TENANT
-- =============================================

INSERT INTO public.tenants (
  id, name, slug, owner_user_id, primary_color,
  contact_email, contact_phone,
  stripe_account_id, stripe_connect_enabled,
  subscription_tier, subscription_status,
  tagline, settings, is_active
) VALUES (
  'b0000000-de00-0000-0000-000000000001',
  'Apex MMA Academy',
  'apex-mma',
  'eea18619-870b-4251-8f29-3e97008de989',
  '#e63946',
  'info@apexmma.com',
  '+44 7700 900123',
  'acct_demo_apex_mma_fake',
  true,
  'pro',
  'active',
  'Train Hard. Fight Smart.',
  '{
    "waiver_text": "By signing up, you agree to participate at your own risk. Apex MMA Academy is not liable for injuries sustained during training.",
    "etiquette_text": "1. Bow when entering/leaving the mat\n2. Keep nails trimmed\n3. Wear clean gear every session\n4. Respect all training partners\n5. No shoes on the mat",
    "registration_message": "Welcome to Apex MMA Academy! Complete your registration below to join our community.",
    "require_profile_photo": false
  }'::jsonb,
  true
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 3. TENANT MEMBERS
-- =============================================

INSERT INTO public.tenant_members (tenant_id, user_id, role, is_active) VALUES
  ('b0000000-de00-0000-0000-000000000001', 'eea18619-870b-4251-8f29-3e97008de989', 'admin', true),
  ('b0000000-de00-0000-0000-000000000001', 'ed58bf2a-c361-4d1a-903d-46b5d57c1f29', 'member', true),
  ('b0000000-de00-0000-0000-000000000001', 'a0000000-de00-fa01-0000-000000000003', 'member', true),
  ('b0000000-de00-0000-0000-000000000001', 'a0000000-de00-fa02-0000-000000000004', 'member', true),
  ('b0000000-de00-0000-0000-000000000001', 'a0000000-de00-fa03-0000-000000000005', 'member', true),
  ('b0000000-de00-0000-0000-000000000001', 'a0000000-de00-fa04-0000-000000000006', 'member', true),
  ('b0000000-de00-0000-0000-000000000001', 'a0000000-de00-fa05-0000-000000000007', 'member', true)
ON CONFLICT (tenant_id, user_id) DO NOTHING;

-- =============================================
-- 4. PROFILES
-- =============================================

INSERT INTO public.profiles (user_id, first_name, last_name, email, date_of_birth, role, tenant_id) VALUES
  ('eea18619-870b-4251-8f29-3e97008de989', 'James',  'Rodriguez', 'demo-admin@clubforgehq.com',  '1985-03-15', 'admin',  'b0000000-de00-0000-0000-000000000001'),
  ('ed58bf2a-c361-4d1a-903d-46b5d57c1f29', 'Sarah',  'Chen',      'demo-member@clubforgehq.com', '1995-07-22', 'member', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa01-0000-000000000003', 'Tom',    'Wilson',    'tom.wilson@example.com',      '1990-01-10', 'member', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa02-0000-000000000004', 'Emma',   'Taylor',    'emma.taylor@example.com',     '1992-05-25', 'member', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa03-0000-000000000005', 'Liam',   'Patel',     'liam.patel@example.com',      '1988-11-03', 'member', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa04-0000-000000000006', 'Olivia', 'Jones',     'olivia.jones@example.com',    '2012-08-14', 'member', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa05-0000-000000000007', 'Noah',   'Smith',     'noah.smith@example.com',      '2013-04-19', 'member', 'b0000000-de00-0000-0000-000000000001')
ON CONFLICT (user_id) DO NOTHING;

-- =============================================
-- 5. LOCATION
-- =============================================

INSERT INTO public.locations (
  id, name, address, city, postcode, description,
  max_capacity, contact_email, contact_phone, is_active, tenant_id
) VALUES (
  'c0000000-de00-0000-0000-000000000001',
  'Apex MMA - Central',
  '42 Warrior Lane',
  'Manchester',
  'M1 4BT',
  'Our flagship training facility with 3,000 sqft of mat space, boxing ring, and full weights area.',
  120, 'info@apexmma.com', '+44 7700 900123',
  true, 'b0000000-de00-0000-0000-000000000001'
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 6. MEMBERSHIP TYPES (Adults, Kids, All-Access)
-- =============================================

INSERT INTO public.membership_types (
  id, location_id, name, description, price, duration_days,
  is_active, stripe_price_id, tenant_id
) VALUES
  ('d0000000-de00-0000-0000-000000000001', 'c0000000-de00-0000-0000-000000000001',
   'Adults', 'Full adult membership. Access to all adult classes including BJJ, Muay Thai, and MMA.',
   3999, 30, true, 'price_demo_adults', 'b0000000-de00-0000-0000-000000000001'),
  ('d0000000-de00-0000-0000-000000000002', 'c0000000-de00-0000-0000-000000000001',
   'Kids', 'Kids membership for ages 5-15. Access to all kids classes with age-appropriate instruction.',
   2499, 30, true, 'price_demo_kids', 'b0000000-de00-0000-0000-000000000001'),
  ('d0000000-de00-0000-0000-000000000003', 'c0000000-de00-0000-0000-000000000001',
   'All-Access', 'Unlimited access to every class — adults and kids. Family-friendly plan with premium benefits.',
   6999, 30, true, 'price_demo_allaccess', 'b0000000-de00-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 7. MEMBERSHIPS
-- =============================================

INSERT INTO public.memberships (
  id, user_id, location_id, membership_type_id, status,
  start_date, stripe_subscription_id, tenant_id
) VALUES
  ('e0000000-de00-0000-0000-000000000001', 'eea18619-870b-4251-8f29-3e97008de989', 'c0000000-de00-0000-0000-000000000001', 'd0000000-de00-0000-0000-000000000003', 'active', '2025-11-01', 'sub_demo_001', 'b0000000-de00-0000-0000-000000000001'),
  ('e0000000-de00-0000-0000-000000000002', 'ed58bf2a-c361-4d1a-903d-46b5d57c1f29', 'c0000000-de00-0000-0000-000000000001', 'd0000000-de00-0000-0000-000000000001', 'active', '2025-12-15', 'sub_demo_002', 'b0000000-de00-0000-0000-000000000001'),
  ('e0000000-de00-0000-0000-000000000003', 'a0000000-de00-fa01-0000-000000000003', 'c0000000-de00-0000-0000-000000000001', 'd0000000-de00-0000-0000-000000000001', 'active', '2025-10-20', 'sub_demo_003', 'b0000000-de00-0000-0000-000000000001'),
  ('e0000000-de00-0000-0000-000000000004', 'a0000000-de00-fa02-0000-000000000004', 'c0000000-de00-0000-0000-000000000001', 'd0000000-de00-0000-0000-000000000001', 'active', '2025-11-05', 'sub_demo_004', 'b0000000-de00-0000-0000-000000000001'),
  ('e0000000-de00-0000-0000-000000000005', 'a0000000-de00-fa03-0000-000000000005', 'c0000000-de00-0000-0000-000000000001', 'd0000000-de00-0000-0000-000000000003', 'active', '2025-09-01', 'sub_demo_005', 'b0000000-de00-0000-0000-000000000001'),
  ('e0000000-de00-0000-0000-000000000006', 'a0000000-de00-fa04-0000-000000000006', 'c0000000-de00-0000-0000-000000000001', 'd0000000-de00-0000-0000-000000000002', 'active', '2026-01-10', 'sub_demo_006', 'b0000000-de00-0000-0000-000000000001'),
  ('e0000000-de00-0000-0000-000000000007', 'a0000000-de00-fa05-0000-000000000007', 'c0000000-de00-0000-0000-000000000001', 'd0000000-de00-0000-0000-000000000002', 'active', '2026-01-15', 'sub_demo_007', 'b0000000-de00-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 8. CLASSES
-- =============================================

INSERT INTO public.classes (
  id, location_id, name, description, class_type,
  day_of_week, start_time, end_time, max_capacity,
  is_active, tenant_id
) VALUES
  ('f0000000-de00-0000-0000-000000000001', 'c0000000-de00-0000-0000-000000000001',
   'Fundamentals BJJ', 'Core techniques for beginners and intermediates. Focus on guard passing, sweeps, and submissions.',
   'BJJ', 1, '18:00', '19:30', 30, true, 'b0000000-de00-0000-0000-000000000001'),
  ('f0000000-de00-0000-0000-000000000002', 'c0000000-de00-0000-0000-000000000001',
   'Advanced No-Gi', 'Competition-focused no-gi training. Leg locks, wrestling transitions, and advanced scrambles.',
   'No-Gi', 3, '19:00', '20:30', 20, true, 'b0000000-de00-0000-0000-000000000001'),
  ('f0000000-de00-0000-0000-000000000003', 'c0000000-de00-0000-0000-000000000001',
   'Kids Jiu-Jitsu', 'Fun and safe martial arts for children ages 5-15. Building confidence, discipline, and coordination.',
   'Kids', 6, '10:00', '11:00', 25, true, 'b0000000-de00-0000-0000-000000000001'),
  ('f0000000-de00-0000-0000-000000000004', 'c0000000-de00-0000-0000-000000000001',
   'Muay Thai', 'Striking fundamentals — punches, kicks, knees, elbows, and clinch work. All levels welcome.',
   'Striking', 2, '18:00', '19:30', 30, true, 'b0000000-de00-0000-0000-000000000001'),
  ('f0000000-de00-0000-0000-000000000005', 'c0000000-de00-0000-0000-000000000001',
   'Open Mat', 'Free rolling and drilling. No instruction — just pure mat time with your training partners.',
   'Open', 5, '17:30', '19:00', 40, true, 'b0000000-de00-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 9. ATTENDANCE
-- =============================================

INSERT INTO public.attendance (user_id, class_id, class_date, check_in_time, tenant_id) VALUES
  -- Sarah Chen
  ('ed58bf2a-c361-4d1a-903d-46b5d57c1f29', 'f0000000-de00-0000-0000-000000000001', (now() - interval '1 day')::date,  now() - interval '1 day',  'b0000000-de00-0000-0000-000000000001'),
  ('ed58bf2a-c361-4d1a-903d-46b5d57c1f29', 'f0000000-de00-0000-0000-000000000004', (now() - interval '2 days')::date, now() - interval '2 days', 'b0000000-de00-0000-0000-000000000001'),
  ('ed58bf2a-c361-4d1a-903d-46b5d57c1f29', 'f0000000-de00-0000-0000-000000000005', (now() - interval '3 days')::date, now() - interval '3 days', 'b0000000-de00-0000-0000-000000000001'),
  ('ed58bf2a-c361-4d1a-903d-46b5d57c1f29', 'f0000000-de00-0000-0000-000000000001', (now() - interval '8 days')::date, now() - interval '8 days', 'b0000000-de00-0000-0000-000000000001'),
  ('ed58bf2a-c361-4d1a-903d-46b5d57c1f29', 'f0000000-de00-0000-0000-000000000004', (now() - interval '9 days')::date, now() - interval '9 days', 'b0000000-de00-0000-0000-000000000001'),
  -- Tom Wilson
  ('a0000000-de00-fa01-0000-000000000003', 'f0000000-de00-0000-0000-000000000001', (now() - interval '1 day')::date,  now() - interval '1 day',  'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa01-0000-000000000003', 'f0000000-de00-0000-0000-000000000002', (now() - interval '5 days')::date, now() - interval '5 days', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa01-0000-000000000003', 'f0000000-de00-0000-0000-000000000005', (now() - interval '3 days')::date, now() - interval '3 days', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa01-0000-000000000003', 'f0000000-de00-0000-0000-000000000001', (now() - interval '8 days')::date, now() - interval '8 days', 'b0000000-de00-0000-0000-000000000001'),
  -- Emma Taylor
  ('a0000000-de00-fa02-0000-000000000004', 'f0000000-de00-0000-0000-000000000001', (now() - interval '1 day')::date,  now() - interval '1 day',  'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa02-0000-000000000004', 'f0000000-de00-0000-0000-000000000005', (now() - interval '3 days')::date, now() - interval '3 days', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa02-0000-000000000004', 'f0000000-de00-0000-0000-000000000001', (now() - interval '8 days')::date, now() - interval '8 days', 'b0000000-de00-0000-0000-000000000001'),
  -- Liam Patel
  ('a0000000-de00-fa03-0000-000000000005', 'f0000000-de00-0000-0000-000000000001', (now() - interval '1 day')::date,  now() - interval '1 day',  'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa03-0000-000000000005', 'f0000000-de00-0000-0000-000000000002', (now() - interval '5 days')::date, now() - interval '5 days', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa03-0000-000000000005', 'f0000000-de00-0000-0000-000000000004', (now() - interval '2 days')::date, now() - interval '2 days', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa03-0000-000000000005', 'f0000000-de00-0000-0000-000000000005', (now() - interval '3 days')::date, now() - interval '3 days', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa03-0000-000000000005', 'f0000000-de00-0000-0000-000000000001', (now() - interval '8 days')::date, now() - interval '8 days', 'b0000000-de00-0000-0000-000000000001'),
  -- Olivia Jones (kid)
  ('a0000000-de00-fa04-0000-000000000006', 'f0000000-de00-0000-0000-000000000003', (now() - interval '2 days')::date,  now() - interval '2 days',  'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa04-0000-000000000006', 'f0000000-de00-0000-0000-000000000003', (now() - interval '9 days')::date,  now() - interval '9 days',  'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa04-0000-000000000006', 'f0000000-de00-0000-0000-000000000003', (now() - interval '16 days')::date, now() - interval '16 days', 'b0000000-de00-0000-0000-000000000001'),
  -- Noah Smith (kid)
  ('a0000000-de00-fa05-0000-000000000007', 'f0000000-de00-0000-0000-000000000003', (now() - interval '2 days')::date, now() - interval '2 days', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa05-0000-000000000007', 'f0000000-de00-0000-0000-000000000003', (now() - interval '9 days')::date, now() - interval '9 days', 'b0000000-de00-0000-0000-000000000001')
;

-- =============================================
-- 10. ANNOUNCEMENTS
-- =============================================

INSERT INTO public.announcements (id, title, message, is_active, tenant_id, created_at) VALUES
  ('aa000000-de00-0000-0000-000000000001',
   'Welcome to Apex MMA! 🥋',
   'Welcome to our brand new online portal! You can now check class schedules, track your attendance, and manage your membership — all from your phone.',
   true, 'b0000000-de00-0000-0000-000000000001', now() - interval '7 days'),
  ('aa000000-de00-0000-0000-000000000002',
   'Seminar: Guard Passing Masterclass — March 15',
   'We are hosting a special 3-hour seminar with visiting Professor Lucas Silva on Saturday March 15th at 2pm. Open to all members, 15 pounds drop-in. Sign up at the front desk!',
   true, 'b0000000-de00-0000-0000-000000000001', now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 11. BELT PROGRESSION
-- =============================================

INSERT INTO public.belt_progression (user_id, belt_rank, stripes, awarded_date, tenant_id) VALUES
  ('ed58bf2a-c361-4d1a-903d-46b5d57c1f29', 'white',  0, '2025-12-15', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa01-0000-000000000003', 'white',  0, '2024-06-01', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa01-0000-000000000003', 'blue',   0, '2025-08-20', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa02-0000-000000000004', 'white',  2, '2025-01-15', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa03-0000-000000000005', 'white',  0, '2021-03-01', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa03-0000-000000000005', 'blue',   0, '2022-09-15', 'b0000000-de00-0000-0000-000000000001'),
  ('a0000000-de00-fa03-0000-000000000005', 'purple', 0, '2025-01-10', 'b0000000-de00-0000-0000-000000000001')
;

-- =============================================
-- 12. LOCATION MEMBERSHIP CONFIGS
-- =============================================

INSERT INTO public.location_membership_configs (
  location_id, membership_type_id, capacity, is_available, tenant_id
) VALUES
  ('c0000000-de00-0000-0000-000000000001', 'd0000000-de00-0000-0000-000000000001', 80, true, 'b0000000-de00-0000-0000-000000000001'),
  ('c0000000-de00-0000-0000-000000000001', 'd0000000-de00-0000-0000-000000000002', 30, true, 'b0000000-de00-0000-0000-000000000001'),
  ('c0000000-de00-0000-0000-000000000001', 'd0000000-de00-0000-0000-000000000003', 20, true, 'b0000000-de00-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- =============================================
-- DONE! 🎉
-- 
-- Demo Login Credentials:
--   Admin:  demo-admin@clubforgehq.com  / ClubForge2026!
--   Member: demo-member@clubforgehq.com / ClubForge2026!
--
-- Tenant slug: apex-mma
-- =============================================
