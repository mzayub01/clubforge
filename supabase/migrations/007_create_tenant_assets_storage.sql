-- =============================================
-- Create tenant-assets storage bucket for club logos
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenant-assets',
  'tenant-assets',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow authenticated users to upload tenant assets
CREATE POLICY "Allow authenticated uploads to tenant-assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'tenant-assets');

-- 3. Allow public read access (logos are public)
CREATE POLICY "Allow public read access to tenant-assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'tenant-assets');

-- 4. Allow authenticated users to update (upsert) their uploads
CREATE POLICY "Allow authenticated updates to tenant-assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'tenant-assets');

-- 5. Allow authenticated users to delete their uploads
CREATE POLICY "Allow authenticated deletes to tenant-assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'tenant-assets');
