-- Managers can log status history when fulfilling any in-progress order,
-- not only orders they personally created.

DROP POLICY IF EXISTS "Manager inserts order history for own orders"
ON public.order_status_history;

CREATE POLICY "Manager inserts order status history"
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
      OR status IN (
        'approved',
        'processing',
        'ready_for_pickup',
        'out_for_delivery',
        'delivered'
      )
  )
);
