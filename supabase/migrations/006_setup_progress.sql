-- ==============================================
-- ClubForge Migration 006 — Setup Progress
-- Track club onboarding completion
-- ==============================================

-- Add onboarding tracking to tenants
ALTER TABLE public.tenants
    ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    ADD COLUMN IF NOT EXISTS onboarding_dismissed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Comment for clarity
COMMENT ON COLUMN public.tenants.onboarding_completed_at IS 'Timestamp when all setup steps were completed';
COMMENT ON COLUMN public.tenants.onboarding_dismissed_at IS 'Timestamp when owner manually dismissed the setup wizard';
