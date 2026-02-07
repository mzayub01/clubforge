-- ===============================================
-- DojoHub - Comprehensive Gap Fix Migration
-- 
-- PREREQUISITES: Run enums FIRST in a separate execution:
--   ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'professor';
--   (plus gender_type and kids belt ranks)
--
-- This script is FULLY IDEMPOTENT - safe to run multiple times.
-- Every statement uses IF NOT EXISTS / IF EXISTS / exception handling.
-- ===============================================


-- ===============================================
-- 1. ADD MISSING COLUMNS TO EXISTING TABLES
-- ===============================================

-- Profiles: stripes, gender, is_kids_program
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripes integer DEFAULT 0;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_stripes_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_stripes_check CHECK (stripes >= 0 AND stripes <= 12);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender gender_type;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_kids_program BOOLEAN DEFAULT false;

-- Event RSVPs: full_name, email, phone, stripe_payment_id, additional_attendees, total_attendees
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS stripe_payment_id TEXT;
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS additional_attendees JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.event_rsvps ADD COLUMN IF NOT EXISTS total_attendees INTEGER DEFAULT 1;
-- Make user_id nullable (guest RSVPs)
ALTER TABLE public.event_rsvps ALTER COLUMN user_id DROP NOT NULL;

-- Events: custom_location
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS custom_location TEXT;

-- Locations: multisite support
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS allow_multisite boolean DEFAULT true;

-- Memberships: multisite support
ALTER TABLE public.memberships ADD COLUMN IF NOT EXISTS is_primary boolean DEFAULT true;

-- Membership types: multisite tier flag
ALTER TABLE public.membership_types ADD COLUMN IF NOT EXISTS is_multisite boolean DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_membership_types_is_multisite ON public.membership_types(is_multisite) WHERE is_multisite = true;

-- Waitlist: membership_type_id
ALTER TABLE public.waitlist ADD COLUMN IF NOT EXISTS membership_type_id uuid REFERENCES public.membership_types(id) ON DELETE CASCADE;


-- ===============================================
-- 2. CREATE MISSING TABLES (with tenant_id built in)
-- ===============================================

-- Promotions
CREATE TABLE IF NOT EXISTS public.promotions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    promoted_by UUID NOT NULL REFERENCES auth.users(id),
    class_id UUID REFERENCES public.classes(id),
    previous_belt TEXT NOT NULL,
    previous_stripes INTEGER NOT NULL DEFAULT 0,
    new_belt TEXT NOT NULL,
    new_stripes INTEGER NOT NULL DEFAULT 0,
    comments TEXT,
    promotion_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_promotions_user_id ON public.promotions(user_id);
CREATE INDEX IF NOT EXISTS idx_promotions_promoted_by ON public.promotions(promoted_by);
CREATE INDEX IF NOT EXISTS idx_promotions_tenant ON public.promotions(tenant_id);

-- Professor Class Access
CREATE TABLE IF NOT EXISTS public.professor_class_access (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    professor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(professor_user_id, class_id)
);
ALTER TABLE public.professor_class_access ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_professor_class_access_professor ON public.professor_class_access(professor_user_id);
CREATE INDEX IF NOT EXISTS idx_professor_class_access_class ON public.professor_class_access(class_id);
CREATE INDEX IF NOT EXISTS idx_professor_class_access_tenant ON public.professor_class_access(tenant_id);

-- Class Membership Types (junction)
CREATE TABLE IF NOT EXISTS public.class_membership_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    membership_type_id UUID NOT NULL REFERENCES membership_types(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, membership_type_id)
);
ALTER TABLE public.class_membership_types ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_class_membership_types_class_id ON public.class_membership_types(class_id);
CREATE INDEX IF NOT EXISTS idx_class_membership_types_membership_type_id ON public.class_membership_types(membership_type_id);
CREATE INDEX IF NOT EXISTS idx_class_membership_types_tenant ON public.class_membership_types(tenant_id);

-- Professor Feedback
CREATE TABLE IF NOT EXISTS public.professor_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    professor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feedback TEXT NOT NULL,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT FALSE
);
ALTER TABLE public.professor_feedback ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.professor_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_professor_id ON public.professor_feedback(professor_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON public.professor_feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_professor_feedback_tenant ON public.professor_feedback(tenant_id);

-- Email Templates
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    subject VARCHAR(255) NOT NULL,
    greeting TEXT NOT NULL,
    body_intro TEXT NOT NULL,
    body_details TEXT,
    body_action TEXT,
    body_closing TEXT NOT NULL,
    signature TEXT NOT NULL DEFAULT 'The DojoHub Team',
    button_text VARCHAR(100),
    button_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_email_templates_tenant ON public.email_templates(tenant_id);

-- Location Membership Configs
CREATE TABLE IF NOT EXISTS public.location_membership_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  membership_type_id uuid NOT NULL REFERENCES public.membership_types(id) ON DELETE CASCADE,
  capacity integer DEFAULT NULL,
  is_available boolean DEFAULT true,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(location_id, membership_type_id)
);
ALTER TABLE public.location_membership_configs ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_location_membership_configs_tenant ON public.location_membership_configs(tenant_id);


-- ===============================================
-- 3. HELPER FUNCTIONS
-- ===============================================

CREATE OR REPLACE FUNCTION get_membership_count(p_location_id uuid, p_membership_type_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT COUNT(*)::integer
  FROM public.memberships
  WHERE location_id = p_location_id
    AND membership_type_id = p_membership_type_id
    AND status IN ('active', 'pending');
$$;

CREATE OR REPLACE FUNCTION has_capacity_available(p_location_id uuid, p_membership_type_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    (
      SELECT 
        CASE 
          WHEN lmc.capacity IS NULL THEN true
          WHEN lmc.capacity > get_membership_count(p_location_id, p_membership_type_id) THEN true
          ELSE false
        END
      FROM public.location_membership_configs lmc
      WHERE lmc.location_id = p_location_id AND lmc.membership_type_id = p_membership_type_id
    ),
    true
  );
$$;

CREATE OR REPLACE FUNCTION update_email_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS email_templates_updated_at ON email_templates;
CREATE TRIGGER email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_email_templates_updated_at();


-- ===============================================
-- 4. SEED DEFAULT EMAIL TEMPLATES
-- ===============================================

INSERT INTO email_templates (template_key, name, description, subject, greeting, body_intro, body_details, body_action, body_closing, signature, button_text, button_url) VALUES
('welcome', 'Welcome Email', 'Sent to new members after registration', 
'Welcome, {{firstName}}!',
'Hi {{firstName}},',
'We''re thrilled to welcome you! Your registration at {{locationName}} has been successfully completed.',
'Location: {{locationName}} | Membership: {{membershipType}}',
'Before your first class, please remember to bring appropriate training gear, arrive 10 minutes early, and bring water and a positive attitude!',
'If you have any questions, please don''t hesitate to reach out. See you on the mats!',
'The DojoHub Team',
'Go to Dashboard',
'/dashboard'),

('event_confirmation', 'Event Confirmation', 'Sent after event booking/payment',
'Booking Confirmed: {{eventTitle}}',
'Hi {{firstName}},',
'Great news! Your booking for {{eventTitle}} has been confirmed.',
'Date: {{eventDate}} | Time: {{eventTime}} | Location: {{eventLocation}} | Ticket: {{ticketType}} | Amount Paid: {{amountPaid}}',
'Please arrive at least 15 minutes before the event starts.',
'We look forward to seeing you there!',
'The DojoHub Team',
'View Event Details',
'/events'),

('membership_activated', 'Membership Activated', 'Sent after successful Stripe payment',
'Your Membership is Now Active!',
'Hi {{firstName}},',
'Your payment has been processed successfully and your membership is now active!',
'Location: {{locationName}} | Plan: {{membershipType}} | Monthly: {{price}} | Started: {{startDate}}',
'Your subscription will automatically renew each month. You can manage your membership at any time from your dashboard.',
'Thank you for joining our community!',
'The DojoHub Team',
'Go to Dashboard',
'/dashboard'),

('payment_failed', 'Payment Failed', 'Sent when subscription payment fails',
'Action Required: Payment Failed for Your Membership',
'Hi {{firstName}},',
'We were unable to process your payment for your {{membershipType}} membership.',
'Amount Due: {{amountDue}} | Attempt: {{attemptCount}} of 3 | Next Attempt: {{nextAttemptDate}}',
'Please update your payment method to avoid any interruption to your membership.',
'If you have any questions or need assistance, please don''t hesitate to contact us.',
'The DojoHub Team',
'Update Payment Method',
'/dashboard/membership')

ON CONFLICT (template_key) DO NOTHING;


-- ===============================================
-- 5. FIX DANGEROUS SERVICE ROLE POLICIES
-- ===============================================

DROP POLICY IF EXISTS "Service role can manage tenants" ON public.tenants;
DROP POLICY IF EXISTS "Service role can manage tenant members" ON public.tenant_members;

-- Tenant owners can update their own tenant
DROP POLICY IF EXISTS "Tenant owners can update own tenant" ON public.tenants;
CREATE POLICY "Tenant owners can update own tenant"
  ON public.tenants FOR UPDATE
  USING (owner_user_id = auth.uid());


-- ===============================================
-- 6. RLS POLICIES FOR NEW TABLES (tenant-aware)
--    All use DROP IF EXISTS + CREATE for idempotency
-- ===============================================

-- ----- PROMOTIONS -----
DROP POLICY IF EXISTS "promotions_select_own" ON public.promotions;
DROP POLICY IF EXISTS "promotions_select_staff" ON public.promotions;
DROP POLICY IF EXISTS "promotions_insert_staff" ON public.promotions;
DROP POLICY IF EXISTS "promotions_admin_manage" ON public.promotions;
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
DROP POLICY IF EXISTS "professor_access_select_own" ON public.professor_class_access;
DROP POLICY IF EXISTS "professor_access_admin_manage" ON public.professor_class_access;
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
DROP POLICY IF EXISTS "class_membership_types_select" ON public.class_membership_types;
DROP POLICY IF EXISTS "class_membership_types_admin_manage" ON public.class_membership_types;
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
DROP POLICY IF EXISTS "feedback_select_own" ON public.professor_feedback;
DROP POLICY IF EXISTS "feedback_insert_staff" ON public.professor_feedback;
DROP POLICY IF EXISTS "feedback_update_own" ON public.professor_feedback;
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
DROP POLICY IF EXISTS "email_templates_admin_manage" ON public.email_templates;
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

-- ----- LOCATION MEMBERSHIP CONFIGS -----
DROP POLICY IF EXISTS "location_configs_select" ON public.location_membership_configs;
DROP POLICY IF EXISTS "location_configs_admin_manage" ON public.location_membership_configs;
DROP POLICY IF EXISTS "Anyone can view location membership configs" ON public.location_membership_configs;
DROP POLICY IF EXISTS "Admins can manage location membership configs" ON public.location_membership_configs;

CREATE POLICY "location_configs_select"
  ON public.location_membership_configs FOR SELECT
  USING (tenant_id = current_tenant_id());

CREATE POLICY "location_configs_admin_manage"
  ON public.location_membership_configs FOR ALL
  USING (
    tenant_id = current_tenant_id()
    AND EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = location_membership_configs.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );


-- ===============================================
-- 7. UNIQUE CONSTRAINTS FOR EVENT RSVPS
-- ===============================================

DO $$ BEGIN
  ALTER TABLE event_rsvps
    ADD CONSTRAINT event_rsvps_event_email_unique UNIQUE (event_id, email);
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS event_rsvps_event_user_unique
  ON event_rsvps (event_id, user_id)
  WHERE user_id IS NOT NULL;


-- ===============================================
-- 8. CREATE DEFAULT TENANT & BACKFILL ALL DATA
--    Creates tenant if none exists, then backfills
-- ===============================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_owner_id UUID;
BEGIN
  -- Check if a tenant already exists
  SELECT id INTO v_tenant_id
  FROM public.tenants
  LIMIT 1;

  -- If no tenant exists, create the default one
  IF v_tenant_id IS NULL THEN
    -- Find the first admin user to set as owner
    SELECT user_id INTO v_owner_id
    FROM public.profiles
    WHERE role = 'admin'
    LIMIT 1;

    -- If no admin exists, use any user
    IF v_owner_id IS NULL THEN
      SELECT user_id INTO v_owner_id
      FROM public.profiles
      LIMIT 1;
    END IF;

    INSERT INTO public.tenants (name, slug, owner_user_id, primary_color)
    VALUES ('Default Club', 'default', v_owner_id, '#c5a456')
    RETURNING id INTO v_tenant_id;

    RAISE NOTICE 'Created new default tenant with ID: %', v_tenant_id;
  ELSE
    RAISE NOTICE 'Using existing tenant with ID: %', v_tenant_id;
  END IF;

  -- Backfill all tables with the tenant_id
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
  UPDATE public.location_membership_configs SET tenant_id = v_tenant_id WHERE tenant_id IS NULL;

  -- Ensure all users have tenant_members entries
  INSERT INTO public.tenant_members (tenant_id, user_id, role)
  SELECT v_tenant_id, p.user_id, p.role
  FROM public.profiles p
  WHERE p.user_id IS NOT NULL
  ON CONFLICT (tenant_id, user_id) DO NOTHING;

  RAISE NOTICE 'Backfill complete!';
  RAISE NOTICE 'Profiles updated: %', (SELECT COUNT(*) FROM profiles WHERE tenant_id = v_tenant_id);
  RAISE NOTICE 'Tenant members: %', (SELECT COUNT(*) FROM tenant_members WHERE tenant_id = v_tenant_id);
END;
$$;


-- Table comments
COMMENT ON TABLE public.promotions IS 'Tracks belt promotion history for members';
COMMENT ON TABLE public.professor_class_access IS 'Controls which classes each professor can grade';
COMMENT ON TABLE public.professor_feedback IS 'Stores feedback comments from professors to members';
COMMENT ON COLUMN public.profiles.is_kids_program IS 'If true, member uses kids belt system';
COMMENT ON COLUMN public.profiles.stripes IS 'Number of stripes on the belt (0-12)';
