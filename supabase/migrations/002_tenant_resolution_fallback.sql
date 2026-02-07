-- ===============================================
-- ClubForge - Tenant Resolution Fallback
-- Phase 1b: Client-side tenant resolution
-- ===============================================
-- 
-- For client-side (browser) Supabase connections, we can't use
-- set_tenant_context() because each client connects directly.
-- This migration adds a fallback function that resolves the user's
-- tenant from the tenant_members table.
-- ===============================================

-- Get the tenant_id for the currently authenticated user.
-- If a user belongs to exactly one tenant, return that tenant_id.
-- If app.current_tenant_id is already set (server-side), use that.
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
DECLARE
  v_tenant_id UUID;
BEGIN
  -- First check if explicitly set via server-side middleware
  v_tenant_id := NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
  IF v_tenant_id IS NOT NULL THEN
    RETURN v_tenant_id;
  END IF;

  -- Fallback: resolve from tenant_members for authenticated user
  SELECT tm.tenant_id INTO v_tenant_id
  FROM public.tenant_members tm
  WHERE tm.user_id = auth.uid()
    AND tm.is_active = true
  LIMIT 1;

  RETURN v_tenant_id;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
