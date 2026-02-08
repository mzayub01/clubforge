-- ===============================================
-- ClubForge - Phase 3: Onboarding Schema
-- Tier rename + onboarding columns
-- ===============================================

-- 1. Update subscription_tier enum values
-- Rename 'free' → 'starter', 'enterprise' → 'elite'
ALTER TABLE public.tenants DROP CONSTRAINT IF EXISTS tenants_subscription_tier_check;

UPDATE public.tenants SET subscription_tier = 'starter' WHERE subscription_tier = 'free';
UPDATE public.tenants SET subscription_tier = 'elite' WHERE subscription_tier = 'enterprise';

ALTER TABLE public.tenants ADD CONSTRAINT tenants_subscription_tier_check
  CHECK (subscription_tier IN ('starter', 'pro', 'elite'));

-- 2. Add onboarding and billing columns
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- Index for Stripe customer lookup
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer ON tenants(stripe_customer_id);

-- 3. Allow authenticated users to create tenants (self-service signup)
-- Service role bypasses RLS, but we also need this for client-side provisioning fallback
CREATE POLICY "Authenticated users can create tenants"
  ON public.tenants FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

-- 4. Allow tenant owners/admins to insert tenant_members
CREATE POLICY "Tenant owners can insert members"
  ON public.tenant_members FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tenants t
      WHERE t.id = tenant_members.tenant_id
        AND t.owner_user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = tenant_members.tenant_id
        AND tm.user_id = auth.uid()
        AND tm.role = 'admin'
    )
  );
