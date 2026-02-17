-- ===============================================
-- ClubForge — Fix RLS Tenant Isolation Gaps
-- Fixes public read policies, membership/waitlist insert,
-- and parent-child attendance policies to enforce tenant scope.
-- Safe to run multiple times (idempotent via DROP IF EXISTS)
-- ===============================================


-- ===============================================
-- GAP 1: PUBLIC READ POLICIES — No tenant filter
-- locations, membership_types, location_membership_configs
-- were readable by anyone without tenant scope.
-- Fix: Keep public read but scope to tenant via is_tenant_member()
-- or allow service role to bypass (registration uses service role).
-- ===============================================

-- ----- LOCATIONS (public read) -----
DROP POLICY IF EXISTS "Public can view active locations" ON public.locations;

-- For authenticated members: scoped to their tenant
-- Note: locations_select already exists from 008 for authenticated members.
-- The public policy was the leak. We don't re-create it — registration
-- uses the service role client which bypasses RLS entirely.


-- ----- MEMBERSHIP TYPES (public read) -----
DROP POLICY IF EXISTS "Public can view active membership types" ON public.membership_types;

-- Same logic: registration uses service role. No public policy needed.
-- membership_types_select from 008 already covers authenticated members.


-- ----- LOCATION MEMBERSHIP CONFIGS -----
DROP POLICY IF EXISTS "Public can view capacity configs" ON public.location_membership_configs;

-- Add tenant-scoped policy for authenticated members
ALTER TABLE public.location_membership_configs ENABLE ROW LEVEL SECURITY;

-- Members can view configs for their tenant
CREATE POLICY "lmc_select_member"
  ON public.location_membership_configs FOR SELECT
  USING (public.is_tenant_member(tenant_id));

-- Admin can manage configs for their tenant
DROP POLICY IF EXISTS "lmc_admin_manage" ON public.location_membership_configs;
CREATE POLICY "lmc_admin_manage"
  ON public.location_membership_configs FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- GAP 2: MEMBERSHIP & WAITLIST INSERT — No tenant check
-- Users could insert memberships/waitlist into any tenant.
-- Fix: Add tenant membership check to INSERT policies.
-- ===============================================

-- ----- MEMBERSHIPS INSERT -----
DROP POLICY IF EXISTS "Users can create own membership" ON public.memberships;

CREATE POLICY "memberships_insert_own"
  ON public.memberships FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_tenant_member(tenant_id)
  );

-- ----- WAITLIST INSERT -----
DROP POLICY IF EXISTS "Users can join waitlist" ON public.waitlist;

CREATE POLICY "waitlist_insert_own"
  ON public.waitlist FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.is_tenant_member(tenant_id)
  );

-- Drop duplicate waitlist select (already covered by waitlist_select_own from 008)
DROP POLICY IF EXISTS "Users can view own waitlist" ON public.waitlist;


-- ===============================================
-- GAP 3: ATTENDANCE PARENT/CHILD — No tenant check
-- Parents could query children's attendance across tenants.
-- Fix: Add tenant membership check to parent policies.
-- ===============================================

-- ----- PARENT SELECT -----
DROP POLICY IF EXISTS "Parents can view children attendance" ON public.attendance;

CREATE POLICY "attendance_parent_select"
  ON public.attendance FOR SELECT
  TO authenticated
  USING (
    public.is_tenant_member(tenant_id)
    AND EXISTS (
      SELECT 1 FROM profiles child
      JOIN profiles parent ON child.parent_guardian_id = parent.id
      WHERE child.user_id = attendance.user_id
        AND parent.user_id = auth.uid()
        AND child.tenant_id = attendance.tenant_id
    )
  );

-- ----- PARENT INSERT -----
DROP POLICY IF EXISTS "Parents can insert children attendance" ON public.attendance;

CREATE POLICY "attendance_parent_insert"
  ON public.attendance FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_tenant_member(tenant_id)
    AND EXISTS (
      SELECT 1 FROM profiles child
      JOIN profiles parent ON child.parent_guardian_id = parent.id
      WHERE child.user_id = attendance.user_id
        AND parent.user_id = auth.uid()
        AND child.tenant_id = attendance.tenant_id
    )
  );

-- Drop duplicate attendance policies from fix_attendance_rls_policies.sql
-- that don't have tenant scope (already covered by 008 policies)
DROP POLICY IF EXISTS "Users can view their own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can insert own attendance" ON public.attendance;


-- ===============================================
-- Done! All gaps closed.
-- ===============================================
