-- ===============================================
-- ClubForge - Platform Admins Table
-- Super-admin access for ClubForge operators
-- ===============================================

-- Table: platform_admins
-- Stores which Supabase auth users have platform-level (super-admin) access.
-- This is separate from the per-tenant `tenant_members.role` system.

CREATE TABLE IF NOT EXISTS public.platform_admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_admins ENABLE ROW LEVEL SECURITY;

-- No RLS policies = only service role key can read/write.
-- This is intentional — platform admin checks happen server-side only.

CREATE INDEX idx_platform_admins_user ON platform_admins(user_id);

-- ===============================================
-- SEED: Make the first tenant owner a platform admin
-- (This finds the owner of the first created tenant)
-- ===============================================

DO $$
DECLARE
  v_owner_id UUID;
BEGIN
  -- Find the owner of the first tenant
  SELECT owner_user_id INTO v_owner_id
  FROM public.tenants
  WHERE owner_user_id IS NOT NULL
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_owner_id IS NOT NULL THEN
    INSERT INTO public.platform_admins (user_id)
    VALUES (v_owner_id)
    ON CONFLICT (user_id) DO NOTHING;
    RAISE NOTICE 'Seeded platform admin: %', v_owner_id;
  ELSE
    RAISE NOTICE 'No tenant owner found. Manually insert into platform_admins.';
  END IF;
END;
$$;
