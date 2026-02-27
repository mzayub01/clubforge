-- ===============================================
-- Migration: Make email_templates unique per tenant
-- 
-- The original table had UNIQUE(template_key) which prevents
-- multiple tenants from having the same template_key.
-- Change to UNIQUE(template_key, tenant_id) so each tenant
-- can have their own set of templates.
-- ===============================================

-- Drop the global unique constraint on template_key
ALTER TABLE public.email_templates DROP CONSTRAINT IF EXISTS email_templates_template_key_key;

-- Add per-tenant unique constraint (handles NULL tenant_id for global templates)
CREATE UNIQUE INDEX IF NOT EXISTS email_templates_tenant_template_key_unique
  ON public.email_templates (template_key, tenant_id);

-- Also ensure global (NULL tenant_id) templates remain unique
CREATE UNIQUE INDEX IF NOT EXISTS email_templates_global_template_key_unique
  ON public.email_templates (template_key)
  WHERE tenant_id IS NULL;
