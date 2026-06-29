-- Allow customers to read stock quantities for active catalog products
CREATE POLICY "Customer reads stock for active products"
ON public.stock
FOR SELECT
TO authenticated
USING (
  auth_role() = 'customer'
  AND EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = stock.product_id
      AND p.status = 'active'
  )
);
