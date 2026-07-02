-- Align storage RLS with flat bucket folders: users/, products/, brands/

DROP POLICY IF EXISTS "Users insert own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;

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
