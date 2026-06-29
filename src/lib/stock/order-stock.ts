import "server-only"

import { createClient } from "@/lib/supabase/server"
import type { StockReserveOn } from "@/lib/settings/keys"

type ActionResult = { error?: string } | void

export async function isOrderStockReserved(
  supabase: Awaited<ReturnType<typeof createClient>>,
  orderId: string
): Promise<boolean> {
  const { data: order } = await supabase
    .from("sales_orders")
    .select("stock_reserved_at")
    .eq("id", orderId)
    .maybeSingle()

  return Boolean(order?.stock_reserved_at)
}

/**
 * Deducts stock for all line items on an order and records movements.
 * Uses a SECURITY DEFINER RPC so customers can reserve stock on their own orders.
 * Idempotent — skips if stock was already reserved.
 */
export async function reserveOrderStock(
  orderId: string,
  actorId: string,
  note: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.rpc("reserve_order_stock", {
    p_order_id: orderId,
    p_actor_id: actorId,
    p_note: note,
  })

  if (error) return { error: error.message }
}

/** Restores stock when a reserved order is rejected or cancelled. */
export async function restoreOrderStock(
  orderId: string,
  actorId: string,
  note: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase.rpc("restore_order_stock", {
    p_order_id: orderId,
    p_actor_id: actorId,
    p_note: note,
  })

  if (error) return { error: error.message }
}

export async function maybeReserveStockForStatus(
  orderId: string,
  newStatus: StockReserveOn,
  reserveOn: StockReserveOn,
  actorId: string,
  note: string
): Promise<ActionResult> {
  if (newStatus !== reserveOn) return
  return reserveOrderStock(orderId, actorId, note)
}
