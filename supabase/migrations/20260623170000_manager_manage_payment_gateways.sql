-- Managers need full CRUD on payment gateways (not just read active ones).
CREATE POLICY "Manager manages payment gateways"
ON public.payment_gateways
FOR ALL
TO authenticated
USING (auth_role() = 'manager')
WITH CHECK (auth_role() = 'manager');
