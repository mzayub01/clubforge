-- ===============================================
-- ClubForge - Multi-Tenancy Foundation
-- Phase 1a: Schema Migration
-- ===============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ensure the updated_at trigger function exists
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- ===============================================
-- 1. TENANTS TABLE
-- ===============================================

CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#c5a456',
  contact_email TEXT,
  contact_phone TEXT,
  stripe_account_id TEXT,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT DEFAULT 'active' CHECK (subscription_status IN ('active', 'past_due', 'cancelled', 'trialing')),
  settings JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Tenants are publicly readable by slug (needed for resolution)
CREATE POLICY "Anyone can read active tenants by slug"
  ON public.tenants FOR SELECT
  USING (is_active = true);

-- Tenant owners can update their own tenant
CREATE POLICY "Tenant owners can update own tenant"
  ON public.tenants FOR UPDATE
  USING (
    owner_user_id = auth.uid()
  );

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_owner ON tenants(owner_user_id);

-- ===============================================
-- 2. TENANT MEMBERS TABLE (junction: user <-> tenant with role)
-- ===============================================

CREATE TABLE public.tenant_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role user_role DEFAULT 'member' NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tenant memberships"
  ON public.tenant_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Tenant admins can manage tenant members"
  ON public.tenant_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = tenant_members.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- Service role bypasses RLS entirely — no policy needed

CREATE TRIGGER update_tenant_members_updated_at
  BEFORE UPDATE ON tenant_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX idx_tenant_members_user ON tenant_members(user_id);
CREATE INDEX idx_tenant_members_role ON tenant_members(role);

-- ===============================================
-- 3. ADD tenant_id TO ALL EXISTING TABLES
-- ===============================================

-- Profiles
ALTER TABLE public.profiles ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_profiles_tenant ON profiles(tenant_id);

-- Locations
ALTER TABLE public.locations ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_locations_tenant ON locations(tenant_id);

-- Membership Types
ALTER TABLE public.membership_types ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_membership_types_tenant ON membership_types(tenant_id);

-- Memberships
ALTER TABLE public.memberships ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_memberships_tenant ON memberships(tenant_id);

-- Waitlist
ALTER TABLE public.waitlist ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_waitlist_tenant ON waitlist(tenant_id);

-- Instructors
ALTER TABLE public.instructors ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_instructors_tenant ON instructors(tenant_id);

-- Classes
ALTER TABLE public.classes ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_classes_tenant ON classes(tenant_id);

-- Attendance
ALTER TABLE public.attendance ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_attendance_tenant ON attendance(tenant_id);

-- Belt Progression
ALTER TABLE public.belt_progression ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_belt_progression_tenant ON belt_progression(tenant_id);

-- Videos
ALTER TABLE public.videos ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_videos_tenant ON videos(tenant_id);

-- Events
ALTER TABLE public.events ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_events_tenant ON events(tenant_id);

-- Event RSVPs
ALTER TABLE public.event_rsvps ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_event_rsvps_tenant ON event_rsvps(tenant_id);

-- Announcements
ALTER TABLE public.announcements ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_announcements_tenant ON announcements(tenant_id);

-- Naseeha
ALTER TABLE public.naseeha ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_naseeha_tenant ON naseeha(tenant_id);

-- Promotions
ALTER TABLE public.promotions ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_promotions_tenant ON promotions(tenant_id);

-- Professor Class Access
ALTER TABLE public.professor_class_access ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_professor_class_access_tenant ON professor_class_access(tenant_id);

-- Class Membership Types (junction)
ALTER TABLE public.class_membership_types ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_class_membership_types_tenant ON class_membership_types(tenant_id);

-- Professor Feedback
ALTER TABLE public.professor_feedback ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_professor_feedback_tenant ON professor_feedback(tenant_id);

-- Email Templates
ALTER TABLE public.email_templates ADD COLUMN tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE;
CREATE INDEX idx_email_templates_tenant ON email_templates(tenant_id);

-- ===============================================
-- 4. TENANT CONTEXT FUNCTION
-- Sets a PostgreSQL session variable used by RLS policies
-- ===============================================

CREATE OR REPLACE FUNCTION public.set_tenant_context(p_tenant_id UUID)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant_id', p_tenant_id::text, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current tenant from session
CREATE OR REPLACE FUNCTION public.current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
EXCEPTION
  WHEN OTHERS THEN RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- ===============================================
-- 5. REWRITE RLS POLICIES WITH TENANT ISOLATION
-- Drop old policies and create new tenant-aware ones
-- ===============================================

-- ----- PROFILES -----
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR (
      tenant_id = current_tenant_id()
      AND EXISTS (
        SELECT 1 FROM public.tenant_members tm
        WHERE tm.tenant_id = profiles.tenant_id
          AND tm.user_id = auth.uid()
          AND tm.role IN ('admin', 'instructor')
      )
    )
  );

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id AND tenant_id = current_tenant_id());

CREATE POLICY "profiles_admin_update"
  ON public.profiles FOR UPDATE
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = profiles.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

CREATE POLICY "profiles_insert"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- ----- LOCATIONS -----
DROP POLICY IF EXISTS "Anyone can view active locations" ON public.locations;
DROP POLICY IF EXISTS "Admin can manage locations" ON public.locations;

CREATE POLICY "locations_select"
  ON public.locations FOR SELECT
  USING (is_active = true AND tenant_id = current_tenant_id());

CREATE POLICY "locations_admin_manage"
  ON public.locations FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = locations.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- MEMBERSHIP TYPES -----
DROP POLICY IF EXISTS "Anyone can view active membership types" ON public.membership_types;
DROP POLICY IF EXISTS "Admin can manage membership types" ON public.membership_types;

CREATE POLICY "membership_types_select"
  ON public.membership_types FOR SELECT
  USING (is_active = true AND tenant_id = current_tenant_id());

CREATE POLICY "membership_types_admin_manage"
  ON public.membership_types FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = membership_types.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- MEMBERSHIPS -----
DROP POLICY IF EXISTS "Users can view own memberships" ON public.memberships;
DROP POLICY IF EXISTS "Admin can manage all memberships" ON public.memberships;

CREATE POLICY "memberships_select_own"
  ON public.memberships FOR SELECT
  USING (auth.uid() = user_id AND tenant_id = current_tenant_id());

CREATE POLICY "memberships_admin_manage"
  ON public.memberships FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = memberships.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- WAITLIST -----
DROP POLICY IF EXISTS "Users can view own waitlist entries" ON public.waitlist;
DROP POLICY IF EXISTS "Admin can manage waitlist" ON public.waitlist;

CREATE POLICY "waitlist_select_own"
  ON public.waitlist FOR SELECT
  USING (auth.uid() = user_id AND tenant_id = current_tenant_id());

CREATE POLICY "waitlist_admin_manage"
  ON public.waitlist FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = waitlist.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- INSTRUCTORS -----
DROP POLICY IF EXISTS "Anyone can view active instructors" ON public.instructors;
DROP POLICY IF EXISTS "Instructors can update own profile" ON public.instructors;
DROP POLICY IF EXISTS "Admin can manage instructors" ON public.instructors;

CREATE POLICY "instructors_select"
  ON public.instructors FOR SELECT
  USING (is_active = true AND tenant_id = current_tenant_id());

CREATE POLICY "instructors_update_own"
  ON public.instructors FOR UPDATE
  USING (auth.uid() = user_id AND tenant_id = current_tenant_id());

CREATE POLICY "instructors_admin_manage"
  ON public.instructors FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = instructors.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- CLASSES -----
DROP POLICY IF EXISTS "Anyone can view active classes" ON public.classes;
DROP POLICY IF EXISTS "Instructors can view their classes" ON public.classes;
DROP POLICY IF EXISTS "Admin can manage classes" ON public.classes;

CREATE POLICY "classes_select"
  ON public.classes FOR SELECT
  USING (is_active = true AND tenant_id = current_tenant_id());

CREATE POLICY "classes_admin_manage"
  ON public.classes FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = classes.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'instructor')
    )
  );

-- ----- ATTENDANCE -----
DROP POLICY IF EXISTS "Users can view own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can check in themselves" ON public.attendance;
DROP POLICY IF EXISTS "Instructors can view class attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admin and instructors can manage attendance" ON public.attendance;

CREATE POLICY "attendance_select_own"
  ON public.attendance FOR SELECT
  USING (auth.uid() = user_id AND tenant_id = current_tenant_id());

CREATE POLICY "attendance_insert_own"
  ON public.attendance FOR INSERT
  WITH CHECK (auth.uid() = user_id AND tenant_id = current_tenant_id());

CREATE POLICY "attendance_admin_manage"
  ON public.attendance FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = attendance.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'instructor')
    )
  );

-- ----- BELT PROGRESSION -----
DROP POLICY IF EXISTS "Users can view own belt progression" ON public.belt_progression;
DROP POLICY IF EXISTS "Admin can manage belt progression" ON public.belt_progression;

CREATE POLICY "belt_progression_select_own"
  ON public.belt_progression FOR SELECT
  USING (auth.uid() = user_id AND tenant_id = current_tenant_id());

CREATE POLICY "belt_progression_admin_manage"
  ON public.belt_progression FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = belt_progression.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- VIDEOS -----
DROP POLICY IF EXISTS "Members can view active videos" ON public.videos;
DROP POLICY IF EXISTS "Admin can manage videos" ON public.videos;

CREATE POLICY "videos_select"
  ON public.videos FOR SELECT
  USING (is_active = true AND tenant_id = current_tenant_id());

CREATE POLICY "videos_admin_manage"
  ON public.videos FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = videos.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- EVENTS -----
DROP POLICY IF EXISTS "Anyone can view active public events" ON public.events;
DROP POLICY IF EXISTS "Members can view active member events" ON public.events;
DROP POLICY IF EXISTS "Admin can manage events" ON public.events;

CREATE POLICY "events_select"
  ON public.events FOR SELECT
  USING (is_active = true AND tenant_id = current_tenant_id());

CREATE POLICY "events_admin_manage"
  ON public.events FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = events.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- EVENT RSVPS -----
DROP POLICY IF EXISTS "Users can view own RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Users can create own RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Users can update own RSVPs" ON public.event_rsvps;
DROP POLICY IF EXISTS "Admin can manage RSVPs" ON public.event_rsvps;

CREATE POLICY "event_rsvps_select_own"
  ON public.event_rsvps FOR SELECT
  USING (auth.uid() = user_id AND tenant_id = current_tenant_id());

CREATE POLICY "event_rsvps_insert_own"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id AND tenant_id = current_tenant_id());

CREATE POLICY "event_rsvps_update_own"
  ON public.event_rsvps FOR UPDATE
  USING (auth.uid() = user_id AND tenant_id = current_tenant_id());

CREATE POLICY "event_rsvps_admin_manage"
  ON public.event_rsvps FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = event_rsvps.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- ANNOUNCEMENTS -----
DROP POLICY IF EXISTS "Anyone can view active announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admin can manage announcements" ON public.announcements;

CREATE POLICY "announcements_select"
  ON public.announcements FOR SELECT
  USING (
    is_active = true
    AND tenant_id = current_tenant_id()
    AND (expires_at IS NULL OR expires_at > now())
  );

CREATE POLICY "announcements_admin_manage"
  ON public.announcements FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = announcements.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- NASEEHA -----
DROP POLICY IF EXISTS "Anyone can view active naseeha" ON public.naseeha;
DROP POLICY IF EXISTS "Admin can manage naseeha" ON public.naseeha;

CREATE POLICY "naseeha_select"
  ON public.naseeha FOR SELECT
  USING (is_active = true AND tenant_id = current_tenant_id());

CREATE POLICY "naseeha_admin_manage"
  ON public.naseeha FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = naseeha.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- PROMOTIONS -----
DROP POLICY IF EXISTS "Users can view their own promotions" ON public.promotions;
DROP POLICY IF EXISTS "Professors and admins can view all promotions" ON public.promotions;
DROP POLICY IF EXISTS "Professors can insert promotions for their classes" ON public.promotions;
DROP POLICY IF EXISTS "Admins can update promotions" ON public.promotions;

CREATE POLICY "promotions_select_own"
  ON public.promotions FOR SELECT
  USING (auth.uid() = user_id AND tenant_id = current_tenant_id());

CREATE POLICY "promotions_select_staff"
  ON public.promotions FOR SELECT
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = promotions.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'professor')
    )
  );

CREATE POLICY "promotions_insert_staff"
  ON public.promotions FOR INSERT
  WITH CHECK (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = promotions.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'professor')
    )
  );

CREATE POLICY "promotions_admin_manage"
  ON public.promotions FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = promotions.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- PROFESSOR CLASS ACCESS -----
DROP POLICY IF EXISTS "Professors can view their own class access" ON public.professor_class_access;
DROP POLICY IF EXISTS "Admins can manage professor access" ON public.professor_class_access;

CREATE POLICY "professor_access_select_own"
  ON public.professor_class_access FOR SELECT
  USING (auth.uid() = professor_user_id AND tenant_id = current_tenant_id());

CREATE POLICY "professor_access_admin_manage"
  ON public.professor_class_access FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = professor_class_access.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- CLASS MEMBERSHIP TYPES -----
DROP POLICY IF EXISTS "Authenticated can read class membership types" ON public.class_membership_types;
DROP POLICY IF EXISTS "Admins can manage class membership types" ON public.class_membership_types;

CREATE POLICY "class_membership_types_select"
  ON public.class_membership_types FOR SELECT
  USING (tenant_id = current_tenant_id());

CREATE POLICY "class_membership_types_admin_manage"
  ON public.class_membership_types FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = class_membership_types.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ----- PROFESSOR FEEDBACK -----
DROP POLICY IF EXISTS "Members can read own feedback" ON public.professor_feedback;
DROP POLICY IF EXISTS "Professors can insert feedback" ON public.professor_feedback;
DROP POLICY IF EXISTS "Professors can view sent feedback" ON public.professor_feedback;
DROP POLICY IF EXISTS "Members can update own feedback" ON public.professor_feedback;

CREATE POLICY "feedback_select_own"
  ON public.professor_feedback FOR SELECT
  USING (
    tenant_id = current_tenant_id()
    AND (
      user_id = auth.uid()
      OR professor_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM profiles child_profile
        JOIN profiles parent_profile ON child_profile.parent_guardian_id = parent_profile.id
        WHERE child_profile.user_id = professor_feedback.user_id
        AND parent_profile.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "feedback_insert_staff"
  ON public.professor_feedback FOR INSERT
  WITH CHECK (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = professor_feedback.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'professor')
    )
  );

CREATE POLICY "feedback_update_own"
  ON public.professor_feedback FOR UPDATE
  USING (user_id = auth.uid() AND tenant_id = current_tenant_id())
  WITH CHECK (user_id = auth.uid() AND tenant_id = current_tenant_id());

-- ----- EMAIL TEMPLATES -----
DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;

CREATE POLICY "email_templates_admin_manage"
  ON public.email_templates FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = email_templates.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );

-- ===============================================
-- 6. SEED DEFAULT TENANT & BACKFILL EXISTING DATA
-- ===============================================

-- Create the default tenant for existing club data.
-- IMPORTANT: Update the name/slug/owner below to match your club!
DO $$
DECLARE
  v_tenant_id UUID;
  v_owner_id UUID;
BEGIN
  -- Find the first admin user to set as owner
  SELECT user_id INTO v_owner_id
  FROM public.profiles
  WHERE role = 'admin'
  LIMIT 1;

  -- Create default tenant
  INSERT INTO public.tenants (name, slug, owner_user_id, primary_color)
  VALUES ('Default Club', 'default', v_owner_id, '#c5a456')
  RETURNING id INTO v_tenant_id;

  RAISE NOTICE 'Created default tenant with ID: %', v_tenant_id;

  -- Backfill all existing rows with the default tenant_id
  UPDATE public.profiles SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.locations SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.membership_types SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.memberships SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.waitlist SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.instructors SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.classes SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.attendance SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.belt_progression SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.videos SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.events SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.event_rsvps SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.announcements SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.naseeha SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.promotions SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.professor_class_access SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.class_membership_types SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.professor_feedback SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;
  UPDATE public.email_templates SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;

  -- Create tenant_members entries for all existing users
  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  SELECT v_tenant_id, p.user_id, p.role
  FROM public.profiles p
  WHERE p.user_id IS NOT NULL
  ON CONFLICT (tenant_id, user_id) DO NOTHING;

  RAISE NOTICE 'Backfilled % profiles with tenant_id', (SELECT COUNT(*) FROM profiles WHERE tenant_id = v_tenant_id);
  RAISE NOTICE 'Created % tenant_members entries', (SELECT COUNT(*) FROM tenant_members WHERE tenant_id = v_tenant_id);
END;
$$;
