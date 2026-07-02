-- Move price visibility to Products settings and enable by default.

UPDATE public.app_settings
SET
  category = 'products',
  value = 'true'::jsonb,
  label = 'Show product prices',
  description = 'Sell prices are visible on the public website and product catalog.',
  updated_at = now()
WHERE key = 'landing_show_product_prices';

INSERT INTO public.app_settings (key, value, category, label, description, value_type)
VALUES (
  'landing_show_product_prices',
  'true'::jsonb,
  'products',
  'Show product prices',
  'Sell prices are visible on the public website and product catalog.',
  'boolean'
)
ON CONFLICT (key) DO NOTHING;
