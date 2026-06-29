-- Platform currency (single row)
CREATE TABLE public.platform_currency (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  currency_code text NOT NULL DEFAULT 'BDT',
  currency_name text NOT NULL DEFAULT 'Bangladeshi Taka',
  symbol text NOT NULL DEFAULT E'\u09F3',
  country text NOT NULL DEFAULT 'Bangladesh',
  country_code text NOT NULL DEFAULT 'BD',
  flag text NOT NULL DEFAULT E'\U0001F1E7\U0001F1E9',
  locale text NOT NULL DEFAULT 'en-IN',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id)
);

INSERT INTO public.platform_currency (id) VALUES (true);

ALTER TABLE public.platform_currency ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read platform currency"
ON public.platform_currency FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin updates platform currency"
ON public.platform_currency FOR UPDATE
TO authenticated
USING (auth_role() = 'admin')
WITH CHECK (auth_role() = 'admin');

-- Application settings (key-value with metadata)
CREATE TABLE public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  category text NOT NULL,
  label text NOT NULL,
  description text,
  value_type text NOT NULL CHECK (
    value_type IN ('boolean', 'number', 'text', 'order_status')
  ),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users (id)
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated read app settings"
ON public.app_settings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admin manages app settings"
ON public.app_settings FOR ALL
TO authenticated
USING (auth_role() = 'admin')
WITH CHECK (auth_role() = 'admin');

INSERT INTO public.app_settings (key, value, category, label, description, value_type) VALUES
  ('public_customer_registration', 'true'::jsonb, 'general', 'Public customer registration', 'When enabled, visitors can create a customer account from the login page.', 'boolean'),
  ('manager_can_approve_orders', 'false'::jsonb, 'orders', 'Manager can approve orders', 'Managers can approve or reject any order in pending approval.', 'boolean'),
  ('customer_can_place_orders', 'true'::jsonb, 'orders', 'Customer self-ordering', 'Customers can place their own orders from the portal.', 'boolean'),
  ('require_advance_payment', 'false'::jsonb, 'orders', 'Require advance payment', 'An advance payment is required when placing a new order.', 'boolean'),
  ('min_advance_payment_percent', '0'::jsonb, 'orders', 'Minimum advance payment (%)', 'Minimum advance as a percentage of order total when advance payment is required.', 'number'),
  ('manager_can_override_sell_price', 'true'::jsonb, 'orders', 'Manager can override sell price', 'Managers can change unit prices while placing orders.', 'boolean'),
  ('stock_reserve_on', '"pending_approval"'::jsonb, 'inventory', 'Reserve stock when order reaches', 'Deduct available stock when an order hits this status.', 'order_status'),
  ('manager_can_approve_products', 'false'::jsonb, 'products', 'Manager can approve products', 'Managers can approve or reject product submissions.', 'boolean'),
  ('product_requires_approval', 'true'::jsonb, 'products', 'Require product approval', 'New manager-submitted products start as pending approval.', 'boolean'),
  ('customer_show_stock_quantity', 'false'::jsonb, 'products', 'Show stock count to customers', 'Customers see exact quantities instead of in-stock / out-of-stock only.', 'boolean'),
  ('customer_auto_activate_on_signup', 'true'::jsonb, 'customers', 'Auto-activate new customers', 'Self-registered customers are active immediately after email verification.', 'boolean'),
  ('manager_can_activate_customers', 'false'::jsonb, 'customers', 'Manager can activate customers', 'Managers can activate pending customer accounts.', 'boolean');

-- Track when stock was reserved for an order
ALTER TABLE public.sales_orders
ADD COLUMN IF NOT EXISTS stock_reserved_at timestamptz;

-- Customer can place own orders
CREATE POLICY "Customer creates own orders"
ON public.sales_orders FOR INSERT
TO authenticated
WITH CHECK (
  auth_role() = 'customer'
  AND customer_id = auth_uid()
  AND created_by = auth_uid()
);

CREATE POLICY "Customer inserts own order items"
ON public.order_items FOR INSERT
TO authenticated
WITH CHECK (
  auth_role() = 'customer'
  AND EXISTS (
    SELECT 1 FROM public.sales_orders so
    WHERE so.id = order_items.order_id
      AND so.customer_id = auth_uid()
      AND so.created_by = auth_uid()
  )
);

CREATE POLICY "Customer inserts own order status history"
ON public.order_status_history FOR INSERT
TO authenticated
WITH CHECK (
  auth_role() = 'customer'
  AND changed_by = auth_uid()
  AND EXISTS (
    SELECT 1 FROM public.sales_orders so
    WHERE so.id = order_status_history.order_id
      AND so.customer_id = auth_uid()
  )
);

CREATE POLICY "Customer inserts own payments"
ON public.payments FOR INSERT
TO authenticated
WITH CHECK (
  auth_role() = 'customer'
  AND customer_id = auth_uid()
  AND EXISTS (
    SELECT 1 FROM public.sales_orders so
    WHERE so.id = payments.order_id
      AND so.customer_id = auth_uid()
  )
);
