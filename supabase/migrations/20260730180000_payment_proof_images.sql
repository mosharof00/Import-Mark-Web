-- Payment proof images + gateway link on each payment row.

ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS proof_image_url text,
ADD COLUMN IF NOT EXISTS payment_gateway_id uuid REFERENCES public.payment_gateways(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS payments_payment_gateway_id_idx
  ON public.payments (payment_gateway_id);

-- Managers/admins may upload payment proof photos under payments/
CREATE POLICY "Manager inserts payment media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] = 'payments'
);

CREATE POLICY "Manager updates payment media"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] = 'payments'
)
WITH CHECK (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] = 'payments'
);

CREATE POLICY "Manager deletes payment media"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'platform-media'
  AND auth_role() = 'manager'
  AND (storage.foldername(name))[1] = 'payments'
);
