-- Managers can log status history when placing orders they created.
-- Admins already have full access via "Admin sees all order history".
CREATE POLICY "Manager inserts order history for own orders"
ON public.order_status_history
FOR INSERT
TO authenticated
WITH CHECK (
  auth_role() = 'manager'
  AND changed_by = auth_uid()
  AND order_id IN (
    SELECT id
    FROM public.sales_orders
    WHERE created_by = auth_uid()
  )
);
