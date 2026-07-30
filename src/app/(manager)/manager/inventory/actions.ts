"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"

type ActionResult = { error?: string } | void

async function requireManager() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "manager") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

function revalidateInventoryPaths(productId: string) {
  revalidatePath("/manager")
  revalidatePath("/manager/inventory")
  revalidatePath(`/manager/products/${productId}`)
}

export async function adjustStock(
  productId: string,
  newQuantity: number,
  note: string
): Promise<ActionResult> {
  const auth = await requireManager()
  if ("error" in auth) return auth
  const managerId = auth.userId

  const { getAppSettings } = await import("@/lib/settings/get-settings")
  const settings = await getAppSettings()
  if (!settings.manager_can_adjust_stock) {
    return { error: "Stock adjustments are disabled for managers." }
  }

  if (!note || note.trim().length === 0) {
    return { error: "A note is required for stock adjustments." }
  }
  if (!Number.isFinite(newQuantity) || newQuantity < 0) {
    return { error: "Quantity must be zero or greater." }
  }

  const supabase = await createClient()

  const { data: stockRow, error: stockError } = await supabase
    .from("stock")
    .select("id, quantity_available")
    .eq("product_id", productId)
    .single()

  if (stockError || !stockRow) {
    return { error: "Stock record not found for this product." }
  }

  const before = stockRow.quantity_available
  if (before === newQuantity) {
    return { error: "New quantity is the same as current stock." }
  }

  const now = new Date().toISOString()
  const delta = Math.abs(newQuantity - before)

  const { error: updateError } = await supabase
    .from("stock")
    .update({ quantity_available: newQuantity, last_updated: now })
    .eq("product_id", productId)

  if (updateError) return { error: updateError.message }

  const { error: movementError } = await supabase
    .from("stock_movements")
    .insert({
      product_id: productId,
      movement_type: "adjustment",
      quantity: delta,
      quantity_before: before,
      quantity_after: newQuantity,
      ref_type: "manual_adjustment",
      ref_id: productId,
      notes: note.trim(),
      created_by: managerId,
    })

  if (movementError) return { error: movementError.message }

  revalidateInventoryPaths(productId)
}

export async function updateStockThreshold(
  productId: string,
  threshold: number
): Promise<ActionResult> {
  const auth = await requireManager()
  if ("error" in auth) return auth

  if (!Number.isFinite(threshold) || threshold < 0) {
    return { error: "Threshold must be zero or greater." }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("stock")
    .update({
      low_stock_threshold: threshold,
      last_updated: new Date().toISOString(),
    })
    .eq("product_id", productId)

  if (error) return { error: error.message }

  revalidateInventoryPaths(productId)
}
