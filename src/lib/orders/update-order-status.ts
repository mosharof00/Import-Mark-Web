import "server-only"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getAppSettings } from "@/lib/settings/get-settings"
import {
  getNextOrderStatus,
  isFulfillmentStatus,
  managerCanAccessOrder,
} from "@/lib/orders/status-flow"
import { maybeReserveStockForStatus } from "@/lib/stock/order-stock"
import { ORDER_STATUS_CONFIG } from "@/lib/constants"
import type { UserRole } from "@/lib/auth/roles"
import type { StockReserveOn } from "@/lib/settings/keys"
import type { DeliveryMethod, OrderStatus } from "@/types"

const STOCK_RESERVE_STATUSES: StockReserveOn[] = [
  "pending_approval",
  "approved",
  "delivered",
]

type ActionResult = { error?: string } | void

function revalidateOrderPaths(orderId: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  revalidatePath("/admin/reports")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/manager")
  revalidatePath("/manager/orders")
  revalidatePath("/manager/payments")
  revalidatePath(`/manager/orders/${orderId}`)
  revalidatePath("/manager/customers")
  revalidatePath("/customer/orders")
  revalidatePath(`/customer/orders/${orderId}`)
  revalidatePath("/customer/ledger")
}

async function authorizeFulfillmentUpdate(
  orderId: string,
  actorId: string,
  role: UserRole
) {
  const supabase = await createClient()
  const settings = await getAppSettings()

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .select(
      "id, status, order_number, customer_id, created_by, delivery_method, dispatched_at, paid_amount, total_amount, due_amount"
    )
    .eq("id", orderId)
    .single()

  if (orderError || !order) return { error: "Order not found." as const }

  const currentStatus = order.status as OrderStatus

  if (!isFulfillmentStatus(currentStatus)) {
    return {
      error: "Only approved orders in fulfillment can be updated." as const,
    }
  }

  if (role === "manager") {
    const canAccess = managerCanAccessOrder(
      { created_by: order.created_by, status: currentStatus },
      actorId,
      settings.manager_can_approve_orders
    )
    if (!canAccess) return { error: "Not authorized to update this order." as const }

    const { data: manager } = await supabase
      .from("managers")
      .select("id")
      .eq("id", actorId)
      .maybeSingle()
    if (!manager) return { error: "Not authorized." as const }
  } else if (role !== "admin") {
    return { error: "Not authorized." as const }
  }

  return { supabase, settings, order, currentStatus }
}

function buildStatusNotifications(
  order: {
    order_number: string | null
    customer_id: string
    created_by: string
  },
  orderId: string,
  statusLabel: string,
  delivered: boolean
) {
  const label = order.order_number ?? "your order"
  const title = delivered ? "Order delivered" : "Order update"
  const customerMessage = delivered
    ? `Order ${label} has been delivered.`
    : `Order ${label} is now ${statusLabel.toLowerCase()}.`

  const notifications = [
    {
      user_id: order.customer_id,
      type: "order_status_changed" as const,
      title,
      message: customerMessage,
      ref_id: orderId,
      ref_table: "sales_orders",
    },
  ]

  if (order.created_by !== order.customer_id) {
    notifications.push({
      user_id: order.created_by,
      type: "order_status_changed" as const,
      title: delivered ? "Order delivered" : "Order status updated",
      message: delivered
        ? `Order ${label} has been marked delivered.`
        : `Order ${label} is now ${statusLabel.toLowerCase()}.`,
      ref_id: orderId,
      ref_table: "sales_orders",
    })
  }

  return notifications
}

export async function updateOrderStatusCore(
  orderId: string,
  actorId: string,
  role: UserRole,
  note?: string,
  deliveryImageUrl?: string | null
): Promise<ActionResult> {
  const auth = await authorizeFulfillmentUpdate(orderId, actorId, role)
  if ("error" in auth) return auth

  const { supabase, settings, order, currentStatus } = auth
  const deliveryMethod = order.delivery_method as DeliveryMethod
  const nextStatus = getNextOrderStatus(currentStatus, deliveryMethod)

  if (!nextStatus) {
    return { error: "This order cannot be advanced further." }
  }

  const now = new Date().toISOString()
  const statusLabel = ORDER_STATUS_CONFIG[nextStatus].label
  const label = order.order_number ?? "your order"

  if (STOCK_RESERVE_STATUSES.includes(nextStatus as StockReserveOn)) {
    const stockResult = await maybeReserveStockForStatus(
      orderId,
      nextStatus as StockReserveOn,
      settings.stock_reserve_on,
      actorId,
      `Order ${label} marked ${statusLabel.toLowerCase()}`
    )
    if (stockResult?.error) return stockResult
  }

  const patch: {
    status: OrderStatus
    dispatched_at?: string
    delivered_at?: string
    delivery_image_url?: string | null
  } = { status: nextStatus }

  if (nextStatus === "out_for_delivery") {
    patch.dispatched_at = now
  }
  if (nextStatus === "delivered") {
    patch.delivered_at = now
    if (deliveryImageUrl?.trim()) {
      patch.delivery_image_url = deliveryImageUrl.trim()
    }
  }

  const { error: updateError } = await supabase
    .from("sales_orders")
    .update(patch)
    .eq("id", orderId)

  if (updateError) return { error: updateError.message }

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: currentStatus,
    to_status: nextStatus,
    note: note?.trim() || null,
    changed_by: actorId,
  })

  await supabase
    .from("notifications")
    .insert(
      buildStatusNotifications(
        order,
        orderId,
        statusLabel,
        nextStatus === "delivered"
      )
    )

  revalidateOrderPaths(orderId)
}

export async function markOrderDeliveredCore(
  orderId: string,
  actorId: string,
  role: UserRole,
  note?: string,
  deliveryImageUrl?: string | null
): Promise<ActionResult> {
  const auth = await authorizeFulfillmentUpdate(orderId, actorId, role)
  if ("error" in auth) return auth

  const { supabase, settings, order, currentStatus } = auth
  const deliveryMethod = order.delivery_method as DeliveryMethod
  const now = new Date().toISOString()
  const label = order.order_number ?? "your order"

  const stockResult = await maybeReserveStockForStatus(
    orderId,
    "delivered",
    settings.stock_reserve_on,
    actorId,
    `Order ${label} delivered`
  )
  if (stockResult?.error) return stockResult

  const patch: {
    status: "delivered"
    delivered_at: string
    dispatched_at?: string
    delivery_image_url?: string | null
  } = {
    status: "delivered",
    delivered_at: now,
  }

  if (
    deliveryMethod === "own_team" &&
    !order.dispatched_at &&
    currentStatus !== "out_for_delivery"
  ) {
    patch.dispatched_at = now
  }

  if (deliveryImageUrl?.trim()) {
    patch.delivery_image_url = deliveryImageUrl.trim()
  }

  const { error: updateError } = await supabase
    .from("sales_orders")
    .update(patch)
    .eq("id", orderId)

  if (updateError) return { error: updateError.message }

  await supabase.from("order_status_history").insert({
    order_id: orderId,
    from_status: currentStatus,
    to_status: "delivered",
    note: note?.trim() || "Marked delivered",
    changed_by: actorId,
  })

  await supabase
    .from("notifications")
    .insert(
      buildStatusNotifications(order, orderId, "Delivered", true)
    )

  revalidateOrderPaths(orderId)
}
