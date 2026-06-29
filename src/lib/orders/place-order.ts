import "server-only"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatTaka } from "@/lib/format"
import { getAppSettings } from "@/lib/settings/get-settings"
import { maybeReserveStockForStatus } from "@/lib/stock/order-stock"
import type { PlaceOrderInput } from "@/lib/validations/order"

type ActionResult = { error?: string; orderId?: string }

function revalidateOrderPaths(orderId: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/approvals")
  revalidatePath("/manager")
  revalidatePath("/manager/orders")
  revalidatePath(`/manager/orders/${orderId}`)
  revalidatePath("/manager/customers")
  revalidatePath("/manager/payments")
  revalidatePath("/customer/orders")
  revalidatePath(`/customer/orders/${orderId}`)
}

export async function placeOrderCore(
  data: PlaceOrderInput,
  actorId: string,
  actorRole: "manager" | "customer"
): Promise<ActionResult> {
  const settings = await getAppSettings()

  if (actorRole === "customer" && !settings.customer_can_place_orders) {
    return { error: "Customer ordering is currently disabled." }
  }

  const supabase = await createClient()

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, full_name, status")
    .eq("id", data.customerId)
    .single()

  if (customerError || !customer) {
    return { error: "Customer not found." }
  }
  if (customer.status !== "active") {
    return { error: "Orders can only be placed for active customers." }
  }

  if (actorRole === "customer" && data.customerId !== actorId) {
    return { error: "You can only place orders for your own account." }
  }

  if (data.deliveryMethod === "own_team" && data.addressId) {
    const { data: address, error: addressError } = await supabase
      .from("customer_addresses")
      .select("id, customer_id")
      .eq("id", data.addressId)
      .eq("customer_id", data.customerId)
      .maybeSingle()

    if (addressError || !address) {
      return { error: "Selected delivery address is invalid." }
    }
  }

  const { data: gateway, error: gatewayError } = await supabase
    .from("payment_gateways")
    .select("id, type, status")
    .eq("id", data.paymentGatewayId)
    .eq("status", "active")
    .maybeSingle()

  if (gatewayError || !gateway) {
    return { error: "Selected payment gateway is invalid." }
  }

  const productIds = data.items.map((i) => i.productId)
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, status, sell_price")
    .in("id", productIds)

  if (productsError || !products?.length) {
    return { error: "One or more products could not be found." }
  }

  const productMap = new Map(products.map((p) => [p.id, p]))

  for (const item of data.items) {
    const product = productMap.get(item.productId)
    if (!product || product.status !== "active") {
      return { error: "One or more products are no longer active." }
    }
    if (
      actorRole === "manager" &&
      !settings.manager_can_override_sell_price &&
      item.unitPrice !== product.sell_price
    ) {
      return { error: "You cannot change the catalog sell price for this order." }
    }
  }

  const { data: stockRows, error: stockError } = await supabase
    .from("stock")
    .select("product_id, quantity_available")
    .in("product_id", productIds)

  if (stockError) return { error: stockError.message }

  const stockMap = new Map(
    (stockRows ?? []).map((s) => [s.product_id, s.quantity_available])
  )

  for (const item of data.items) {
    const available = stockMap.get(item.productId) ?? 0
    if (item.quantity > available) {
      const name = productMap.get(item.productId)?.name ?? "Product"
      return {
        error: `${name}: only ${available} unit${available === 1 ? "" : "s"} available.`,
      }
    }
  }

  const subtotal = data.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  if (settings.require_advance_payment && data.advancePaid <= 0) {
    return { error: "An advance payment is required for new orders." }
  }

  if (settings.require_advance_payment && settings.min_advance_payment_percent > 0) {
    const minAdvance = (subtotal * settings.min_advance_payment_percent) / 100
    if (data.advancePaid < minAdvance) {
      return {
        error: `Advance payment must be at least ${formatTaka(minAdvance)} (${settings.min_advance_payment_percent}% of total).`,
      }
    }
  }

  if (data.advancePaid > subtotal) {
    return {
      error: `Advance paid cannot exceed the order total of ${formatTaka(subtotal)}.`,
    }
  }

  const today = new Date().toISOString().slice(0, 10)

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .insert({
      customer_id: data.customerId,
      created_by: actorId,
      delivery_method: data.deliveryMethod,
      address_id: data.deliveryMethod === "own_team" ? data.addressId : null,
      payment_gateway_id: data.paymentGatewayId,
      payment_mode: gateway.type,
      subtotal,
      total_amount: subtotal,
      discount_amount: 0,
      payment_note: data.paymentReference?.trim() || null,
      notes: data.orderNotes?.trim() || null,
      status: "pending_approval",
    })
    .select("id, order_number")
    .single()

  if (orderError || !order) {
    return { error: orderError?.message ?? "Could not create order." }
  }

  const orderItems = data.items.map((item) => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    discount: 0,
  }))

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)

  if (itemsError) {
    await supabase.from("sales_orders").delete().eq("id", order.id)
    return { error: itemsError.message }
  }

  if (data.advancePaid > 0) {
    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      customer_id: data.customerId,
      amount: data.advancePaid,
      payment_mode: gateway.type,
      payment_date: today,
      reference_no: data.paymentReference?.trim() || null,
      recorded_by: actorId,
    })

    if (paymentError) {
      await supabase.from("order_items").delete().eq("order_id", order.id)
      await supabase.from("sales_orders").delete().eq("id", order.id)
      return { error: paymentError.message }
    }
  }

  const historyNote =
    actorRole === "customer"
      ? "Order placed by customer"
      : "Order created by manager"

  const { error: historyError } = await supabase
    .from("order_status_history")
    .insert({
      order_id: order.id,
      from_status: null,
      to_status: "pending_approval",
      note: historyNote,
      changed_by: actorId,
    })

  if (historyError) {
    await supabase.from("payments").delete().eq("order_id", order.id)
    await supabase.from("order_items").delete().eq("order_id", order.id)
    await supabase.from("sales_orders").delete().eq("id", order.id)
    return { error: historyError.message }
  }

  const stockResult = await maybeReserveStockForStatus(
    order.id,
    "pending_approval",
    settings.stock_reserve_on,
    actorId,
    `Order ${order.order_number ?? ""} placed`
  )

  if (stockResult?.error) {
    await supabase.from("payments").delete().eq("order_id", order.id)
    await supabase.from("order_items").delete().eq("order_id", order.id)
    await supabase.from("sales_orders").delete().eq("id", order.id)
    return stockResult
  }

  const { data: admins } = await supabase
    .from("admins")
    .select("id")
    .eq("is_active", true)

  const orderLabel = order.order_number ?? "New order"
  const notifications: {
    user_id: string
    type: "order_pending_approval"
    title: string
    message: string
    ref_id: string
    ref_table: "sales_orders"
  }[] = []

  if (admins?.length) {
    for (const admin of admins) {
      notifications.push({
        user_id: admin.id,
        type: "order_pending_approval",
        title: "New order awaiting approval",
        message: `Order ${orderLabel} from ${customer.full_name} — ${formatTaka(subtotal)}`,
        ref_id: order.id,
        ref_table: "sales_orders",
      })
    }
  }

  if (settings.manager_can_approve_orders) {
    const { data: managers } = await supabase.from("managers").select("id")
    for (const manager of managers ?? []) {
      if (manager.id === actorId) continue
      notifications.push({
        user_id: manager.id,
        type: "order_pending_approval",
        title: "New order awaiting approval",
        message: `Order ${orderLabel} from ${customer.full_name} — ${formatTaka(subtotal)}`,
        ref_id: order.id,
        ref_table: "sales_orders",
      })
    }
  }

  if (notifications.length) {
    await supabase.from("notifications").insert(notifications)
  }

  revalidateOrderPaths(order.id)
  return { orderId: order.id }
}
