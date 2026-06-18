-- ===============================================
-- ClubForge - Add custom_domain to tenants
-- Elite tier feature: custom domain support
-- ===============================================

-- Add nullable unique custom_domain column
ALTER TABLE tenants ADD COLUMN custom_domain TEXT UNIQUE;

-- Partial index for efficient lookups (only index non-null values)
CREATE INDEX idx_tenants_custom_domain ON tenants (custom_domain) WHERE custom_domain IS NOT NULL;

-- Example usage:
-- UPDATE tenants SET custom_domain = 'myclub.com' WHERE slug = 'myclub';
