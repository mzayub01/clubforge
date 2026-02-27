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

-- ===============================================
-- Backfill: Assign orphaned templates to existing tenants
-- 
-- Templates seeded before multi-tenancy have tenant_id IS NULL.
-- For each tenant, duplicate the global templates as tenant-owned.
-- This ensures they show up in the admin dashboard.
-- ===============================================

DO $$
DECLARE
  v_tenant_id UUID;
  v_template RECORD;
BEGIN
  -- For each tenant that doesn't have its own templates yet
  FOR v_tenant_id IN
    SELECT t.id FROM public.tenants t
    WHERE NOT EXISTS (
      SELECT 1 FROM public.email_templates et
      WHERE et.tenant_id = t.id
      LIMIT 1
    )
  LOOP
    -- Copy each global template for this tenant
    FOR v_template IN
      SELECT template_key, name, description, subject, greeting, 
             body_intro, body_details, body_action, body_closing, 
             signature, button_text, button_url, is_active
      FROM public.email_templates
      WHERE tenant_id IS NULL
    LOOP
      INSERT INTO public.email_templates (
        tenant_id, template_key, name, description, subject, greeting,
        body_intro, body_details, body_action, body_closing,
        signature, button_text, button_url, is_active
      ) VALUES (
        v_tenant_id, v_template.template_key, v_template.name, 
        v_template.description, v_template.subject, v_template.greeting,
        v_template.body_intro, v_template.body_details, v_template.body_action,
        v_template.body_closing, v_template.signature, v_template.button_text,
        v_template.button_url, v_template.is_active
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Seeded email templates for tenant: %', v_tenant_id;
  END LOOP;
END;
$$;
