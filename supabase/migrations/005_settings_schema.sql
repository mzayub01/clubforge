-- =============================================
-- Migration 005: Settings & Stripe Connect indexes
-- Phase 4: Member Experience
-- =============================================

-- Index for looking up tenants by their Stripe Connect account
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_account_id 
  ON public.tenants(stripe_account_id) 
  WHERE stripe_account_id IS NOT NULL;

-- Add stripe_connect_onboarding_complete flag to track if the club
-- has finished Stripe Connect onboarding (charges_enabled = true)
ALTER TABLE public.tenants 
  ADD COLUMN IF NOT EXISTS stripe_connect_enabled BOOLEAN DEFAULT false;

-- Add tagline column for branding
ALTER TABLE public.tenants
  ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Ensure settings JSONB has sensible defaults for new tenants
-- (existing tenants already have settings = '{}')
COMMENT ON COLUMN public.tenants.settings IS 
  'Tenant settings JSON. Expected keys: waiver_text, etiquette_text, registration_message, require_profile_photo';
