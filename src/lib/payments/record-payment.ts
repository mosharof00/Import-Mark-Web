import "server-only"

import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { formatTaka } from "@/lib/format"
import { notifyPaymentRecorded } from "@/lib/notifications/create-notifications"
import type { UserRole } from "@/lib/auth/roles"
import type { RecordPaymentInput } from "@/lib/validations/payment"

type ActionResult = { error?: string; paymentId?: string } | void

function revalidatePaymentPaths(orderId: string, customerId: string) {
  revalidatePath("/admin")
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  revalidatePath("/admin/payments")
  revalidatePath("/admin/notifications")
  revalidatePath("/manager")
  revalidatePath("/manager/orders")
  revalidatePath(`/manager/orders/${orderId}`)
  revalidatePath("/manager/payments")
  revalidatePath("/manager/notifications")
  revalidatePath(`/manager/customers/${customerId}`)
  revalidatePath("/customer/orders")
  revalidatePath(`/customer/orders/${orderId}`)
  revalidatePath("/customer/ledger")
  revalidatePath("/customer/notifications")
}

export async function recordPaymentCore(
  data: RecordPaymentInput,
  actorId: string,
  role: UserRole
): Promise<ActionResult> {
  if (role !== "admin" && role !== "manager") {
    return { error: "Not authorized." }
  }

  const supabase = await createClient()

  const { data: order, error: orderError } = await supabase
    .from("sales_orders")
    .select(
      "id, customer_id, due_amount, status, order_number, created_by, payment_gateway_id"
    )
    .eq("id", data.orderId)
    .single()

  if (orderError || !order) return { error: "Order not found." }

  if (order.status === "rejected" || order.status === "cancelled") {
    return { error: "Payments cannot be recorded on closed orders." }
  }

  if (role === "manager") {
    const { data: manager } = await supabase
      .from("managers")
      .select("id")
      .eq("id", actorId)
      .maybeSingle()
    if (!manager) return { error: "Not authorized." }
  }

  const due = order.due_amount ?? 0
  if (due <= 0) {
    return { error: "This order has no outstanding balance." }
  }
  if (data.amount > due) {
    return {
      error: `Amount cannot exceed the due balance of ${formatTaka(due)}.`,
    }
  }

  let paymentMode = data.paymentMode
  let gatewayId = data.paymentGatewayId?.trim() || null

  if (gatewayId) {
    const { data: gateway, error: gatewayError } = await supabase
      .from("payment_gateways")
      .select("id, type, status")
      .eq("id", gatewayId)
      .maybeSingle()

    if (gatewayError || !gateway || gateway.status !== "active") {
      return { error: "Selected payment gateway is invalid." }
    }
    paymentMode = gateway.type
  } else if (order.payment_gateway_id) {
    gatewayId = order.payment_gateway_id
  }

  const proofUrl = data.proofImageUrl?.trim() || null

  const { data: payment, error: insertError } = await supabase
    .from("payments")
    .insert({
      order_id: order.id,
      customer_id: order.customer_id,
      amount: data.amount,
      payment_mode: paymentMode,
      payment_date: data.paymentDate,
      payment_gateway_id: gatewayId,
      reference_no: data.referenceNo?.trim() || null,
      notes: data.notes?.trim() || null,
      proof_image_url: proofUrl,
      recorded_by: actorId,
    })
    .select("id")
    .single()

  if (insertError) return { error: insertError.message }

  await notifyPaymentRecorded({
    actorId,
    actorRoleLabel: role === "admin" ? "Admin" : "Manager",
    customerId: order.customer_id,
    orderId: order.id,
    orderNumber: order.order_number,
    amountLabel: formatTaka(data.amount),
  })

  revalidatePaymentPaths(order.id, order.customer_id)
  return { paymentId: payment?.id }
}
