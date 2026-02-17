-- ===============================================
-- Migration: Configurable Rank/Belt Schemas
-- Allows each tenant to define their own belt/rank progression system
-- ===============================================

-- -----------------------------------------------
-- 1. RANK SCHEMAS TABLE
-- Each tenant can have multiple schemas (e.g. Adult BJJ, Kids BJJ, Karate)
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS public.rank_schemas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    is_default BOOLEAN DEFAULT false,
    has_stripes BOOLEAN DEFAULT true,
    max_stripes INTEGER DEFAULT 4,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rank_schemas ENABLE ROW LEVEL SECURITY;

-- Anyone in the tenant can read rank schemas
CREATE POLICY "Tenant members can view rank schemas"
    ON public.rank_schemas FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = rank_schemas.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.is_active = true
        )
    );

-- Admins can manage rank schemas
CREATE POLICY "Tenant admins can manage rank schemas"
    ON public.rank_schemas FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.tenant_members tm
            WHERE tm.tenant_id = rank_schemas.tenant_id
              AND tm.user_id = auth.uid()
              AND tm.role = 'admin'
        )
    );

CREATE INDEX idx_rank_schemas_tenant ON public.rank_schemas(tenant_id);

-- -----------------------------------------------
-- 2. RANK LEVELS TABLE
-- Individual ranks within a schema, ordered by sort_order
-- -----------------------------------------------

CREATE TABLE IF NOT EXISTS public.rank_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schema_id UUID NOT NULL REFERENCES public.rank_schemas(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color_hex TEXT NOT NULL DEFAULT '#FFFFFF',
    bar_color_hex TEXT NOT NULL DEFAULT '#1A1A1A',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.rank_levels ENABLE ROW LEVEL SECURITY;

-- Anyone who can see the schema can see its levels
CREATE POLICY "Tenant members can view rank levels"
    ON public.rank_levels FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.rank_schemas rs
            JOIN public.tenant_members tm ON tm.tenant_id = rs.tenant_id
            WHERE rs.id = rank_levels.schema_id
              AND tm.user_id = auth.uid()
              AND tm.is_active = true
        )
    );

-- Admins can manage rank levels
CREATE POLICY "Tenant admins can manage rank levels"
    ON public.rank_levels FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.rank_schemas rs
            JOIN public.tenant_members tm ON tm.tenant_id = rs.tenant_id
            WHERE rs.id = rank_levels.schema_id
              AND tm.user_id = auth.uid()
              AND tm.role = 'admin'
        )
    );

CREATE INDEX idx_rank_levels_schema ON public.rank_levels(schema_id);

-- -----------------------------------------------
-- 3. ADD FK COLUMNS TO PROFILES
-- -----------------------------------------------

ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS rank_schema_id UUID REFERENCES public.rank_schemas(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS rank_level_id UUID REFERENCES public.rank_levels(id) ON DELETE SET NULL;

-- -----------------------------------------------
-- 4. ADD TENANT_ID TO RANK_SCHEMAS for easy access
-- (promotions already has tenant_id from earlier migration)
-- -----------------------------------------------

-- Add rank_level FKs to promotions (keep old TEXT columns for backwards compat)
ALTER TABLE public.promotions
    ADD COLUMN IF NOT EXISTS previous_rank_level_id UUID REFERENCES public.rank_levels(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS new_rank_level_id UUID REFERENCES public.rank_levels(id) ON DELETE SET NULL;

-- -----------------------------------------------
-- 5. COMMENTS
-- -----------------------------------------------

COMMENT ON TABLE public.rank_schemas IS 'Per-tenant rank/belt system definitions (e.g. BJJ Adult, Karate, Custom)';
COMMENT ON TABLE public.rank_levels IS 'Individual rank levels within a schema, ordered by sort_order';
COMMENT ON COLUMN public.profiles.rank_schema_id IS 'Which rank schema this member uses (null = legacy/default)';
COMMENT ON COLUMN public.profiles.rank_level_id IS 'Current rank level (null = use legacy belt_rank column)';
