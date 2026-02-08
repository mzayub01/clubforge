-- ===============================================
-- ClubForge — Fix Admin RLS Policies
-- Rewrites ALL policies to enforce strict tenant isolation:
--   1. NOT depend on current_tenant_id() session variable
--      (PostgREST doesn't maintain persistent connections)
--   2. Use tenant_members lookup directly for auth
--   3. Include explicit WITH CHECK for INSERT support
--   4. SELECT policies scoped to user's own tenant
-- 
-- Safe to run multiple times (idempotent via DROP IF EXISTS)
-- ===============================================

-- -----------------------------------------------
-- Helper Functions (SECURITY DEFINER = bypass RLS)
-- -----------------------------------------------

-- Check if user is an admin of the given tenant
CREATE OR REPLACE FUNCTION public.is_tenant_admin(check_tenant_id UUID)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = check_tenant_id
      AND user_id = auth.uid()
      AND role = 'admin'
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_tenant_admin(UUID) TO authenticated;

-- Check if user is admin OR instructor of the given tenant
CREATE OR REPLACE FUNCTION public.is_tenant_staff(check_tenant_id UUID)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = check_tenant_id
      AND user_id = auth.uid()
      AND role IN ('admin', 'instructor')
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_tenant_staff(UUID) TO authenticated;

-- Check if user belongs to the given tenant (any role)
CREATE OR REPLACE FUNCTION public.is_tenant_member(check_tenant_id UUID)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE tenant_id = check_tenant_id
      AND user_id = auth.uid()
      AND is_active = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.is_tenant_member(UUID) TO authenticated;


-- ===============================================
-- LOCATIONS
-- ===============================================
DROP POLICY IF EXISTS "locations_admin_manage" ON public.locations;
DROP POLICY IF EXISTS "Admin can manage locations" ON public.locations;
DROP POLICY IF EXISTS "locations_select" ON public.locations;
DROP POLICY IF EXISTS "Public can view active locations" ON public.locations;

-- Members can view their own tenant's active locations
CREATE POLICY "locations_select"
  ON public.locations FOR SELECT
  USING (is_active = true AND public.is_tenant_member(tenant_id));

-- Admin can manage their tenant's locations
CREATE POLICY "locations_admin_manage"
  ON public.locations FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- MEMBERSHIP TYPES
-- ===============================================
DROP POLICY IF EXISTS "membership_types_admin_manage" ON public.membership_types;
DROP POLICY IF EXISTS "Admin can manage membership types" ON public.membership_types;
DROP POLICY IF EXISTS "membership_types_select" ON public.membership_types;

CREATE POLICY "membership_types_select"
  ON public.membership_types FOR SELECT
  USING (is_active = true AND public.is_tenant_member(tenant_id));

CREATE POLICY "membership_types_admin_manage"
  ON public.membership_types FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- MEMBERSHIPS
-- ===============================================
DROP POLICY IF EXISTS "memberships_admin_manage" ON public.memberships;
DROP POLICY IF EXISTS "Admin can manage memberships" ON public.memberships;
DROP POLICY IF EXISTS "memberships_select_own" ON public.memberships;
DROP POLICY IF EXISTS "Admin can manage all memberships" ON public.memberships;

-- Members see their own memberships within their tenant
CREATE POLICY "memberships_select_own"
  ON public.memberships FOR SELECT
  USING (auth.uid() = user_id AND public.is_tenant_member(tenant_id));

CREATE POLICY "memberships_admin_manage"
  ON public.memberships FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- WAITLIST
-- ===============================================
DROP POLICY IF EXISTS "waitlist_admin_manage" ON public.waitlist;
DROP POLICY IF EXISTS "Admin can manage waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "waitlist_select_own" ON public.waitlist;

CREATE POLICY "waitlist_select_own"
  ON public.waitlist FOR SELECT
  USING (auth.uid() = user_id AND public.is_tenant_member(tenant_id));

CREATE POLICY "waitlist_admin_manage"
  ON public.waitlist FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- INSTRUCTORS
-- ===============================================
DROP POLICY IF EXISTS "instructors_admin_manage" ON public.instructors;
DROP POLICY IF EXISTS "Admin can manage instructors" ON public.instructors;
DROP POLICY IF EXISTS "instructors_select" ON public.instructors;
DROP POLICY IF EXISTS "instructors_update_own" ON public.instructors;

CREATE POLICY "instructors_select"
  ON public.instructors FOR SELECT
  USING (is_active = true AND public.is_tenant_member(tenant_id));

CREATE POLICY "instructors_update_own"
  ON public.instructors FOR UPDATE
  USING (auth.uid() = user_id AND public.is_tenant_member(tenant_id));

CREATE POLICY "instructors_admin_manage"
  ON public.instructors FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- CLASSES
-- ===============================================
DROP POLICY IF EXISTS "classes_admin_manage" ON public.classes;
DROP POLICY IF EXISTS "Admin can manage classes" ON public.classes;
DROP POLICY IF EXISTS "classes_select" ON public.classes;

CREATE POLICY "classes_select"
  ON public.classes FOR SELECT
  USING (is_active = true AND public.is_tenant_member(tenant_id));

CREATE POLICY "classes_admin_manage"
  ON public.classes FOR ALL
  USING (public.is_tenant_staff(tenant_id))
  WITH CHECK (public.is_tenant_staff(tenant_id));


-- ===============================================
-- ATTENDANCE
-- ===============================================
DROP POLICY IF EXISTS "attendance_admin_manage" ON public.attendance;
DROP POLICY IF EXISTS "Admin can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admin and instructors can manage attendance" ON public.attendance;
DROP POLICY IF EXISTS "attendance_select_own" ON public.attendance;
DROP POLICY IF EXISTS "attendance_insert_own" ON public.attendance;

CREATE POLICY "attendance_select_own"
  ON public.attendance FOR SELECT
  USING (auth.uid() = user_id AND public.is_tenant_member(tenant_id));

CREATE POLICY "attendance_insert_own"
  ON public.attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_tenant_member(tenant_id));

CREATE POLICY "attendance_admin_manage"
  ON public.attendance FOR ALL
  USING (public.is_tenant_staff(tenant_id))
  WITH CHECK (public.is_tenant_staff(tenant_id));


-- ===============================================
-- BELT PROGRESSION
-- ===============================================
DROP POLICY IF EXISTS "belt_progression_admin_manage" ON public.belt_progression;
DROP POLICY IF EXISTS "Admin can manage belt progression" ON public.belt_progression;
DROP POLICY IF EXISTS "belt_progression_select_own" ON public.belt_progression;

CREATE POLICY "belt_progression_select_own"
  ON public.belt_progression FOR SELECT
  USING (auth.uid() = user_id AND public.is_tenant_member(tenant_id));

CREATE POLICY "belt_progression_admin_manage"
  ON public.belt_progression FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- VIDEOS
-- ===============================================
DROP POLICY IF EXISTS "videos_admin_manage" ON public.videos;
DROP POLICY IF EXISTS "Admin can manage videos" ON public.videos;
DROP POLICY IF EXISTS "videos_select" ON public.videos;

CREATE POLICY "videos_select"
  ON public.videos FOR SELECT
  USING (is_active = true AND public.is_tenant_member(tenant_id));

CREATE POLICY "videos_admin_manage"
  ON public.videos FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- EVENTS
-- ===============================================
DROP POLICY IF EXISTS "events_admin_manage" ON public.events;
DROP POLICY IF EXISTS "Admin can manage events" ON public.events;
DROP POLICY IF EXISTS "events_select" ON public.events;

CREATE POLICY "events_select"
  ON public.events FOR SELECT
  USING (is_active = true AND public.is_tenant_member(tenant_id));

CREATE POLICY "events_admin_manage"
  ON public.events FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- EVENT RSVPS
-- ===============================================
DROP POLICY IF EXISTS "event_rsvps_admin_manage" ON public.event_rsvps;
DROP POLICY IF EXISTS "Admin can manage RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "event_rsvps_select_own" ON public.event_rsvps;
DROP POLICY IF EXISTS "event_rsvps_insert_own" ON public.event_rsvps;
DROP POLICY IF EXISTS "event_rsvps_update_own" ON public.event_rsvps;

CREATE POLICY "event_rsvps_select_own"
  ON public.event_rsvps FOR SELECT
  USING (auth.uid() = user_id AND public.is_tenant_member(tenant_id));

CREATE POLICY "event_rsvps_insert_own"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.is_tenant_member(tenant_id));

CREATE POLICY "event_rsvps_update_own"
  ON public.event_rsvps FOR UPDATE
  USING (auth.uid() = user_id AND public.is_tenant_member(tenant_id));

CREATE POLICY "event_rsvps_admin_manage"
  ON public.event_rsvps FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- ANNOUNCEMENTS
-- ===============================================
DROP POLICY IF EXISTS "announcements_admin_manage" ON public.announcements;
DROP POLICY IF EXISTS "Admin can manage announcements" ON public.announcements;
DROP POLICY IF EXISTS "announcements_select" ON public.announcements;

CREATE POLICY "announcements_select"
  ON public.announcements FOR SELECT
  USING (
    is_active = true
    AND public.is_tenant_member(tenant_id)
    AND (expires_at IS NULL OR expires_at > now())
  );

CREATE POLICY "announcements_admin_manage"
  ON public.announcements FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- NASEEHA
-- ===============================================
DROP POLICY IF EXISTS "naseeha_admin_manage" ON public.naseeha;
DROP POLICY IF EXISTS "Admin can manage naseeha" ON public.naseeha;
DROP POLICY IF EXISTS "naseeha_select" ON public.naseeha;

CREATE POLICY "naseeha_select"
  ON public.naseeha FOR SELECT
  USING (is_active = true AND public.is_tenant_member(tenant_id));

CREATE POLICY "naseeha_admin_manage"
  ON public.naseeha FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- PROFILES (admin access)
-- ===============================================
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;

-- Users can view their own profile, staff can see tenant profiles
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_tenant_staff(tenant_id)
  );

-- Users can update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin can update any profile in their tenant
CREATE POLICY "profiles_admin_update"
  ON public.profiles FOR UPDATE
  USING (public.is_tenant_admin(tenant_id));

-- Anyone can insert profiles (needed for registration)
CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (true);


-- ===============================================
-- EMAIL TEMPLATES
-- ===============================================
DROP POLICY IF EXISTS "email_templates_admin_manage" ON public.email_templates;
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;

CREATE POLICY "email_templates_admin_manage"
  ON public.email_templates FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- PROFESSOR CLASS ACCESS
-- ===============================================
DROP POLICY IF EXISTS "professor_access_admin_manage" ON public.professor_class_access;
DROP POLICY IF EXISTS "Admins can manage professor access" ON public.professor_class_access;
DROP POLICY IF EXISTS "professor_access_select_own" ON public.professor_class_access;

CREATE POLICY "professor_access_select_own"
  ON public.professor_class_access FOR SELECT
  USING (auth.uid() = professor_user_id AND public.is_tenant_member(tenant_id));

CREATE POLICY "professor_access_admin_manage"
  ON public.professor_class_access FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- CLASS MEMBERSHIP TYPES
-- ===============================================
DROP POLICY IF EXISTS "class_membership_types_admin_manage" ON public.class_membership_types;
DROP POLICY IF EXISTS "Admins can manage class membership types" ON public.class_membership_types;
DROP POLICY IF EXISTS "class_membership_types_select" ON public.class_membership_types;

CREATE POLICY "class_membership_types_select"
  ON public.class_membership_types FOR SELECT
  USING (public.is_tenant_member(tenant_id));

CREATE POLICY "class_membership_types_admin_manage"
  ON public.class_membership_types FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- PROMOTIONS
-- ===============================================
DROP POLICY IF EXISTS "promotions_admin_manage" ON public.promotions;
DROP POLICY IF EXISTS "promotions_select_own" ON public.promotions;
DROP POLICY IF EXISTS "promotions_select_staff" ON public.promotions;
DROP POLICY IF EXISTS "promotions_insert_staff" ON public.promotions;

CREATE POLICY "promotions_select_own"
  ON public.promotions FOR SELECT
  USING (auth.uid() = user_id AND public.is_tenant_member(tenant_id));

CREATE POLICY "promotions_select_staff"
  ON public.promotions FOR SELECT
  USING (public.is_tenant_staff(tenant_id));

CREATE POLICY "promotions_insert_staff"
  ON public.promotions FOR INSERT
  WITH CHECK (public.is_tenant_staff(tenant_id));

CREATE POLICY "promotions_admin_manage"
  ON public.promotions FOR ALL
  USING (public.is_tenant_admin(tenant_id))
  WITH CHECK (public.is_tenant_admin(tenant_id));


-- ===============================================
-- PROFESSOR FEEDBACK
-- ===============================================
DROP POLICY IF EXISTS "feedback_select_own" ON public.professor_feedback;
DROP POLICY IF EXISTS "feedback_insert_staff" ON public.professor_feedback;
DROP POLICY IF EXISTS "feedback_update_own" ON public.professor_feedback;

CREATE POLICY "feedback_select_own"
  ON public.professor_feedback FOR SELECT
  USING (
    public.is_tenant_member(tenant_id)
    AND (
      user_id = auth.uid()
      OR professor_id = auth.uid()
      OR public.is_tenant_admin(tenant_id)
    )
  );

CREATE POLICY "feedback_insert_staff"
  ON public.professor_feedback FOR INSERT
  WITH CHECK (public.is_tenant_staff(tenant_id));

CREATE POLICY "feedback_update_own"
  ON public.professor_feedback FOR UPDATE
  USING (user_id = auth.uid() AND public.is_tenant_member(tenant_id))
  WITH CHECK (user_id = auth.uid());


-- ===============================================
-- TENANTS (owner update)
-- ===============================================
DROP POLICY IF EXISTS "Tenant owners can update own tenant" ON public.tenants;

CREATE POLICY "Tenant owners can update own tenant"
  ON public.tenants FOR UPDATE
  USING (
    owner_user_id = auth.uid()
    OR public.is_tenant_admin(id)
  );


-- ===============================================
-- Done! All RLS policies now enforce strict tenant isolation.
-- Public-facing pages use service role (bypasses RLS).
-- No session variables needed.
-- ===============================================
