import "server-only"

import { createClient } from "@/lib/supabase/server"
import { roundMoney } from "@/lib/imports/landed-cost"

/**
 * Adds imported quantities to stock the first time a shipment is marked cleared.
 * Idempotent: skips if import stock movements already exist for this shipment.
 */
export async function applyClearedStock(
  shipmentId: string,
  actorId: string,
  shipmentRef: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const { data: existing } = await supabase
    .from("stock_movements")
    .select("id")
    .eq("ref_type", "import")
    .eq("ref_id", shipmentId)
    .limit(1)

  if (existing && existing.length > 0) return {}

  const { data: items, error: itemsError } = await supabase
    .from("import_shipment_items")
    .select("product_id, quantity_imported")
    .eq("shipment_id", shipmentId)

  if (itemsError) return { error: itemsError.message }
  if (!items?.length) return { error: "This shipment has no line items." }

  const note = `Import ${shipmentRef ?? shipmentId} cleared`

  for (const item of items) {
    const qty = item.quantity_imported
    const { data: stockRow } = await supabase
      .from("stock")
      .select("id, quantity_available")
      .eq("product_id", item.product_id)
      .maybeSingle()

    const before = stockRow?.quantity_available ?? 0
    const after = roundMoney(before + qty, 3)
    const now = new Date().toISOString()

    if (stockRow) {
      const { error } = await supabase
        .from("stock")
        .update({ quantity_available: after, last_updated: now })
        .eq("product_id", item.product_id)
      if (error) return { error: error.message }
    } else {
      const { error } = await supabase.from("stock").insert({
        product_id: item.product_id,
        quantity_available: after,
        last_updated: now,
      })
      if (error) return { error: error.message }
    }

    const { error: movementError } = await supabase.from("stock_movements").insert({
      product_id: item.product_id,
      movement_type: "in",
      quantity: qty,
      quantity_before: before,
      quantity_after: after,
      ref_type: "import",
      ref_id: shipmentId,
      notes: note,
      created_by: actorId,
    })
    if (movementError) return { error: movementError.message }

    const { error: productError } = await supabase
      .from("products")
      .update({ last_import_id: shipmentId })
      .eq("id", item.product_id)
    if (productError) return { error: productError.message }
  }

  return {}
}
