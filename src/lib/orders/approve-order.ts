import "server-only"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getAppSettings } from "@/lib/settings/get-settings"
import {
  maybeReserveStockForStatus,
  restoreOrderStock,
} from "@/lib/stock/order-stock"
import type { UserRole } from "@/lib/auth/roles"

type ActionResult = { error?: string } | void

function revalidateOrderPaths(orderId: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/approvals")
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/manager")
  revalidatePath("/manager/orders")
  revalidatePath(`/manager/orders/${orderId}`)
  revalidatePath("/customer/orders")
  revalidatePath(`/customer/orders/${orderId}`)
}

export async function approveOrderCore(
  orderId: string,
  actorId: string,
  role: UserRole,
  note: string
): Promise<ActionResult> {
  const supabase = await createClient()
  const settings = await getAppSettings()

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .select("id, status, order_number, customer_id, created_by")
    .eq("id", orderId)
    .single()

  if (orderError || !order) return { error: "Order not found." }
  if (order.status !== "pending_approval") {
    return { error: "This order is no longer pending approval." }
  }

  if (role === "manager") {
    const { data: manager } = await supabase
      .from("managers")
      .select("id")
      .eq("id", actorId)
      .maybeSingle()
    if (!manager) return { error: "Not authorized." }
  }

  const now = new Date().toISOString()
  const label = order.order_number ?? "your order"

  const stockResult = await maybeReserveStockForStatus(
    orderId,
    "approved",
    settings.stock_reserve_on,
    actorId,
    `Order ${label} approved`
  )
  if (stockResult?.error) return stockResult

  const { error: updateError } = await supabase
    .from("sales_orders")
    .update({
      status: "approved",
      approved_by: actorId,
      approved_at: now,
    })
    .eq("id", orderId)

  if (updateError) return { error: updateError.message }

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: "pending_approval",
    to_status: "approved",
    note: note || null,
    changed_by: actorId,
  })

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

export async function rejectOrderCore(
  orderId: string,
  actorId: string,
  role: UserRole,
  note: string
): Promise<ActionResult> {
  if (!note?.trim()) {
    return { error: "A rejection reason is required." }
  }

  const supabase = await createClient()
  const settings = await getAppSettings()

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .select("id, status, order_number, created_by, customer_id")
    .eq("id", orderId)
    .single()

  if (orderError || !order) return { error: "Order not found." }
  if (order.status !== "pending_approval") {
    return { error: "This order is no longer pending approval." }
  }

  if (role === "manager") {
    const { data: manager } = await supabase
      .from("managers")
      .select("id")
      .eq("id", actorId)
      .maybeSingle()
    if (!manager) return { error: "Not authorized." }
  }

  if (settings.stock_reserve_on === "pending_approval") {
    const restore = await restoreOrderStock(
      orderId,
      actorId,
      `Order ${order.order_number ?? ""} rejected`
    )
    if (restore?.error) return restore
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
    changed_by: actorId,
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
