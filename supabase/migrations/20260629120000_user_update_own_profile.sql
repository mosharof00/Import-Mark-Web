-- Allow managers to update their own profile row (customers already can).
CREATE POLICY "Manager can update own record"
  ON public.managers
  FOR UPDATE
  USING (id = auth_uid())
  WITH CHECK (id = auth_uid());

-- Allow admins to update their own row without requiring admin-wide ALL semantics
-- for self-service profile edits (read policy already exists).
CREATE POLICY "Admin can update own record"
  ON public.admins
  FOR UPDATE
  USING (id = auth_uid())
  WITH CHECK (id = auth_uid());
