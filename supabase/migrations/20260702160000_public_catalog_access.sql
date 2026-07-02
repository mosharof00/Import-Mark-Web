-- Public landing catalog: allow anonymous visitors to read active products.

GRANT SELECT ON public.products TO anon, service_role;
GRANT SELECT ON public.categories TO anon, service_role;
GRANT SELECT ON public.brands TO anon, service_role;
GRANT SELECT ON public.stock TO anon, service_role;
GRANT SELECT ON public.app_settings TO anon, service_role;
GRANT SELECT ON public.platform_currency TO anon, service_role;

CREATE POLICY "Public reads categories"
ON public.categories FOR SELECT
TO anon
USING (true);

CREATE POLICY "Public reads active brands"
ON public.brands FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "Public reads stock for active products"
ON public.stock FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.products p
    WHERE p.id = stock.product_id
      AND p.status = 'active'
  )
);

CREATE POLICY "Public reads landing settings"
ON public.app_settings FOR SELECT
TO anon
USING (
  key IN (
    'landing_show_product_prices',
    'public_customer_registration',
    'customer_can_place_orders'
  )
);

CREATE POLICY "Public reads platform currency"
ON public.platform_currency FOR SELECT
TO anon
USING (true);
