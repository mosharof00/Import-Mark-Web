-- Performance indexes for common list filters, sorts, and joins.
-- Postgres does not auto-index foreign keys; list pages filter heavily on status + created_at.

-- sales_orders: admin/manager/customer order tabs & timelines
CREATE INDEX IF NOT EXISTS sales_orders_status_created_at_idx
  ON public.sales_orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS sales_orders_created_by_status_created_at_idx
  ON public.sales_orders (created_by, status, created_at DESC);

CREATE INDEX IF NOT EXISTS sales_orders_customer_id_created_at_idx
  ON public.sales_orders (customer_id, created_at DESC);

CREATE INDEX IF NOT EXISTS sales_orders_outstanding_due_idx
  ON public.sales_orders (due_amount DESC)
  WHERE due_amount > 0
    AND status NOT IN ('cancelled', 'rejected');

CREATE INDEX IF NOT EXISTS sales_orders_delivered_created_at_idx
  ON public.sales_orders (created_at DESC)
  WHERE status = 'delivered';

-- products / customers / managers catalog & account lists
CREATE INDEX IF NOT EXISTS products_status_created_at_idx
  ON public.products (status, created_at DESC);

CREATE INDEX IF NOT EXISTS products_created_by_status_created_at_idx
  ON public.products (created_by, status, created_at DESC);

CREATE INDEX IF NOT EXISTS customers_status_created_at_idx
  ON public.customers (status, created_at DESC);

CREATE INDEX IF NOT EXISTS managers_status_created_at_idx
  ON public.managers (status, created_at DESC);

-- notifications: shell unread badge + inbox
CREATE INDEX IF NOT EXISTS notifications_user_id_created_at_idx
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS notifications_user_id_unread_idx
  ON public.notifications (user_id)
  WHERE is_read = false;

-- payments history & per-order lookups
CREATE INDEX IF NOT EXISTS payments_payment_date_created_at_idx
  ON public.payments (payment_date DESC, created_at DESC);

CREATE INDEX IF NOT EXISTS payments_order_id_created_at_idx
  ON public.payments (order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS payments_customer_id_created_at_idx
  ON public.payments (customer_id, created_at DESC);

-- FK / detail joins that lack indexes by default
CREATE INDEX IF NOT EXISTS order_items_order_id_idx
  ON public.order_items (order_id);

CREATE INDEX IF NOT EXISTS order_status_history_order_id_changed_at_idx
  ON public.order_status_history (order_id, changed_at DESC);

CREATE INDEX IF NOT EXISTS stock_quantity_available_idx
  ON public.stock (quantity_available);

-- imports / suppliers list pages
CREATE INDEX IF NOT EXISTS import_shipments_status_created_at_idx
  ON public.import_shipments (status, created_at DESC);

CREATE INDEX IF NOT EXISTS suppliers_is_active_created_at_idx
  ON public.suppliers (is_active, created_at DESC);
