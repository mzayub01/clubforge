-- ===============================================
-- ClubForge — Migration 015: platform_user_activity()
-- OPTIONAL performance/robustness helper for the platform tenants view.
--
-- The platform tenants API derives each tenant's "last used" from
-- auth.users.last_sign_in_at. auth.admin.listUsers() fails with
-- "Database error finding users" for any page containing a corrupt auth row
-- on this project, so the API falls back to adaptive paging (100 → 10 → 1)
-- and skips the bad row. This function returns the same data in ONE query,
-- runs as the definer, and is executable by the service role only.
--
-- Idempotent. Run in the Supabase SQL editor. Nothing breaks if it is absent.
-- ===============================================

CREATE OR REPLACE FUNCTION public.platform_user_activity()
RETURNS TABLE (
  user_id uuid,
  email text,
  last_sign_in_at timestamptz,
  created_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, auth AS $$
  SELECT u.id, u.email::text, u.last_sign_in_at, u.created_at
  FROM auth.users u;
$$;

-- Service role only: this exposes every account's email + sign-in time.
REVOKE ALL ON FUNCTION public.platform_user_activity() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.platform_user_activity() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.platform_user_activity() TO service_role;

NOTIFY pgrst, 'reload schema';

-- Verify: SELECT count(*) FROM public.platform_user_activity();
