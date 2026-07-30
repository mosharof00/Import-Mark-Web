-- Delivery proof image on sales orders + manager stock adjust setting.

ALTER TABLE public.sales_orders
ADD COLUMN IF NOT EXISTS delivery_image_url text;

INSERT INTO public.app_settings (key, value, category, label, description, value_type)
VALUES (
  'manager_can_adjust_stock',
  'false'::jsonb,
  'inventory',
  'Manager can adjust stock quantity',
  'Managers can use the Adjust button on Inventory to change product quantities.',
  'boolean'
)
ON CONFLICT (key) DO NOTHING;

-- Managers may upload delivery proof photos under deliveries/
CREATE POLICY "Manager inserts delivery media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] = 'deliveries'
);

CREATE POLICY "Manager updates delivery media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] = 'deliveries'
)
WITH CHECK (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] = 'deliveries'
);

CREATE POLICY "Manager deletes delivery media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] = 'deliveries'
);
