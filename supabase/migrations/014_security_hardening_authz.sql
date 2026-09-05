-- ===============================================
-- ClubForge — Migration 014: Authorization hardening
-- Remediation for the 2026-09 responsible disclosure.
--
-- What this fixes (all verified against the live project before writing):
--   F1  public.tenants was SELECT-able by the anon key ("Anyone can read active
--       tenants by slug" USING is_active) → full rows incl. contact details and
--       Stripe ids for every club.
--   F2  tenant-assets storage policies were bucket-wide for ANY authenticated
--       user (list / upload / overwrite / delete any club's logo).
--   L1  profiles.role (and tenant_id / parent_guardian_id / stripe_customer_id)
--       were self-editable by the row owner. resolveTenantForUser() falls back
--       to profiles.role for users without a tenant_members row, so this WAS a
--       privilege-escalation path, not just a control-plane gap.
--   L3  "Tenant admins can manage tenant members" referenced tenant_members
--       inside its own policy → 42P17 infinite recursion on every client read.
--   +   "Tenant owners can update own tenant" let an owner PATCH
--       subscription_tier / subscription_status / trial_ends_at / stripe_* from
--       the browser (self-service free upgrade), and 004's "Authenticated users
--       can create tenants" let any signed-in user INSERT a tenant with any slug
--       and tier. All tenant writes are server side; client UPDATE/INSERT removed.
--   +   avatars bucket had the same bucket-wide write policies as tenant-assets.
--   +   videos bucket policies keyed on the self-editable profiles.role.
--
-- Idempotent — safe to run more than once. Run in the Supabase SQL editor.
-- Deploy the matching app release FIRST (it reads tenants_public with a
-- fallback to tenants, and uploads logos server-side), then run this.
-- ===============================================

BEGIN;

-- -----------------------------------------------
-- 0. Helper functions (SECURITY DEFINER so policies never recurse)
-- -----------------------------------------------

-- Admin of at least one tenant (used for legacy, non-tenant-scoped video paths).
CREATE OR REPLACE FUNCTION public.is_any_tenant_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_any_tenant_admin() TO authenticated;

-- Legacy helper used to read profiles.role (self-editable). Re-point it at
-- tenant_members so any surviving consumer can't be fooled by a role edit.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_any_tenant_admin();
$$;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- Parse the tenant UUID out of a storage object path shaped
-- "<prefix>/<tenant-uuid>/...". Returns NULL for any other shape, which makes
-- every policy below evaluate to false instead of erroring.
CREATE OR REPLACE FUNCTION public.storage_path_tenant_id(object_name text, prefix text)
RETURNS uuid
LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE
  parts text[] := storage.foldername(object_name);
BEGIN
  IF parts IS NULL OR array_length(parts, 1) < 2 OR parts[1] <> prefix THEN
    RETURN NULL;
  END IF;
  IF parts[2] !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN NULL;
  END IF;
  RETURN parts[2]::uuid;
END;
$$;
GRANT EXECUTE ON FUNCTION public.storage_path_tenant_id(text, text) TO anon, authenticated;

-- -----------------------------------------------
-- 1. tenants — no anonymous reads, no client-side writes
-- -----------------------------------------------
DROP POLICY IF EXISTS "Anyone can read active tenants by slug" ON public.tenants;
DROP POLICY IF EXISTS "Tenant owners can update own tenant" ON public.tenants;
-- 004 let any signed-in user INSERT a tenant row directly (any slug, any
-- subscription_tier/status) — provisioning only happens in /api/onboard with the
-- service role, so this "client-side fallback" was never used by the app.
DROP POLICY IF EXISTS "Authenticated users can create tenants" ON public.tenants;
DROP POLICY IF EXISTS "tenants_select_owner_or_admin" ON public.tenants;

-- Only the owner or an active admin of the tenant can read its full row.
-- Members and anonymous visitors use the tenants_public view below.
CREATE POLICY "tenants_select_owner_or_admin"
  ON public.tenants FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid() OR public.is_tenant_admin(id));

-- Marketing-safe projection for tenant resolution / theming with the anon key.
-- Deliberately NOT security_invoker: the view runs as its owner so anon can read
-- these columns while the base table stays locked. Only whitelisted settings
-- keys are exposed.
DROP VIEW IF EXISTS public.tenants_public;
CREATE VIEW public.tenants_public
WITH (security_invoker = false) AS
  SELECT
    t.id,
    t.name,
    t.slug,
    t.logo_url,
    t.primary_color,
    t.tagline,
    t.custom_domain,
    t.is_active,
    t.created_at,
    jsonb_strip_nulls(jsonb_build_object(
      'waiver_text',              t.settings -> 'waiver_text',
      'etiquette_text',           t.settings -> 'etiquette_text',
      'registration_message',     t.settings -> 'registration_message',
      'require_profile_photo',    t.settings -> 'require_profile_photo',
      'belt_progress_enabled',    t.settings -> 'belt_progress_enabled',
      'membership_location_mode', t.settings -> 'membership_location_mode'
    )) AS settings
  FROM public.tenants t
  WHERE t.is_active = true;

REVOKE ALL ON public.tenants_public FROM PUBLIC;
GRANT SELECT ON public.tenants_public TO anon, authenticated;

-- -----------------------------------------------
-- 2. tenant_members — fix infinite recursion (42P17)
-- -----------------------------------------------
DROP POLICY IF EXISTS "Tenant admins can manage tenant members" ON public.tenant_members;
-- 004's owner/admin INSERT policy also self-referenced tenant_members (second
-- recursion source). Every tenant_members insert in the app is service-role;
-- admins are covered by tenant_members_admin_manage below.
DROP POLICY IF EXISTS "Tenant owners can insert members" ON public.tenant_members;
DROP POLICY IF EXISTS "tenant_members_admin_manage" ON public.tenant_members;

CREATE POLICY "tenant_members_admin_manage"
  ON public.tenant_members FOR ALL
  TO authenticated
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));
-- "Users can view own tenant memberships" (auth.uid() = user_id) is unchanged.

-- -----------------------------------------------
-- 3. profiles — privileged columns can't be self-edited
--    (is_child is intentionally NOT protected: /register sets it client-side on
--    the new user's own row.)
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_columns()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  jwt_role text := coalesce(auth.role(), '');
BEGIN
  -- Service-role (server routes) and non-API sessions (SQL editor, auth
  -- triggers) are trusted.
  IF jwt_role NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.role IS DISTINCT FROM 'member'::user_role THEN
      RAISE EXCEPTION 'profiles.role can only be assigned server-side'
        USING ERRCODE = '42501';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.role               IS DISTINCT FROM OLD.role
  OR NEW.tenant_id          IS DISTINCT FROM OLD.tenant_id
  OR NEW.user_id            IS DISTINCT FROM OLD.user_id
  OR NEW.parent_guardian_id IS DISTINCT FROM OLD.parent_guardian_id
  OR NEW.stripe_customer_id IS DISTINCT FROM OLD.stripe_customer_id
  THEN
    -- Only an active admin of the profile's tenant may change these, and never
    -- move the profile to another tenant.
    IF OLD.tenant_id IS NULL
       OR NEW.tenant_id IS DISTINCT FROM OLD.tenant_id
       OR NOT public.is_tenant_admin(OLD.tenant_id)
    THEN
      RAISE EXCEPTION 'Not allowed to change privileged profile columns (role, tenant, guardian link, billing id)'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_privileged_columns ON public.profiles;
CREATE TRIGGER protect_profile_privileged_columns
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_columns();

-- Legacy profiles.role-based policies (superseded by 008; drop if they survive).
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;

-- -----------------------------------------------
-- 4. Storage — tenant-assets (club logos): tenant-admin scoped,
--    path convention tenants/<tenant-uuid>/...
--    The app uploads logos server-side (service role) via
--    /api/admin/upload-logo; these policies are defence in depth.
--    Public-bucket downloads bypass RLS, so logos still render everywhere;
--    SELECT here only governs list / signed-URL minting.
-- -----------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated uploads to tenant-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to tenant-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to tenant-assets" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to tenant-assets" ON storage.objects;
DROP POLICY IF EXISTS "tenant_assets_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "tenant_assets_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "tenant_assets_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "tenant_assets_admin_delete" ON storage.objects;

CREATE POLICY "tenant_assets_admin_select"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'tenant-assets'
         AND public.is_tenant_admin(public.storage_path_tenant_id(name, 'tenants')));

CREATE POLICY "tenant_assets_admin_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tenant-assets'
              AND public.is_tenant_admin(public.storage_path_tenant_id(name, 'tenants')));

CREATE POLICY "tenant_assets_admin_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'tenant-assets'
         AND public.is_tenant_admin(public.storage_path_tenant_id(name, 'tenants')))
  WITH CHECK (bucket_id = 'tenant-assets'
              AND public.is_tenant_admin(public.storage_path_tenant_id(name, 'tenants')));

CREATE POLICY "tenant_assets_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tenant-assets'
         AND public.is_tenant_admin(public.storage_path_tenant_id(name, 'tenants')));

-- -----------------------------------------------
-- 5. Storage — avatars: every write is server-side (service role) through
--    /api/upload-profile-image and /api/parent/add-child. No client policies.
--    (Public-bucket downloads are unaffected; this only removes bucket-wide
--    list/overwrite/delete for any signed-in user.)
-- -----------------------------------------------
DROP POLICY IF EXISTS "Allow authenticated uploads to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes to avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to avatars" ON storage.objects;

-- -----------------------------------------------
-- 6. Storage — videos: policies keyed on self-editable profiles.role.
--    New uploads go to videos/<tenant-uuid>/<file> (tenant-admin scoped).
--    Legacy flat objects videos/<file> carry no tenant marker; any tenant admin
--    may still delete them until they are migrated. Public SELECT is kept:
--    technique-video URLs are public by design.
-- -----------------------------------------------
DROP POLICY IF EXISTS "Admins can upload videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete videos" ON storage.objects;
DROP POLICY IF EXISTS "videos_tenant_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "videos_tenant_admin_delete" ON storage.objects;

CREATE POLICY "videos_tenant_admin_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'videos'
              AND public.is_tenant_admin(public.storage_path_tenant_id(name, 'videos')));

CREATE POLICY "videos_tenant_admin_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'videos' AND (
           public.is_tenant_admin(public.storage_path_tenant_id(name, 'videos'))
           OR (public.storage_path_tenant_id(name, 'videos') IS NULL AND public.is_any_tenant_admin())
         ));

COMMIT;

-- Make PostgREST pick up the new view immediately.
NOTIFY pgrst, 'reload schema';

-- ===============================================
-- Verification (run after applying, or use scripts/verify-security-posture.mjs)
-- ===============================================
-- SELECT policyname, cmd, roles FROM pg_policies WHERE tablename = 'tenants';
-- SELECT policyname, cmd FROM pg_policies WHERE tablename = 'tenant_members';
-- SELECT policyname, cmd FROM pg_policies WHERE schemaname = 'storage' AND tablename = 'objects' ORDER BY 1;
-- SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.profiles'::regclass AND NOT tgisinternal;
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'tenants_public';
