-- =============================================
-- Migration 006: Convert class_type from enum to text
-- =============================================
-- The original enum ('bjj','kendo','strength','archery','other')
-- is too restrictive for a whitelabel SaaS platform where each
-- tenant dynamically generates class types from their rank schemas.
-- Converting to text allows any class type value.

ALTER TABLE classes
  ALTER COLUMN class_type TYPE text USING class_type::text;

-- Drop the old enum type (safe once no column references it)
DROP TYPE IF EXISTS class_type;
