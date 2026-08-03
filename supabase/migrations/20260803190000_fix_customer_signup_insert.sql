-- Fix customer signup profile creation.
--
-- Root causes:
-- 1) service_role had no table privileges on public.customers (admin client
--    upsert failed with "permission denied for table customers").
-- 2) Confirm-email trigger only inserted when app_metadata.role was already
--    'customer', but role is set AFTER/AFTER verify in app code — often too late
--    for the first confirmation update.
-- 3) Authenticated users had INSERT privilege but no RLS INSERT policy.

GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO service_role;

DROP POLICY IF EXISTS "Customer inserts own record" ON public.customers;
CREATE POLICY "Customer inserts own record"
ON public.customers
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_auth_user_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_role text;
  meta jsonb;
  customer_status public.user_status := 'pending';
  auto_activate boolean := false;
BEGIN
  -- Only fire on first email confirmation.
  IF OLD.email_confirmed_at IS NOT NULL OR NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;

  user_role := NEW.raw_app_meta_data ->> 'role';
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);

  IF user_role = 'manager' THEN
    INSERT INTO public.managers (id, email, full_name, status)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(meta ->> 'full_name', 'Manager'),
      'active'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
  END IF;

  IF user_role = 'admin' THEN
    RETURN NEW;
  END IF;

  -- Self-registration / customer role (role may still be null at confirm time).
  IF EXISTS (SELECT 1 FROM public.admins a WHERE a.id = NEW.id) THEN
    RETURN NEW;
  END IF;
  IF EXISTS (SELECT 1 FROM public.managers m WHERE m.id = NEW.id) THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE((value #>> '{}')::boolean, false)
  INTO auto_activate
  FROM public.app_settings
  WHERE key = 'customer_auto_activate_on_signup';

  IF auto_activate THEN
    customer_status := 'active';
  END IF;

  INSERT INTO public.customers (
    id,
    email,
    full_name,
    company_name,
    phone,
    status,
    created_by
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(meta ->> 'full_name', 'Customer'),
    NULLIF(meta ->> 'company_name', ''),
    NULLIF(meta ->> 'phone', ''),
    customer_status,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_auth_user_email_confirmed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_auth_user_email_confirmed() TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.handle_auth_user_email_confirmed() TO postgres;
GRANT EXECUTE ON FUNCTION public.handle_auth_user_email_confirmed() TO service_role;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_email_confirmed();

-- Backfill confirmed customer auth users that are missing a customers row.
INSERT INTO public.customers (
  id,
  email,
  full_name,
  company_name,
  phone,
  status,
  created_by
)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data ->> 'full_name', 'Customer'),
  NULLIF(u.raw_user_meta_data ->> 'company_name', ''),
  NULLIF(u.raw_user_meta_data ->> 'phone', ''),
  CASE
    WHEN COALESCE(
      (
        SELECT (s.value #>> '{}')::boolean
        FROM public.app_settings s
        WHERE s.key = 'customer_auto_activate_on_signup'
      ),
      false
    ) THEN 'active'::public.user_status
    ELSE 'pending'::public.user_status
  END,
  NULL
FROM auth.users u
WHERE u.email_confirmed_at IS NOT NULL
  AND COALESCE(u.raw_app_meta_data ->> 'role', 'customer') = 'customer'
  AND NOT EXISTS (SELECT 1 FROM public.admins a WHERE a.id = u.id)
  AND NOT EXISTS (SELECT 1 FROM public.managers m WHERE m.id = u.id)
  AND NOT EXISTS (SELECT 1 FROM public.customers c WHERE c.id = u.id);
