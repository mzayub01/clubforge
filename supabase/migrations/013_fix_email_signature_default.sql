-- ===============================================
-- Fix email_templates signature default
-- Changes the column default from 'The DojoHub Team'
-- to a neutral 'The Team' fallback. Existing templates
-- created via onboarding already use the correct tenant name.
-- ===============================================

-- 1. Update the column default for new rows
ALTER TABLE public.email_templates
    ALTER COLUMN signature SET DEFAULT 'The Team';

-- 2. Fix any existing templates that still have the old branding.
--    Replace 'The DojoHub Team' with the actual tenant name.
UPDATE public.email_templates et
SET signature = 'The ' || t.name || ' Team'
FROM public.tenants t
WHERE et.tenant_id = t.id
  AND et.signature = 'The DojoHub Team';
