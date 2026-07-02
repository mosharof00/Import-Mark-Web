INSERT INTO public.app_settings (key, value, category, label, description, value_type) VALUES
  (
    'landing_show_product_prices',
    'false'::jsonb,
    'general',
    'Show prices on landing page',
    'When enabled, product sell prices are visible to visitors on the public website.',
    'boolean'
  )
ON CONFLICT (key) DO NOTHING;
