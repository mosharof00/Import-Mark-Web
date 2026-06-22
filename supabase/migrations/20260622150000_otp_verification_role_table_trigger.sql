-- Safety-net: when a manager or customer confirms their email (OTP), ensure the
-- matching public.managers / public.customers row exists. Normal server-action
-- flows may already insert the row; ON CONFLICT DO NOTHING keeps this idempotent.

CREATE OR REPLACE FUNCTION public.handle_auth_user_email_confirmed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  user_role text;
  meta jsonb;
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

  ELSIF user_role = 'customer' THEN
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
      'pending',
      NULL
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_auth_user_email_confirmed() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.handle_auth_user_email_confirmed() TO supabase_auth_admin;

DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;

CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_email_confirmed();
