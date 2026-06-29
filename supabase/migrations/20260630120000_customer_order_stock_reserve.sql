-- Customers placing orders need stock reserved without broad stock-table RLS.
-- SECURITY DEFINER functions run the stock deduction atomically after auth checks.

CREATE OR REPLACE FUNCTION public.reserve_order_stock(
  p_order_id uuid,
  p_actor_id uuid,
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_item record;
  v_before numeric;
  v_after numeric;
  v_now timestamptz := now();
  v_label text;
BEGIN
  IF p_actor_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT id, order_number, customer_id, created_by, stock_reserved_at, status
  INTO v_order
  FROM public.sales_orders
  WHERE id = p_order_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found.';
  END IF;

  IF public.auth_role() = 'customer' THEN
    IF v_order.customer_id <> public.auth_uid()
      OR v_order.created_by <> public.auth_uid() THEN
      RAISE EXCEPTION 'Unauthorized';
    END IF;
  ELSIF public.auth_role() NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF v_order.stock_reserved_at IS NOT NULL THEN
    RETURN;
  END IF;

  v_label := COALESCE(v_order.order_number, p_order_id::text);

  FOR v_item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    SELECT quantity_available
    INTO v_before
    FROM public.stock
    WHERE product_id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'A stock record is missing for one of the products.';
    END IF;

    IF v_item.quantity > v_before THEN
      RAISE EXCEPTION 'Insufficient stock for one or more products.';
    END IF;

    v_after := v_before - v_item.quantity;

    UPDATE public.stock
    SET quantity_available = v_after,
        last_updated = v_now
    WHERE product_id = v_item.product_id;

    INSERT INTO public.stock_movements (
      product_id,
      movement_type,
      quantity,
      quantity_before,
      quantity_after,
      ref_type,
      ref_id,
      notes,
      created_by
    ) VALUES (
      v_item.product_id,
      'out',
      v_item.quantity,
      v_before,
      v_after,
      'sale',
      p_order_id,
      COALESCE(NULLIF(trim(p_note), ''), 'Order ' || v_label),
      p_actor_id
    );
  END LOOP;

  UPDATE public.sales_orders
  SET stock_reserved_at = v_now
  WHERE id = p_order_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.restore_order_stock(
  p_order_id uuid,
  p_actor_id uuid,
  p_note text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order record;
  v_item record;
  v_before numeric;
  v_after numeric;
  v_now timestamptz := now();
BEGIN
  IF p_actor_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF public.auth_role() NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT id, stock_reserved_at
  INTO v_order
  FROM public.sales_orders
  WHERE id = p_order_id;

  IF NOT FOUND OR v_order.stock_reserved_at IS NULL THEN
    RETURN;
  END IF;

  FOR v_item IN
    SELECT product_id, quantity
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    SELECT quantity_available
    INTO v_before
    FROM public.stock
    WHERE product_id = v_item.product_id
    FOR UPDATE;

    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    v_after := v_before + v_item.quantity;

    UPDATE public.stock
    SET quantity_available = v_after,
        last_updated = v_now
    WHERE product_id = v_item.product_id;

    INSERT INTO public.stock_movements (
      product_id,
      movement_type,
      quantity,
      quantity_before,
      quantity_after,
      ref_type,
      ref_id,
      notes,
      created_by
    ) VALUES (
      v_item.product_id,
      'in',
      v_item.quantity,
      v_before,
      v_after,
      'return',
      p_order_id,
      COALESCE(NULLIF(trim(p_note), ''), 'Stock restored for order'),
      p_actor_id
    );
  END LOOP;

  UPDATE public.sales_orders
  SET stock_reserved_at = NULL
  WHERE id = p_order_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_order_stock(uuid, uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.restore_order_stock(uuid, uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.reserve_order_stock(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.restore_order_stock(uuid, uuid, text) TO authenticated;
