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
// The most important action. Approving an order:
//   1. deducts stock for every line item
//   2. records a stock_movements row per item (audit trail)
//   3. flips the order to 'approved' (sets approved_by / approved_at)
//   4. logs the change in order_status_history
//   5. notifies the manager who created it and the customer
//
// Stock is read-then-written here for clarity (this business has a single
// godown and low order concurrency). If high concurrency ever matters, move
// this into a Postgres function/transaction for atomic decrements.
export async function approveOrder(
  orderId: string,
  note: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth
  const adminId = auth.userId

  const supabase = await createClient()

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .select("id, status, order_number, customer_id, created_by")
    .eq("id", orderId)
    .single()

  if (orderError || !order) return { error: "Order not found." }
  if (order.status !== "pending_approval") {
    return { error: "This order is no longer pending approval." }
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId)

  if (itemsError) return { error: itemsError.message }
  if (!items || items.length === 0) {
    return { error: "This order has no line items." }
  }

  const now = new Date().toISOString()

  // 1 + 2: deduct stock and record a movement per line item.
  for (const item of items) {
    const { data: stockRow, error: stockError } = await supabase
      .from("stock")
      .select("quantity_available")
      .eq("product_id", item.product_id)
      .single()

    if (stockError || !stockRow) {
      return { error: "A stock record is missing for one of the products." }
    }

    const before = stockRow.quantity_available
    const after = before - item.quantity

    const { error: stockUpdateError } = await supabase
      .from("stock")
      .update({ quantity_available: after, last_updated: now })
      .eq("product_id", item.product_id)

    if (stockUpdateError) return { error: stockUpdateError.message }

    const { error: movementError } = await supabase
      .from("stock_movements")
      .insert({
        product_id: item.product_id,
        movement_type: "out",
        quantity: item.quantity,
        quantity_before: before,
        quantity_after: after,
        ref_type: "sale",
        ref_id: orderId,
        notes: `Order ${order.order_number ?? ""} approved`,
        created_by: adminId,
      })

    if (movementError) return { error: movementError.message }
  }

  // 3: approve the order.
  const { error: updateError } = await supabase
    .from("sales_orders")
    .update({ status: "approved", approved_by: adminId, approved_at: now })
    .eq("id", orderId)

  if (updateError) return { error: updateError.message }

  // 4: status history.
  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: "pending_approval",
    to_status: "approved",
    note: note || null,
    changed_by: adminId,
  })

  // 5: notify manager + customer.
  const label = order.order_number ?? "your order"
  await supabase.from("notifications").insert([
    {
      user_id: order.created_by,
      type: "order_approved",
      title: "Order approved",
      message: `Order ${label} was approved.`,
      ref_id: orderId,
      ref_table: "sales_orders",
    },
    {
      user_id: order.customer_id,
      type: "order_approved",
      title: "Your order is approved",
      message: `Order ${label} has been approved and is being processed.`,
      ref_id: orderId,
      ref_table: "sales_orders",
    },
  ])

  revalidateOrderPaths(orderId)
}

// ── REJECT ORDER ───────────────────────────────────────────────────────────
// Rejecting does NOT touch stock (stock was never deducted while pending).
export async function rejectOrder(
  orderId: string,
  note: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth
  const adminId = auth.userId

  if (!note || note.trim().length === 0) {
    return { error: "A rejection reason is required." }
  }

  const supabase = await createClient()

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .select("id, status, order_number, created_by")
    .eq("id", orderId)
    .single()

  if (orderError || !order) return { error: "Order not found." }
  if (order.status !== "pending_approval") {
    return { error: "This order is no longer pending approval." }
  }

  const { error: updateError } = await supabase
    .from("sales_orders")
    .update({ status: "rejected", rejection_note: note })
    .eq("id", orderId)

  if (updateError) return { error: updateError.message }

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: "pending_approval",
    to_status: "rejected",
    note,
    changed_by: adminId,
  })

  await supabase.from("notifications").insert({
    user_id: order.created_by,
    type: "order_rejected",
    title: "Order rejected",
    message: `Order ${order.order_number ?? ""} was rejected: ${note}`,
    ref_id: orderId,
    ref_table: "sales_orders",
  })

  revalidateOrderPaths(orderId)
}

// ── APPROVE PRODUCT ────────────────────────────────────────────────────────
// (No note needed to approve; ApprovalButtons may still pass one — it's ignored.)
export async function approveProduct(
  productId: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth
  const adminId = auth.userId

  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .single()

  if (productError || !product) return { error: "Product not found." }
  if (product.status !== "pending_approval") {
    return { error: "This product is no longer pending approval." }
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({
      status: "active",
      approved_by: adminId,
      approved_at: new Date().toISOString(),
      rejection_note: null,
    })
    .eq("id", productId)

  if (updateError) return { error: updateError.message }

  revalidateProductPaths(productId)
}

// ── REJECT PRODUCT ─────────────────────────────────────────────────────────
export async function rejectProduct(
  productId: string,
  note: string
): Promise<ActionResult> {
  const auth = await requireAdmin()
  if ("error" in auth) return auth

  if (!note || note.trim().length === 0) {
    return { error: "A rejection reason is required." }
  }

  const supabase = await createClient()

  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, status")
    .eq("id", productId)
    .single()

  if (productError || !product) return { error: "Product not found." }
  if (product.status !== "pending_approval") {
    return { error: "This product is no longer pending approval." }
  }

  const { error: updateError } = await supabase
    .from("products")
    .update({ status: "rejected", rejection_note: note })
    .eq("id", productId)

  if (updateError) return { error: updateError.message }

  revalidateProductPaths(productId)
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
