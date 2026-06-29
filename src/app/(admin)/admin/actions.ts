"use server"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getAuthedUser } from "@/lib/auth/get-user"

type ActionResult = { error?: string } | void

/** Keeps dashboard, approvals, and product screens in sync after mutations. */
function revalidateProductPaths(productId: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/approvals")
  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${productId}`)
}

/** Keeps order list, detail, and dashboard approval widgets in sync. */
function revalidateOrderPaths(orderId: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/approvals")
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
}

/**
 * Ensures the caller is a signed-in admin. Returns the admin user id, or an
 * error result the action can return directly. RLS also enforces this at the
 * database level — this is a fast, friendly guard.
 */
async function requireAdmin() {
  const { user, role } = await getAuthedUser()
  if (!user || role !== "admin") {
    return { error: "You are not authorized to perform this action." as string }
  }
  return { userId: user.id }
}

// ── APPROVE ORDER ──────────────────────────────────────────────────────────
export async function approveOrder(
  orderId: string,
  note: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth
  const { approveOrderCore } = await import("@/lib/orders/approve-order")
  return approveOrderCore(orderId, auth.userId, "admin", note)
}

// ── REJECT ORDER ───────────────────────────────────────────────────────────
export async function rejectOrder(
  orderId: string,
  note: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth
  const { rejectOrderCore } = await import("@/lib/orders/approve-order")
  return rejectOrderCore(orderId, auth.userId, "admin", note)
}

// ── APPROVE PRODUCT ────────────────────────────────────────────────────────
export async function approveProduct(
  productId: string,
  _note?: string
): Promise<ActionResult> {
  const { approveProductAsRole } = await import("@/lib/orders/approval-actions")
  return approveProductAsRole(productId, "")
}

// ── REJECT PRODUCT ─────────────────────────────────────────────────────────
export async function rejectProduct(
  productId: string,
  note: string
): Promise<ActionResult> {
  const { rejectProductAsRole } = await import("@/lib/orders/approval-actions")
  return rejectProductAsRole(productId, note)
}

// ── DEACTIVATE PRODUCT ─────────────────────────────────────────────────────
// Takes an active product off the catalog without deleting it.
export async function deactivateProduct(
  productId: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .single()

  if (productError || !product) return { error: "Product not found." }
  if (product.status !== "active") {
    return { error: "Only active products can be deactivated." }
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ status: "inactive" })
    .eq("id", productId)

  if (updateError) return { error: updateError.message }

  revalidateProductPaths(productId)
}

// ── REACTIVATE PRODUCT ─────────────────────────────────────────────────────
export async function reactivateProduct(
  productId: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .single()

  if (productError || !product) return { error: "Product not found." }
  if (product.status !== "inactive") {
    return { error: "Only inactive products can be reactivated." }
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ status: "active", rejection_note: null })
    .eq("id", productId)

  if (updateError) return { error: updateError.message }

  revalidateProductPaths(productId)
}
