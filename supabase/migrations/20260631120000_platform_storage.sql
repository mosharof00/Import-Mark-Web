-- Supabase Storage: platform-media bucket
--
-- Folder layout:
--   users/{user_id}.{ext}              → avatar_url (admins, managers, customers)
--   products/{product name}[ n].{ext}  → image_urls (products)
--   brands/{brand name}.{ext}          → logo_url (brands)
--
-- Store the public URL returned by getPublicUrl() in the matching table column.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'platform-media',
  'platform-media',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public read (product pages, brand logos, avatars in UI)
CREATE POLICY "Public read platform media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'platform-media');

-- Admin: full bucket access
CREATE POLICY "Admin manages platform media"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'platform-media'
  AND auth_role() = 'admin'
)
WITH CHECK (
  bucket_id = 'platform-media'
  AND auth_role() = 'admin'
);

-- Manager: catalog images (products + brands)
CREATE POLICY "Manager inserts catalog media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] IN ('products', 'brands')
);

CREATE POLICY "Manager updates catalog media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] IN ('products', 'brands')
)
WITH CHECK (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] IN ('products', 'brands')
);

CREATE POLICY "Manager deletes catalog media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] IN ('products', 'brands')
);

-- Any authenticated user: own profile image in users/
CREATE POLICY "Users insert own profile image"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'platform-media'
  AND (storage.foldername(name))[1] = 'users'
  AND name LIKE 'users/' || auth_uid()::text || '.%'
);

CREATE POLICY "Users update own profile image"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'platform-media'
  AND (storage.foldername(name))[1] = 'users'
  AND name LIKE 'users/' || auth_uid()::text || '.%'
)
WITH CHECK (
  bucket_id = 'platform-media'
  AND (storage.foldername(name))[1] = 'users'
  AND name LIKE 'users/' || auth_uid()::text || '.%'
);

CREATE POLICY "Users delete own profile image"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'platform-media'
  AND (storage.foldername(name))[1] = 'users'
  AND name LIKE 'users/' || auth_uid()::text || '.%'
);
